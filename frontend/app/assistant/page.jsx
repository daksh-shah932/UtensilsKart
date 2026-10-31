"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { 
  Sparkles, 
  Send, 
  GraduationCap, 
  Home, 
  Gift, 
  ArrowUpCircle, 
  MessageSquarePlus, 
  MessageSquare,
  Check,
  ShoppingBag,
  AlertTriangle,
  Clock,
  Star
} from "lucide-react";
import { useCart } from "@/lib/providers/CartProvider";
import ReactMarkdown from "react-markdown";
import { getProductPrimaryImage } from "@/lib/utils/productImages";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4001";

// Helper to generate unique IDs
const generateId = () => 
  Date.now().toString(36) + Math.random().toString(36).substring(2, 8);

// ── Priority Product Grid Component ───────────────────────────────────────────
const PRIORITY_CONFIG = {
  high: {
    label: "🔴 High Priority — Buy First",
    sublabel: "Essential for daily cooking",
    borderColor: "border-red-200",
    bgColor: "bg-red-50",
    badgeClass: "bg-red-100 text-red-700 border border-red-200",
    Icon: AlertTriangle,
    iconClass: "text-red-500",
  },
  medium: {
    label: "🟡 Medium Priority — Get Soon",
    sublabel: "Significantly improves cooking",
    borderColor: "border-amber-200",
    bgColor: "bg-amber-50",
    badgeClass: "bg-amber-100 text-amber-700 border border-amber-200",
    Icon: Clock,
    iconClass: "text-amber-500",
  },
  low: {
    label: "🟢 Nice to Have",
    sublabel: "Convenience upgrades, buy later",
    borderColor: "border-green-200",
    bgColor: "bg-green-50",
    badgeClass: "bg-green-100 text-green-700 border border-green-200",
    Icon: Star,
    iconClass: "text-green-500",
  },
};

