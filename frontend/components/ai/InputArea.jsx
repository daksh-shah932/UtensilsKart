"use client";

import { useState, useRef, useEffect } from "react";

export default function InputArea({ onSend, isLoading }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 140) + "px";
    }
  }, [text]);

  const handleSubmit = () => {
    if (text.trim() && !isLoading) {
      onSend(text.trim());
      setText("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <footer className="kg-input-area">
      <div className="kg-input-box">
        <textarea
          ref={textareaRef}
          id="kg-chat-input"
          className="kg-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything… e.g. 'I need cookware for a family of 4' or 'Student going abroad'"
          rows={1}
          disabled={isLoading}
        />

        <button
          id="kg-send-btn"
          className="kg-send-btn"
          onClick={handleSubmit}
          disabled={!text.trim() || isLoading}
          aria-label="Send message"
        >
          {isLoading ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" opacity="0.3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
              </path>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </div>

      <p className="kg-input-hint">
        KitchenGenie can make mistakes. Verify product details before purchase.
      </p>
    </footer>
  );
}
