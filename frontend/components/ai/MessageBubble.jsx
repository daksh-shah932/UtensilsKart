"use client";

import ProductRecommendationCard from "./ProductRecommendationCard";

export default function MessageBubble({ message, onOptionSelect }) {
  const isUser = message.role === "user";
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`kg-message-item ${isUser ? "user" : "assistant"}`}>
      {!isUser && <div className="kg-avatar ai">🍳</div>}

      <div className="kg-message-body">
        <div className={`kg-bubble ${isUser ? "user" : "ai"} ${message.isError ? "error" : ""}`}>
          <FormattedText text={message.content} />
        </div>

        <div className="kg-message-time">{time}</div>

        {/* Quick Reply Options */}
        {message.options && message.options.length > 0 && !message.optionSelected && (
          <div className="flex flex-wrap gap-2 mt-3">
            {message.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => onOptionSelect && onOptionSelect(option.value || option.label, message.id)}
                className="px-4 py-2.5 bg-white/5 border border-accent/30 text-[var(--color-text-primary)] text-[13px] font-medium rounded-lg hover:bg-accent/10 hover:border-accent transition-all active:scale-95"
              >
                {option.icon && <span className="mr-1.5">{option.icon}</span>}
                {option.label}
              </button>
            ))}
          </div>
        )}

        {/* Product Recommendations */}
        {message.recommendedProducts && message.recommendedProducts.length > 0 && (
          <div className="kg-recs">
            <div className="kg-recs-header">
              <span className="kg-recs-badge">Recommended for you</span>
              <span className="kg-recs-count">
                {message.recommendedProducts.length} product
                {message.recommendedProducts.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="kg-products-grid">
              {message.recommendedProducts.map((product) => (
                <ProductRecommendationCard key={product.id || product.firestoreId} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>

      {isUser && <div className="kg-avatar user">U</div>}
    </div>
  );
}

function FormattedText({ text }) {
  if (!text) return null;

  const lines = text.split("\n");

  return (
    <div className="kg-formatted">
      {lines.map((line, i) => {
        // ### Header
        if (line.startsWith("### ")) {
          return <h4 key={i} className="kg-h4">{line.replace("### ", "")}</h4>;
        }
        // ## Header
        if (line.startsWith("## ")) {
          return <h3 key={i} className="kg-h3">{line.replace("## ", "")}</h3>;
        }
        // Bullet points
        if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
          const content = line.trim().replace(/^[*\-]\s+/, "");
          return <li key={i} className="kg-li">{renderBold(content)}</li>;
        }
        // Numbered list
        const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={i} className="kg-num-item">
              <span className="kg-num-badge">{numMatch[1]}</span>
              <span>{renderBold(numMatch[2])}</span>
            </div>
          );
        }
        // Empty line
        if (line.trim() === "") return <div key={i} className="kg-space" />;
        // Regular paragraph
        return <p key={i} className="kg-p">{renderBold(line)}</p>;
      })}
    </div>
  );
}

function renderBold(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, j) => (j % 2 === 1 ? <strong key={j}>{part}</strong> : part));
}
