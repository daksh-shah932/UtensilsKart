"use client";

import MessageBubble from "./MessageBubble";

const WELCOME_SUGGESTIONS = [
  {
    icon: "🎓",
    title: "Student Going Abroad",
    subtitle: "Compact & lightweight picks",
    text: "I'm a student going abroad with a 20kg luggage limit. What utensils should I buy?",
  },
  {
    icon: "🏠",
    title: "New Home Setup",
    subtitle: "Family of 4 · South Indian cooking",
    text: "South Indian family of 4 setting up a new home. Need complete kitchen utensils.",
  },
  {
    icon: "👫",
    title: "Starter Kitchen",
    subtitle: "Couple · Budget under ₹3000",
    text: "Young couple moving into a new apartment. Need essential cookware under ₹3000.",
  },
  {
    icon: "🍛",
    title: "North Indian Cooking",
    subtitle: "Roti, dal, sabzi & curries",
    text: "I cook North Indian food daily (roti, dal, sabzi). What cookware is best for me?",
  },
];

export default function ChatWindow({ messages, isLoading, onSamplePrompt, onOptionSelect, chatEndRef }) {
  const isEmpty = messages.length === 0;

  return (
    <div className="kg-chat-thread">
      {isEmpty ? (
        <WelcomeScreen onSamplePrompt={onSamplePrompt} />
      ) : (
        <div className="kg-messages-list">
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} index={i} onOptionSelect={onOptionSelect} />
          ))}
          {isLoading && <TypingBubble />}
        </div>
      )}
      <div ref={chatEndRef} />
    </div>
  );
}

function WelcomeScreen({ onSamplePrompt }) {
  return (
    <div className="kg-welcome">
      <div className="kg-welcome-badge">✦ Personal Kitchen Assistant</div>
      <h1 className="kg-welcome-title">How can I help you cook today?</h1>
      <p className="kg-welcome-subtitle">
        Tell me your situation — moving abroad, setting up a new kitchen, or upgrading your
        cookware — and I'll ask a couple of quick questions to find your perfect products.
      </p>

      <div className="kg-suggestion-grid">
        {WELCOME_SUGGESTIONS.map((item, i) => (
          <div
            key={i}
            className="kg-suggestion-card"
            id={`kg-suggestion-${i}`}
            role="button"
            tabIndex={0}
            onClick={() => onSamplePrompt(item.text)}
            onKeyDown={(e) => e.key === "Enter" && onSamplePrompt(item.text)}
          >
            <div className="kg-sug-icon">{item.icon}</div>
            <div className="kg-sug-content">
              <div className="kg-sug-title">{item.title}</div>
              <div className="kg-sug-subtitle">{item.subtitle}</div>
            </div>
            <div className="kg-sug-arrow">→</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="kg-message-item assistant">
      <div className="kg-avatar ai">🍳</div>
      <div className="kg-message-body">
        <div className="kg-bubble ai kg-typing-bubble">
          <div className="kg-typing">
            <span className="kg-dot" />
            <span className="kg-dot" />
            <span className="kg-dot" />
          </div>
        </div>
      </div>
    </div>
  );
}
