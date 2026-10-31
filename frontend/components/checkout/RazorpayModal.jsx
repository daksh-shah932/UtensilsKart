"use client";

import { useState } from "react";
import { 
  ShieldCheck, 
  Lock, 
  X, 
  CreditCard, 
  QrCode, 
  Building2, 
  Wallet, 
  CheckCircle2, 
  ArrowRight,
  Smartphone
} from "lucide-react";

export function RazorpayModal({
  isOpen,
  order,
  customer = {},
  onSuccess,
  onDismiss,
}) {
  const [activeTab, setActiveTab] = useState("upi"); // 'upi' | 'card' | 'netbanking' | 'wallet'
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");

  // UPI State
  const [upiId, setUpiId] = useState(customer.phone ? `${customer.phone}@upi` : "user@okhdfcbank");

  // Card State
  const [cardData, setCardData] = useState({
    number: "4111 2222 3333 4444",
    expiry: "12/28",
    cvv: "123",
    name: customer.name || "Customer Name",
  });

  // NetBanking State
  const [selectedBank, setSelectedBank] = useState("HDFC");

  // Wallet State
  const [selectedWallet, setSelectedWallet] = useState("amazon");

  if (!isOpen || !order) return null;

  const displayAmount = (order.amount ? order.amount / 100 : 0).toLocaleString("en-IN");

  const triggerPaymentSuccess = (methodLabel) => {
    setIsProcessing(true);
    setProcessingStatus(`Connecting to ${methodLabel}...`);

    setTimeout(() => {
      setProcessingStatus("Authorizing transaction with bank...");
    }, 600);

    setTimeout(() => {
      setProcessingStatus("Payment Successful!");
      setTimeout(() => {
        setIsProcessing(false);
        onSuccess?.({
          razorpay_order_id: order.orderId,
          razorpay_payment_id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          razorpay_signature: "simulated_razorpay_signature_ok",
        });
      }, 500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={() => !isProcessing && onDismiss?.()} 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 border border-ink/10 flex flex-col max-h-[90vh]">
        
        {/* Razorpay Brand Header */}
        <div className="bg-[#0c2340] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#3395ff] font-bold text-lg border border-white/10">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-base text-white tracking-wide">
                  UtensilKart
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck size={11} /> Verified
                </span>
              </div>
              <p className="text-[11px] text-white/60 font-mono">
                Order: {order.orderId?.slice(0, 18)}...
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-white/60 font-bold block">
                Amount to Pay
              </span>
              <span className="font-display font-bold text-xl text-[#3395ff]">
                ₹{displayAmount}
              </span>
            </div>
            {!isProcessing && (
              <button
                onClick={onDismiss}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Razorpay Sandbox Notice Banner */}
        <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-2 flex items-center justify-between text-xs text-amber-800 shrink-0">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Razorpay Test Environment — Live Sandbox Simulator
          </span>
          <span className="text-[11px] font-bold uppercase bg-amber-200/60 px-2 py-0.5 rounded">
            Test Mode
          </span>
        </div>

        {/* Body Area */}
        {isProcessing ? (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-4 min-h-[340px]">
            <div className="w-16 h-16 rounded-full border-4 border-[#3395ff]/20 border-t-[#3395ff] animate-spin flex items-center justify-center" />
            <h3 className="font-display font-bold text-lg text-ink">
              {processingStatus}
            </h3>
            <p className="text-xs text-ink-muted max-w-xs">
              Please do not refresh the page or press the back button while we securely process your payment.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Payment Method Tabs */}
            <div className="grid grid-cols-4 border-b border-ink/10 bg-bg/50 p-1 gap-1 text-center text-xs font-semibold">
              <button
                onClick={() => setActiveTab("upi")}
                className={`py-2.5 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                  activeTab === "upi" ? "bg-white text-brand shadow-xs font-bold" : "text-ink-muted hover:text-ink"
                }`}
              >
                <QrCode size={15} />
                <span>UPI / QR</span>
              </button>

              <button
                onClick={() => setActiveTab("card")}
                className={`py-2.5 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                  activeTab === "card" ? "bg-white text-brand shadow-xs font-bold" : "text-ink-muted hover:text-ink"
                }`}
              >
                <CreditCard size={15} />
                <span>Cards</span>
              </button>

              <button
                onClick={() => setActiveTab("netbanking")}
                className={`py-2.5 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                  activeTab === "netbanking" ? "bg-white text-brand shadow-xs font-bold" : "text-ink-muted hover:text-ink"
                }`}
              >
                <Building2 size={15} />
                <span>NetBanking</span>
              </button>

              <button
                onClick={() => setActiveTab("wallet")}
                className={`py-2.5 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                  activeTab === "wallet" ? "bg-white text-brand shadow-xs font-bold" : "text-ink-muted hover:text-ink"
                }`}
              >
                <Wallet size={15} />
                <span>Wallets</span>
              </button>
            </div>

            {/* Tab 1: UPI */}
            {activeTab === "upi" && (
              <div className="p-5 sm:p-6 space-y-5">
                {/* Popular UPI Apps */}
                <div>
                  <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block mb-2.5">
                    Pay using UPI Apps
                  </span>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { name: "Google Pay", color: "border-blue-200 hover:border-blue-400 bg-blue-50/50" },
                      { name: "PhonePe", color: "border-purple-200 hover:border-purple-400 bg-purple-50/50" },
                      { name: "Paytm UPI", color: "border-sky-200 hover:border-sky-400 bg-sky-50/50" },
                    ].map((app) => (
                      <button
                        key={app.name}
                        onClick={() => triggerPaymentSuccess(app.name)}
                        className={`p-3 rounded-2xl border text-xs font-bold text-ink text-center flex flex-col items-center justify-center gap-1 transition-all hover:shadow-xs active:scale-95 ${app.color}`}
                      >
                        <Smartphone size={18} className="text-brand" />
                        <span>{app.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-ink/10 w-full" />
                  <span className="bg-white px-3 text-[11px] text-ink-muted font-bold uppercase shrink-0">
                    or enter UPI ID
                  </span>
                </div>

                {/* UPI ID input */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-1">
                      Virtual Payment Address (VPA / UPI ID)
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. mobile@upi or name@okaxis"
                      className="w-full h-11 px-3.5 rounded-xl border border-ink/15 text-sm text-ink focus:outline-none focus:border-[#3395ff] focus:ring-2 focus:ring-[#3395ff]/10"
                    />
                  </div>

                  <button
                    onClick={() => triggerPaymentSuccess("UPI (VPA)")}
                    className="w-full py-3.5 rounded-xl bg-[#0c2340] text-white font-bold text-sm shadow-md hover:bg-[#13335c] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <span>Pay ₹{displayAmount}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Cards */}
            {activeTab === "card" && (
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
                    Credit / Debit Card Details
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCardData({
                        number: "4111 2222 3333 4444",
                        expiry: "12/28",
                        cvv: "123",
                        name: "Daksh Sharma",
                      });
                    }}
                    className="text-[11px] font-bold text-[#3395ff] hover:underline"
                  >
                    Auto-Fill Test Card
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-muted mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardData.number}
                    onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                    placeholder="4111 2222 3333 4444"
                    maxLength={19}
                    className="w-full h-11 px-3.5 rounded-xl border border-ink/15 text-sm font-mono text-ink focus:outline-none focus:border-[#3395ff]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-ink-muted mb-1">
                      Expiry (MM/YY)
                    </label>
                    <input
                      type="text"
                      value={cardData.expiry}
                      onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full h-11 px-3.5 rounded-xl border border-ink/15 text-sm font-mono text-ink focus:outline-none focus:border-[#3395ff]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink-muted mb-1">
                      CVV
                    </label>
                    <input
                      type="password"
                      value={cardData.cvv}
                      onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                      placeholder="123"
                      maxLength={4}
                      className="w-full h-11 px-3.5 rounded-xl border border-ink/15 text-sm font-mono text-ink focus:outline-none focus:border-[#3395ff]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-muted mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardData.name}
                    onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                    placeholder="Name as on card"
                    className="w-full h-11 px-3.5 rounded-xl border border-ink/15 text-sm text-ink focus:outline-none focus:border-[#3395ff]"
                  />
                </div>

                <button
                  onClick={() => triggerPaymentSuccess("Card")}
                  className="w-full py-3.5 rounded-xl bg-[#0c2340] text-white font-bold text-sm shadow-md hover:bg-[#13335c] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 mt-2"
                >
                  <Lock size={15} />
                  <span>Pay ₹{displayAmount}</span>
                </button>
              </div>
            )}

            {/* Tab 3: NetBanking */}
            {activeTab === "netbanking" && (
              <div className="p-5 sm:p-6 space-y-4">
                <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">
                  Select Popular Bank
                </span>

                <div className="grid grid-cols-2 gap-2.5">
                  {["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Kotak Mahindra", "Punjab National"].map((b) => (
                    <button
                      key={b}
                      onClick={() => {
                        setSelectedBank(b);
                        triggerPaymentSuccess(b);
                      }}
                      className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all hover:border-[#3395ff] hover:bg-sky-50/50 flex items-center justify-between ${
                        selectedBank === b ? "border-[#3395ff] bg-sky-50 font-bold text-brand" : "border-ink/10 text-ink"
                      }`}
                    >
                      <span>{b}</span>
                      <ArrowRight size={13} className="text-ink-muted" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Wallets */}
            {activeTab === "wallet" && (
              <div className="p-5 sm:p-6 space-y-4">
                <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">
                  Select Digital Wallet
                </span>

                <div className="space-y-2.5">
                  {[
                    { id: "amazon", name: "Amazon Pay Balance" },
                    { id: "mobikwik", name: "MobiKwik Wallet" },
                    { id: "airtel", name: "Airtel Money" },
                  ].map((w) => (
                    <button
                      key={w.id}
                      onClick={() => {
                        setSelectedWallet(w.id);
                        triggerPaymentSuccess(w.name);
                      }}
                      className="w-full p-3.5 rounded-xl border border-ink/10 hover:border-[#3395ff] hover:bg-sky-50/50 flex items-center justify-between text-xs font-semibold text-ink transition-all"
                    >
                      <span>{w.name}</span>
                      <ArrowRight size={14} className="text-ink-muted" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Guarantee */}
        <div className="bg-[#fbf9f8] border-t border-ink/5 px-5 py-3 flex items-center justify-between text-[11px] text-ink-muted shrink-0">
          <div className="flex items-center gap-1.5">
            <Lock size={12} className="text-emerald-600" />
            <span>256-Bit SSL Encrypted Razorpay Gateway</span>
          </div>
          <span className="font-bold text-[#0c2340]">Razorpay</span>
        </div>
      </div>
    </div>
  );
}
