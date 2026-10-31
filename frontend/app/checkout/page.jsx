"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/providers/CartProvider";
import { createPaymentOrder, verifyPaymentResult } from "@/lib/api/paymentApi";
import { displayRazorpay } from "@/lib/utils/razorpay";
import { 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  ShoppingBag, 
  ArrowLeft, 
  Sparkles, 
  Tag, 
  BadgeIndianRupee,
  Clock,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { RazorpayModal } from "@/components/checkout/RazorpayModal";

const INDIAN_STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", 
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab", 
  "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, cartTotal, clearCart } = useCart();

  // Form State
  const [formData, setFormData] = useState({
    name: "Daksh Sharma",
    phone: "9876543210",
    email: "daksh@example.com",
    address: "B-402, Royal Residency, Opp City Mall",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400053",
  });

  const [paymentMethod, setPaymentMethod] = useState("razorpay"); // 'razorpay' | 'cod'
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0); // in percent
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(null);
  const [razorpayModalOpen, setRazorpayModalOpen] = useState(false);
  const [activeRazorpayOrder, setActiveRazorpayOrder] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = (e) => {
    e?.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === "UTENSIL10" || code === "WELCOME10") {
      setAppliedDiscount(10);
      toast.success("Coupon applied! 10% discount added to your order.");
    } else if (code === "SUPER20") {
      setAppliedDiscount(20);
      toast.success("Coupon applied! 20% discount added to your order.");
    } else {
      toast.error("Invalid coupon code. Try UTENSIL10 for 10% off.");
    }
  };

  // Calculations
  const discountAmount = Math.round((cartTotal * appliedDiscount) / 100);
  const deliveryCharge = 0; // Free express delivery
  const finalPayable = Math.max(0, cartTotal - discountAmount + deliveryCharge);

  // Form Validation
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Please enter your full name");
      return false;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return false;
    }
    if (!formData.address.trim()) {
      toast.error("Please enter your street address");
      return false;
    }
    if (!formData.city.trim() || !formData.pincode.trim()) {
      toast.error("Please fill in City and PIN Code");
      return false;
    }
    return true;
  };

  // Handle Razorpay Checkout
  const handlePayment = async () => {
    if (!validateForm()) return;
    if (items.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    setIsProcessing(true);

    try {
      if (paymentMethod === "cod") {
        // Cash on Delivery Flow
        setTimeout(() => {
          const fakeOrderId = `order_cod_${Date.now()}`;
          setOrderConfirmed({
            orderId: fakeOrderId,
            paymentId: "PAY_ON_DELIVERY",
            paymentMethod: "Cash on Delivery",
            amount: finalPayable,
            items: [...items],
            customer: { ...formData },
            deliveryEstimate: "3-5 business days",
          });
          clearCart();
          setIsProcessing(false);
          toast.success("Order placed successfully with Cash on Delivery!");
        }, 1200);
        return;
      }

      // Online Razorpay Flow
      toast.loading("Preparing secure Razorpay payment...", { id: "checkout-step" });

      // 1. Create order on backend
      const order = await createPaymentOrder({
        amount: finalPayable,
        currency: "INR",
        items,
        customer: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
        },
        deliveryAddress: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
      });

      toast.dismiss("checkout-step");

      const finalizePayment = async (paymentResponse) => {
        setIsProcessing(true);
        toast.loading("Verifying payment with bank...", { id: "verify-step" });

        try {
          const verification = await verifyPaymentResult({
            razorpay_order_id: paymentResponse.razorpay_order_id,
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_signature: paymentResponse.razorpay_signature,
            customer: formData,
            deliveryAddress: formData,
            items,
            amount: finalPayable,
          });

          toast.dismiss("verify-step");
          toast.success("Payment verified! Order confirmed.");

          setOrderConfirmed({
            orderId: verification.orderId || order.orderId,
            paymentId: paymentResponse.razorpay_payment_id,
            paymentMethod: "Razorpay (Online UPI / Cards / NetBanking)",
            amount: finalPayable,
            items: [...items],
            customer: { ...formData },
            deliveryEstimate: "2-4 business days",
          });

          clearCart();
        } catch (verifyErr) {
          toast.dismiss("verify-step");
          toast.error(verifyErr.message || "Payment verification failed. Please contact support.");
        } finally {
          setIsProcessing(false);
          setRazorpayModalOpen(false);
        }
      };

      if (order.isRealRazorpayOrder) {
        await displayRazorpay({
          order,
          customer: {
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
          },
          onSuccess: finalizePayment,
          onError: () => {
            setActiveRazorpayOrder(order);
            setRazorpayModalOpen(true);
            setIsProcessing(false);
          },
          onDismiss: () => {
            setIsProcessing(false);
            toast.info("Payment window closed.");
          },
        });
      } else {
        // Built-in Razorpay Sandbox modal
        setActiveRazorpayOrder(order);
        setRazorpayModalOpen(true);
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("[Checkout Error]", err);
      setIsProcessing(false);
      toast.error(err.message || "Could not initialize checkout. Please try again.");
    }
  };

  // ── Render Order Confirmation Screen ──
  if (orderConfirmed) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-ink/5 shadow-xl text-center flex flex-col items-center animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 shadow-sm border border-emerald-100">
            <CheckCircle2 size={44} className="animate-pulse" />
          </div>

          <span className="px-3 py-1 rounded-full bg-emerald-100/70 text-emerald-800 text-[12px] font-bold uppercase tracking-wider mb-2">
            Order Placed Successfully
          </span>

          <h1 className="font-display font-bold text-3xl text-ink mb-2">
            Thank you, {orderConfirmed.customer.name}!
          </h1>

          <p className="text-ink-muted text-sm max-w-md mb-8">
            Your order has been confirmed. A confirmation receipt has been sent to{" "}
            <span className="font-semibold text-ink">{orderConfirmed.customer.email}</span>.
          </p>

          {/* Receipt Details Card */}
          <div className="w-full bg-[#fbf9f8] rounded-2xl p-5 border border-ink/5 text-left space-y-4 mb-8">
            <div className="flex flex-wrap items-center justify-between border-b border-ink/5 pb-3 gap-2">
              <div>
                <span className="text-[11px] font-bold uppercase text-ink-muted tracking-wider">Order ID</span>
                <p className="font-mono font-bold text-sm text-ink">{orderConfirmed.orderId}</p>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase text-ink-muted tracking-wider">Payment ID</span>
                <p className="font-mono font-bold text-sm text-emerald-700">{orderConfirmed.paymentId}</p>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold uppercase text-ink-muted tracking-wider">Total Paid</span>
                <p className="font-display font-bold text-lg text-brand">₹{orderConfirmed.amount.toLocaleString("en-IN")}</p>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <span className="font-bold text-ink-muted uppercase tracking-wider text-[10px]">Shipping To:</span>
                <p className="font-semibold text-ink mt-0.5">{orderConfirmed.customer.name}</p>
                <p className="text-ink-muted">{orderConfirmed.customer.address}, {orderConfirmed.customer.city}, {orderConfirmed.customer.state} - {orderConfirmed.customer.pincode}</p>
                <p className="text-ink-muted">Phone: {orderConfirmed.customer.phone}</p>
              </div>

              <div>
                <span className="font-bold text-ink-muted uppercase tracking-wider text-[10px]">Estimated Delivery:</span>
                <p className="font-semibold text-emerald-700 mt-0.5 flex items-center gap-1.5">
                  <Truck size={14} />
                  {orderConfirmed.deliveryEstimate} (Express)
                </p>
                <span className="font-bold text-ink-muted uppercase tracking-wider text-[10px] block mt-2">Method:</span>
                <p className="text-ink font-medium">{orderConfirmed.paymentMethod}</p>
              </div>
            </div>

            {/* Items Summary */}
            <div className="border-t border-ink/5 pt-3">
              <span className="font-bold text-ink-muted uppercase tracking-wider text-[10px] block mb-2">
                Purchased Items ({orderConfirmed.items.length})
              </span>
              <div className="space-y-2">
                {orderConfirmed.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-ink font-medium">{it.name} × {it.quantity}</span>
                    <span className="text-ink-muted font-bold">₹{((it.price || 0) * (it.quantity || 1)).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/products"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand to-brand-dark text-white font-semibold text-sm hover:shadow-lg transition-all"
            >
              Continue Shopping
            </Link>
            <Link
              href="/"
              className="px-6 py-3 rounded-xl border border-ink/15 text-ink font-semibold text-sm hover:bg-ink/5 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Render Empty Cart ──
  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-3xl bg-bg border border-ink/10 text-ink-muted flex items-center justify-center mx-auto mb-5 shadow-inner">
          <ShoppingBag size={36} />
        </div>
        <h2 className="font-display font-bold text-2xl text-ink mb-2">Your Cart is Empty</h2>
        <p className="text-ink-muted text-sm mb-8 max-w-sm mx-auto">
          Add some stainless steel cookware or kitchen utensils to your cart before proceeding to checkout.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand text-white font-bold text-sm shadow-md hover:bg-brand-dark transition-all"
        >
          Explore Utensil Catalog
          <ChevronRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb Header */}
      <div className="mb-8">
        <Link 
          href="/products" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-brand transition-colors mb-3"
        >
          <ArrowLeft size={14} />
          Back to Shop
        </Link>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink">
          Checkout & Payment
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-1">
          Complete your delivery details and pay securely online via Razorpay.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* ── Left Column: Form & Payment Methods (7 Cols) ── */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Step 1: Delivery Details */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-ink/5 shadow-xs">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-ink/5">
              <div className="w-7 h-7 rounded-full bg-brand text-white flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h2 className="font-display font-bold text-lg text-ink">
                Shipping & Delivery Address
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full h-11 px-3.5 rounded-xl border border-ink/10 text-ink text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-1.5">
                  Mobile Number (for delivery OTP) *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className="w-full h-11 px-3.5 rounded-xl border border-ink/10 text-ink text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-1.5">
                  Email Address (for invoice & updates) *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@example.com"
                  className="w-full h-11 px-3.5 rounded-xl border border-ink/10 text-ink text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-1.5">
                  Street Address & Flat / House No. *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Apartment, Studio, or Floor, Street address"
                  className="w-full h-11 px-3.5 rounded-xl border border-ink/10 text-ink text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="e.g. Mumbai"
                  className="w-full h-11 px-3.5 rounded-xl border border-ink/10 text-ink text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-1.5">
                  State *
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full h-11 px-3.5 rounded-xl border border-ink/10 text-ink text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all bg-white"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-1.5">
                  PIN Code *
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  placeholder="6-digit PIN code"
                  maxLength={6}
                  className="w-full h-11 px-3.5 rounded-xl border border-ink/10 text-ink text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
                  required
                />
              </div>

              <div className="flex items-center text-xs text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2 border border-emerald-100 self-end h-11">
                <Truck size={16} className="shrink-0 mr-2" />
                <span>Express Delivery eligible for this PIN</span>
              </div>
            </div>
          </div>

          {/* Step 2: Payment Method */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-ink/5 shadow-xs">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-ink/5">
              <div className="w-7 h-7 rounded-full bg-brand text-white flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h2 className="font-display font-bold text-lg text-ink">
                Payment Method
              </h2>
            </div>

            <div className="space-y-3">
              {/* Razorpay Option */}
              <label 
                className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === "razorpay" 
                    ? "border-brand bg-brand/5 shadow-xs" 
                    : "border-ink/10 hover:border-ink/20 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={paymentMethod === "razorpay"}
                  onChange={() => setPaymentMethod("razorpay")}
                  className="mt-1 text-brand focus:ring-brand"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-ink text-[15px]">
                      Razorpay Online Payment
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0c2340] text-[#3395ff]">
                      RAZORPAY SECURE
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted mt-0.5">
                    UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards, NetBanking, EMI & Wallets
                  </p>
                  
                  {/* Payment Badges */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className="px-2 py-1 rounded bg-white border border-ink/10 text-[10px] font-bold text-ink">
                      UPI / QR
                    </span>
                    <span className="px-2 py-1 rounded bg-white border border-ink/10 text-[10px] font-bold text-ink">
                      Visa / Mastercard
                    </span>
                    <span className="px-2 py-1 rounded bg-white border border-ink/10 text-[10px] font-bold text-ink">
                      RuPay
                    </span>
                    <span className="px-2 py-1 rounded bg-white border border-ink/10 text-[10px] font-bold text-ink">
                      50+ Banks NetBanking
                    </span>
                  </div>
                </div>
              </label>

              {/* Cash On Delivery Option */}
              <label 
                className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === "cod" 
                    ? "border-brand bg-brand/5 shadow-xs" 
                    : "border-ink/10 hover:border-ink/20 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="mt-1 text-brand focus:ring-brand"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-ink text-[15px]">
                      Cash on Delivery (COD)
                    </span>
                    <span className="text-[11px] text-ink-muted font-semibold">
                      Pay at doorstep
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Pay with cash or UPI scanner upon delivery
                  </p>
                </div>
              </label>
            </div>

            {/* Security Guarantee Notice */}
            <div className="mt-5 pt-4 border-t border-ink/5 flex items-center gap-3 text-xs text-ink-muted">
              <Lock size={15} className="text-emerald-600 shrink-0" />
              <span>
                Payments are processed through 256-bit bank-grade encryption. UtensilKart never stores card details.
              </span>
            </div>
          </div>
        </div>

        {/* ── Right Column: Order Summary (5 Cols) ── */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-ink/5 shadow-xs space-y-5 sticky top-24">
            <h2 className="font-display font-bold text-lg text-ink pb-3 border-b border-ink/5">
              Order Summary ({items.length} {items.length === 1 ? "item" : "items"})
            </h2>

            {/* Item Mini-List */}
            <div className="max-h-[260px] overflow-y-auto space-y-3 pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  <div className="relative w-14 h-14 rounded-xl bg-[#f5f0ed] shrink-0 overflow-hidden border border-ink/5">
                    <Image
                      src={item.image || "https://images.unsplash.com/photo-1592156328757-ae2941276b2c?w=100&h=100&fit=crop&auto=format"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-ink font-semibold text-xs truncate">{item.name}</p>
                    <p className="text-ink-muted text-[11px]">Qty: {item.quantity} × ₹{item.price}</p>
                  </div>
                  <span className="font-display font-bold text-xs text-ink shrink-0">
                    ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="pt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon code (try UTENSIL10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 h-10 px-3 rounded-xl border border-ink/10 text-xs text-ink uppercase focus:outline-none focus:border-brand"
                />
                <button
                  type="submit"
                  className="px-4 h-10 rounded-xl bg-ink/5 hover:bg-ink/10 text-ink font-bold text-xs transition-colors"
                >
                  Apply
                </button>
              </div>
              {appliedDiscount > 0 && (
                <p className="text-[11px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                  <Tag size={12} />
                  {appliedDiscount}% discount applied!
                </p>
              )}
            </form>

            {/* Cost Breakdown */}
            <div className="border-t border-ink/5 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-ink-muted">
                <span>Subtotal</span>
                <span className="font-semibold text-ink">₹{cartTotal.toLocaleString("en-IN")}</span>
              </div>

              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Special Discount ({appliedDiscount}%)</span>
                  <span>- ₹{discountAmount.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="flex justify-between text-ink-muted">
                <span>Express Shipping</span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>

              <div className="border-t border-ink/5 pt-3 flex justify-between items-baseline">
                <span className="font-display font-bold text-base text-ink">Total Payable</span>
                <span className="font-display font-bold text-2xl text-brand">
                  ₹{finalPayable.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              id="pay-razorpay-btn"
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand to-brand-dark text-white font-bold text-[15px] shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/35 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing Payment...</span>
                </div>
              ) : paymentMethod === "razorpay" ? (
                <>
                  <Lock size={16} />
                  <span>Pay ₹{finalPayable.toLocaleString("en-IN")} via Razorpay</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Confirm Order (COD)</span>
                </>
              )}
            </button>

            {/* Confidence Badges */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-ink/5 text-[11px] text-ink-muted">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                <span>100% Genuine Steel</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-emerald-600 shrink-0" />
                <span>7-Day Replacement</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Razorpay Interactive Payment Modal */}
      <RazorpayModal
        isOpen={razorpayModalOpen}
        order={activeRazorpayOrder}
        customer={formData}
        onSuccess={async (paymentResponse) => {
          setIsProcessing(true);
          toast.loading("Verifying payment with bank...", { id: "verify-step" });

          try {
            const verification = await verifyPaymentResult({
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              customer: formData,
              deliveryAddress: formData,
              items,
              amount: finalPayable,
            });

            toast.dismiss("verify-step");
            toast.success("Payment verified! Order confirmed.");

            setOrderConfirmed({
              orderId: verification.orderId || activeRazorpayOrder?.orderId,
              paymentId: paymentResponse.razorpay_payment_id,
              paymentMethod: "Razorpay (Online UPI / Cards / NetBanking)",
              amount: finalPayable,
              items: [...items],
              customer: { ...formData },
              deliveryEstimate: "2-4 business days",
            });

            clearCart();
          } catch (verifyErr) {
            toast.dismiss("verify-step");
            toast.error(verifyErr.message || "Payment verification failed.");
          } finally {
            setIsProcessing(false);
            setRazorpayModalOpen(false);
          }
        }}
        onDismiss={() => {
          setRazorpayModalOpen(false);
          setIsProcessing(false);
          toast.info("Payment window closed.");
        }}
      />
    </div>
  );
}
