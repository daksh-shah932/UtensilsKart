"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import { useCart } from "@/lib/providers/CartProvider";

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeCart();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        onClick={closeCart}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-over Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-5 border-b border-ink/5 flex items-center justify-between bg-bg/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
              <ShoppingBag size={18} />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-ink">Your Cart</h2>
              <p className="text-[12px] text-ink-muted">{cartCount} {cartCount === 1 ? "item" : "items"}</p>
            </div>
          </div>
          <button 
            onClick={closeCart}
            className="w-9 h-9 rounded-xl hover:bg-ink/5 flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-bg border border-ink/5 flex items-center justify-center text-ink-muted mb-4 shadow-inner">
                <ShoppingBag size={28} />
              </div>
              <h3 className="font-display font-semibold text-lg text-ink mb-1">Your cart is empty</h3>
              <p className="text-sm text-ink-muted mb-6 max-w-xs">
                Looks like you haven't added any kitchen utensils or cookware yet.
              </p>
              <Link
                href="/products"
                onClick={closeCart}
                className="px-6 py-3 rounded-xl bg-brand text-white font-semibold text-sm hover:bg-brand-dark transition-all shadow-md active:scale-95 flex items-center gap-2"
              >
                Browse Cookware
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div 
                key={item.id} 
                className="flex gap-3.5 p-3.5 rounded-2xl border border-ink/5 bg-white hover:border-ink/10 transition-colors shadow-xs"
              >
                {/* Product Thumbnail */}
                <div className="relative w-20 h-20 rounded-xl bg-[#f5f0ed] overflow-hidden shrink-0">
                  <Image 
                    src={item.image || "https://images.unsplash.com/photo-1592156328757-ae2941276b2c?w=200&h=200&fit=crop&auto=format"} 
                    alt={item.name} 
                    fill 
                    className="object-cover"
                    sizes="80px"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-ink-muted tracking-wider truncate">
                      {item.brand || "UtensilKart"}
                    </div>
                    <h4 className="font-display font-semibold text-sm text-ink line-clamp-1 leading-snug">
                      {item.name}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="font-display font-bold text-brand text-[15px]">
                      ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                    </span>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-1.5 border border-ink/10 rounded-lg p-0.5 bg-bg/50">
                      <button
                        onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                        className="w-6 h-6 rounded flex items-center justify-center hover:bg-white text-ink-muted hover:text-ink transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-bold text-ink w-4 text-center">
                        {item.quantity || 1}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                        className="w-6 h-6 rounded flex items-center justify-center hover:bg-white text-ink-muted hover:text-ink transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-ink-muted/50 hover:text-red-500 transition-colors p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Checkout Area */}
        {items.length > 0 && (
          <div className="p-5 border-t border-ink/5 bg-bg/40 space-y-3 shrink-0">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-muted">Subtotal</span>
              <span className="font-display font-bold text-lg text-ink">
                ₹{cartTotal.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[12px] text-green-700 bg-green-50 rounded-lg px-3 py-2 border border-green-200">
              <ShieldCheck size={16} className="shrink-0" />
              <span>Free express delivery & 7-day hassle-free replacement</span>
            </div>

            <Link 
              href="/checkout"
              onClick={closeCart}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand to-brand-dark text-white font-bold text-[15px] shadow-lg shadow-brand/20 hover:shadow-xl hover:shadow-brand/30 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
            >
              Proceed to Checkout (₹{cartTotal.toLocaleString("en-IN")})
              <ArrowRight size={16} />
            </Link>

            <button
              onClick={closeCart}
              className="w-full py-2 text-center text-xs font-semibold text-ink-muted hover:text-ink transition-colors"
            >
              or Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
