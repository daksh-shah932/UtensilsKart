"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UtensilsCrossed, ShoppingCart, Sparkles, Menu, X } from "lucide-react";
import { useCart } from "@/lib/providers/CartProvider";

export function Navbar() {
  const pathname = usePathname();
  const { cartCount, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "home", href: "/" },
    { label: "products", href: "/products" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-brand/10 shadow-[0_4px_20px_-10px_rgba(192,57,43,0.1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-accent flex items-center justify-center shadow-md">
                <UtensilsCrossed size={20} className="text-white" />
              </div>
              <span className="font-display font-bold text-[22px] tracking-tight">
                <span className="text-brand">Utensil</span>
                <span className="text-accent">Kart</span>
              </span>
            </Link>

            {/* Desktop Center Nav */}
            <nav className="hidden min-[900px]:flex h-full items-center gap-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`h-full flex items-center capitalize text-sm font-medium border-b-2 transition-colors ${
                      isActive
                        ? "border-brand text-brand"
                        : "border-transparent text-ink-muted hover:text-ink"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <Link
                href="/assistant"
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-accent to-accent-light text-white text-[13px] font-semibold shadow-[0_4px_12px_rgba(230,126,34,0.3)] hover:-translate-y-[1px] hover:shadow-[0_6px_16px_rgba(230,126,34,0.4)] transition-all"
              >
                <Sparkles size={14} />
                KitchenGenie
              </Link>

              <button 
                onClick={openCart}
                aria-label="Open Shopping Cart"
                className="relative w-10 h-10 flex items-center justify-center text-ink hover:text-brand transition-colors cursor-pointer"
              >
                <ShoppingCart size={22} strokeWidth={2} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-0 w-[17px] h-[17px] bg-brand text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs animate-in zoom-in-50 duration-150">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                className="min-[900px]:hidden w-10 h-10 flex items-center justify-center text-ink"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="min-[900px]:hidden bg-white border-b border-brand/10 shadow-lg absolute w-full z-40">
          <nav className="flex flex-col px-4 py-4 space-y-2">
            {[...navLinks, { label: "KitchenGenie AI", href: "/assistant" }].map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`capitalize px-4 py-3 rounded-xl font-medium transition-colors ${
                    isActive
                      ? "bg-brand/5 text-brand"
                      : "text-ink-muted hover:bg-bg hover:text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