function ProductCard({ p, isAdded, onAddToCart, priority, cartQuantity, onUpdateQuantity }) {
  const imgSrc = getProductPrimaryImage(p);
  const formattedPrice = typeof p.price === "number" ? p.price.toLocaleString("en-IN") : p.price;
  const pConfig = priority ? PRIORITY_CONFIG[priority] : null;
  const inCart = cartQuantity > 0;

  return (
    <div className="bg-white rounded-2xl border border-ink/10 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {/* Product Thumbnail */}
      <div className="h-32 bg-[#f5f0ed] relative w-full overflow-hidden">
        <Image
          src={imgSrc}
          alt={p.name || "Kitchen Utensil"}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 300px"
        />
        {pConfig && (
          <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${pConfig.badgeClass}`}>
            {priority}
          </span>
        )}
        {p.category && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider">
            {p.category}
          </span>
        )}
      </div>

      {/* Product Details */}
      <div className="p-3.5 flex flex-col flex-1">
        <div className="text-[10px] text-ink-muted font-bold uppercase tracking-wider mb-0.5 truncate">
          {p.brand || "UtensilKart"}
        </div>
        <h3 className="font-display font-semibold text-[14px] text-ink line-clamp-2 leading-snug mb-3">
          {p.name}
        </h3>
        <div className="mt-auto pt-2 border-t border-ink/5 flex items-center justify-between gap-2">
          <div className="font-display font-bold text-[16px] text-brand">
            ₹{formattedPrice}
          </div>
          
          {inCart ? (
            /* Quantity Adjuster */
            <div className="flex items-center gap-2 bg-[#f5f0ed] rounded-lg px-2 py-1">
              <button
                onClick={() => onUpdateQuantity(p, cartQuantity - 1)}
                className="w-6 h-6 flex items-center justify-center rounded bg-white hover:bg-accent hover:text-white transition-all text-ink font-bold text-[14px]"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="font-bold text-[14px] text-ink min-w-[20px] text-center">
                {cartQuantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(p, cartQuantity + 1)}
                className="w-6 h-6 flex items-center justify-center rounded bg-white hover:bg-accent hover:text-white transition-all text-ink font-bold text-[14px]"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          ) : (
            /* Add to Cart Button */
            <button
              onClick={() => onAddToCart(p)}
              className={`px-3 py-1.5 rounded-lg font-semibold text-[12px] transition-all flex items-center gap-1 ${
                isAdded
                  ? "bg-[#27ae60] text-white"
                  : "bg-accent hover:bg-accent-light text-white shadow-sm"
              }`}
            >
              {isAdded ? (<><Check size={13} />Added</>) : "Add to Cart"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PriorityProductGrid({ products, addedItems, onAddToCart, cartItems, onUpdateQuantity }) {
  const hasPriorities = products.some((p) => p._priority);

  if (!hasPriorities) {
    // Flat grid — no priorities assigned
    return (
      <div className="w-full mt-4">
        <div className="text-[12px] font-bold text-ink-muted uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <ShoppingBag size={14} className="text-accent" />
          Recommended Kitchenware ({products.length})
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              p={p}
              isAdded={!!addedItems[p.id]}
              onAddToCart={onAddToCart}
              priority={null}
              cartQuantity={cartItems[p.id] || 0}
              onUpdateQuantity={onUpdateQuantity}
            />
          ))}
        </div>
      </div>
    );
  }

  // Grouped by priority
  const high = products.filter((p) => p._priority === "high");
  const medium = products.filter((p) => p._priority === "medium");
  const low = products.filter((p) => p._priority === "low");
  const other = products.filter((p) => !p._priority);

  const sections = [
    { key: "high", items: high },
    { key: "medium", items: medium },
    { key: "low", items: low },
  ].filter((s) => s.items.length > 0);

  return (
    <div className="w-full mt-4 space-y-5">
      <div className="text-[12px] font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
        <ShoppingBag size={14} className="text-accent" />
        Your Personalised Kitchen List ({products.length} items)
      </div>

      {sections.map(({ key, items }) => {
        const cfg = PRIORITY_CONFIG[key];
        return (
          <div key={key} className={`rounded-2xl border ${cfg.borderColor} ${cfg.bgColor} p-4`}>
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-3">
              <cfg.Icon size={15} className={cfg.iconClass} />
              <div>
                <div className="font-bold text-[13px] text-ink">{cfg.label}</div>
                <div className="text-[11px] text-ink-muted">{cfg.sublabel}</div>
              </div>
            </div>
            {/* Product Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((p) => (
                <ProductCard
                  key={p.id}
                  p={p}
                  isAdded={!!addedItems[p.id]}
                  onAddToCart={onAddToCart}
                  priority={key}
                  cartQuantity={cartItems[p.id] || 0}
                  onUpdateQuantity={onUpdateQuantity}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Unprioritised items fallback */}
      {other.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {other.map((p) => (
            <ProductCard
              key={p.id}
              p={p}
              isAdded={!!addedItems[p.id]}
              onAddToCart={onAddToCart}
              priority={null}
              cartQuantity={cartItems[p.id] || 0}
              onUpdateQuantity={onUpdateQuantity}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Quick Scenarios ───────────────────────────────────────────────────────────
export default function AssistantPage() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [aiStatus, setAiStatus] = useState("checking");
  const [chatHistory, setChatHistory] = useState([]);
  const [addedItems, setAddedItems] = useState({});
  const [cartQuantities, setCartQuantities] = useState({}); // Track quantities locally
  
  const [sessionId, setSessionId] = useState("");
  const [chatId, setChatId] = useState("");

  const chatContainerRef = useRef(null);
  const { addToCart, updateQuantity, removeFromCart, items: cartItems } = useCart();

  // Sync local cart quantities from CartProvider
  useEffect(() => {
    const quantities = {};
    cartItems.forEach(item => {
      quantities[item.id] = item.quantity;
    });
    setCartQuantities(quantities);
  }, [cartItems]);

  // Scroll strictly within the chat container — NEVER scroll the outer window
  const scrollToBottom = useCallback((behavior = "smooth") => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior,
      });
    }
  }, []);

  const fetchHistory = useCallback(async (sid) => {
    if (!sid) return;
    try {
      const res = await fetch(`${API_BASE}/api/ai/history?sessionId=${sid}`);
      if (res.ok) {
        const data = await res.json();
        setChatHistory(data.history || []);
      }
    } catch (err) {
      console.error("[Assistant] Failed to load history:", err);
    }
  }, []);

  // Initialize Session ID & Load History on mount
  useEffect(() => {
    let sid = "";
    try {
      sid = localStorage.getItem("kg_session_id") || "";
      if (!sid) {
        sid = generateId();
        localStorage.setItem("kg_session_id", sid);
      }
    } catch {
      sid = generateId();
    }
    
    setSessionId(sid);
    setChatId(generateId());

    // Check backend health
    fetch(`${API_BASE}/api/ai/health`)
      .then((r) => r.json())
      .then((data) => setAiStatus(data.status))
      .catch(() => setAiStatus("offline"));

    // Load past chat sessions
    fetchHistory(sid);
  }, [fetchHistory]);

  // Smooth scroll container whenever messages or loading state change
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom("smooth");
    }, 80);
    return () => clearTimeout(timer);
  }, [messages, isLoading, scrollToBottom]);

  const handleNewChat = () => {
    setMessages([]);
    setChatId(generateId());
  };

  const loadPastChat = (pastChat) => {
    setChatId(pastChat.id);
    setMessages(pastChat.messages || []);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setAddedItems((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  const handleUpdateQuantity = (product, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(product.id);
    } else {
      updateQuantity(product.id, newQuantity);
    }
  };

  const sendMessage = async (text) => {
    if (!text || !text.trim() || isLoading) return;
    
    const userText = text.trim();
    setInput("");
    const userMsg = { id: generateId(), role: "user", content: userText };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: newMessages,
          sessionId,
          chatId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error (${res.status})`);
      }

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "assistant",
          content: data.reply || "Here are some recommendations based on your request:",
          products: data.recommended_products || [],
          options: data.options || null, // Backend can now send { options: [{label, value, icon}] }
        },
      ]);

      // Refresh sidebar history in background
      fetchHistory(sessionId);
    } catch (err) {
      console.error("[Assistant] Send error:", err);
      console.error("[Assistant] Error stack:", err.stack);
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "assistant",
          content: `⚠️ ${err.message || "Could not reach the AI service. Please ensure the backend is running on port 4001."}`,
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleOptionSelect = (optionValue, messageId) => {
    // Mark the option as selected to hide buttons
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, optionSelected: true } : msg
      )
    );
    // Send the selected option as the user's next message
    sendMessage(optionValue);
  };

  const QUICK_SCENARIOS = [
    { icon: Home, title: "New Kitchen Setup", desc: "Get a full checklist + priority buying guide" },
    { icon: GraduationCap, title: "Student Going Abroad", desc: "Compact essentials under luggage limit" },
    { icon: Gift, title: "Gifting Ideas", desc: "Premium sets under ₹2000 for any occasion" },
    { icon: ArrowUpCircle, title: "Upgrade My Cookware", desc: "Tri-ply & heavy gauge recommendations" },
  ];

  return (
    <div className="grid grid-cols-1 min-[900px]:grid-cols-[280px_1fr] h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] overflow-hidden bg-bg">
      
      {/* ─── Sidebar (Desktop Only) ─── */}
      <aside className="hidden min-[900px]:flex flex-col h-full min-h-0 bg-[#1a0f08] border-r border-white/5 select-none">
        
        {/* Sidebar Header */}
        <div className="p-5 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-light flex items-center justify-center shadow-md shrink-0">
              <Sparkles size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-[16px] text-white tracking-tight truncate">
                KitchenGenie
              </h1>
              <div className="flex items-center gap-1.5 text-[11px] text-white/50">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  aiStatus === "ready" 
                    ? "bg-[#2ecc71] shadow-[0_0_8px_#2ecc71]" 
                    : aiStatus === "offline"
                    ? "bg-red-500"
                    : "bg-amber-400 animate-pulse"
                }`} />
                <span>{aiStatus === "ready" ? "Gemini Online" : aiStatus === "offline" ? "Backend Offline" : "Connecting..."}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white text-[13px] font-semibold transition-all border border-white/10 shadow-sm"
          >
            <MessageSquarePlus size={16} className="text-accent" />
            New Chat
          </button>
        </div>

        {/* Sidebar Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-5">
          
          {/* Chat History List */}
          {chatHistory.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-white/40 uppercase tracking-[0.1em] px-2 mb-2">
                Recent Chats
              </div>
              <div className="space-y-1.5">
                {chatHistory.map((chat) => {
                  const isActive = chatId === chat.id;
                  const firstMsg = chat.messages?.find((m) => m.role === "user")?.content || "Shopping Inquiry";
                  const dateStr = chat.updatedAt 
                    ? new Date(chat.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                    : "";

                  return (
                    <button
                      key={chat.id}
                      onClick={() => loadPastChat(chat)}
                      className={`w-full text-left rounded-xl p-3 transition-all border flex items-start gap-2.5 ${
                        isActive 
                          ? "bg-brand/20 border-brand/40 text-white shadow-sm" 
                          : "bg-white/[0.03] border-white/5 hover:bg-white/[0.08] text-white/70 hover:text-white"
                      }`}
                    >
                      <MessageSquare size={15} className={`mt-0.5 shrink-0 ${isActive ? "text-brand" : "text-white/40"}`} />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-[13px] truncate leading-tight">
                          {firstMsg}
                        </div>
                        {dateStr && (
                          <div className="text-[10px] text-white/35 mt-1">
                            {dateStr} · {chat.messages?.length || 0} messages
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Prompts Section */}
          <div>
            <div className="text-[11px] font-bold text-white/40 uppercase tracking-[0.1em] px-2 mb-2">
              Explore Scenarios
            </div>
            <div className="space-y-1.5">
              {QUICK_SCENARIOS.map((s) => (
                <button
                  key={s.title}
                  onClick={() => sendMessage(s.title)}
                  className="w-full text-left bg-white/[0.03] border border-white/5 rounded-xl p-3 hover:bg-white/[0.08] transition-all group"
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <s.icon size={14} className="text-accent group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-[13px] text-white/90">{s.title}</span>
                  </div>
                  <div className="text-[11px] text-white/45 pl-5.5 leading-snug">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main Chat Viewport ─── */}
      <main className="flex flex-col h-full min-h-0 overflow-hidden relative">
        
        {/* Messages Scroll Area */}
        <div 
          ref={chatContainerRef}
          className="flex-1 min-h-0 overflow-y-auto px-4 py-6 sm:px-8 md:px-12 space-y-6"
        >
          {messages.length === 0 ? (
            /* Welcome Empty State */
            <div className="h-full min-h-[420px] flex flex-col items-center justify-center text-center max-w-xl mx-auto py-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-accent to-accent-light flex items-center justify-center shadow-xl mb-6">
                <Sparkles size={36} className="text-white" />
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink mb-3 tracking-tight">
                Hello, I'm KitchenGenie!
              </h2>
              <p className="text-[15px] sm:text-[16px] text-ink-muted mb-8 max-w-md leading-relaxed">
                Tell me your cooking setup, budget, or family size — and I'll recommend the ideal cookware and utensils for you.
              </p>
              <div className="flex flex-wrap justify-center gap-2.5 max-w-lg">
                {[
                  "I'm setting up a new kitchen from scratch",
                  "Student going abroad — what do I pack?",
                  "Gift ideas for a newly married couple under ₹2000",
                  "Family of 4, need a full kitchen list with priorities"
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => sendMessage(chip)}
                    className="px-4 py-2 rounded-full border border-accent/30 bg-accent/5 text-accent font-medium text-[13px] hover:bg-accent hover:text-white transition-all shadow-sm"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Message Stream */
            messages.map((msg, i) => {
              const isUser = msg.role === "user";

              return (
                <div 
                  key={i} 
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-3xl ${isUser ? "ml-auto" : "mr-auto"}`}
                >
                  {/* Chat Bubble */}
                  <div
                    className={`p-4 sm:p-5 text-[15px] leading-relaxed shadow-sm ${
                      isUser
                        ? "bg-gradient-to-br from-brand to-brand-dark text-white rounded-[20px_20px_4px_20px] shadow-brand/10 max-w-lg"
                        : "bg-white text-ink rounded-[20px_20px_20px_4px] border border-ink/5 w-full"
                    }`}
                  >
                    <div className="prose prose-sm max-w-none text-inherit prose-p:my-1.5 prose-headings:my-2 prose-ul:my-1.5">
                      <ReactMarkdown 
                        components={{
                          p: ({node, ...props}) => <p className={isUser ? "text-white" : "text-ink"} {...props} />,
                          strong: ({node, ...props}) => <strong className={isUser ? "text-white font-bold" : "text-ink font-bold"} {...props} />,
                          li: ({node, ...props}) => <li className={isUser ? "text-white/90" : "text-ink-muted"} {...props} />
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {/* Quick Reply Options (for assistant messages only) */}
                  {!isUser && msg.options && msg.options.length > 0 && !msg.optionSelected && (
                    <div className="flex flex-wrap gap-2 mt-3 w-full">
                      {msg.options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleOptionSelect(option.value || option.label, msg.id)}
                          className="px-4 py-2.5 bg-white border-2 border-accent/30 text-ink text-[13px] font-semibold rounded-xl hover:bg-accent hover:text-white hover:border-accent transition-all active:scale-95 shadow-sm"
                        >
                          {option.icon && <span className="mr-1.5">{option.icon}</span>}
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Embedded Product Recommendations */}
                  {msg.products && msg.products.length > 0 && (
                    <PriorityProductGrid
                      products={msg.products}
                      addedItems={addedItems}
                      onAddToCart={handleAddToCart}
                      cartItems={cartQuantities}
                      onUpdateQuantity={handleUpdateQuantity}
                    />
                  )}
                </div>
              );
            })
          )}

          {/* Typing / Loading Bubble */}
          {isLoading && (
            <div className="flex items-start max-w-3xl mr-auto">
              <div className="bg-white p-4 rounded-[20px_20px_20px_4px] shadow-sm border border-ink/5 flex items-center gap-2">
                <span className="text-[13px] text-ink-muted font-medium mr-1">KitchenGenie is searching</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 rounded-full bg-accent animate-bounce" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── Floating / Fixed Bottom Input Bar ─── */}
        <div className="p-4 sm:p-5 bg-white border-t border-ink/5 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
          <div className="max-w-3xl mx-auto flex items-center gap-2 sm:gap-3 rounded-2xl bg-bg border border-ink/10 p-1.5 sm:p-2 focus-within:border-accent/60 focus-within:shadow-[0_0_0_3px_rgba(230,126,34,0.1)] transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything... e.g. 'I need a starter set under ₹2500 for induction cooktop'"
              className="flex-1 max-h-28 min-h-[44px] bg-transparent resize-none border-none focus:outline-none px-3 py-2 text-[14px] sm:text-[15px] text-ink placeholder:text-ink-muted/50 leading-normal"
              rows={1}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:scale-100 bg-gradient-to-br from-accent to-accent-light text-white shadow-md hover:scale-105 active:scale-95"
              aria-label="Send message"
            >
              <Send size={17} />
            </button>
          </div>
          <div className="text-center mt-2 text-[11px] text-ink-muted/60">
            KitchenGenie offers real-time cookware recommendations based on Indian kitchen requirements.
          </div>
        </div>
      </main>
    </div>
  );
}
