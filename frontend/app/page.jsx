"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Truck, BadgeIndianRupee, Sparkles, UtensilsCrossed } from "lucide-react";
import { PRODUCTS as FALLBACK_PRODUCTS } from "@/lib/data/products";
import { ProductCard } from "@/components/product/ProductCard";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4001";

export default function HomePage() {
  const [trendingProducts, setTrendingProducts] = useState(FALLBACK_PRODUCTS.slice(0, 8));

  // Fetch real trending products from backend catalog
  useEffect(() => {
    fetch(`${API_BASE}/api/products?limit=8`)
      .then((r) => r.json())
      .then((data) => {
        if (data.products && data.products.length > 0) {
          setTrendingProducts(data.products);
        }
      })
      .catch((err) => {
        console.warn("Using fallback trending products:", err);
      });
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* ─── Hero Section ─── */}
      <section
        className="w-full min-h-[580px] grid grid-cols-1 md:grid-cols-2"
        style={{
          background: "linear-gradient(135deg, #1a0f08 0%, #2d1507 50%, #3d1a08 100%)",
        }}
      >
        {/* Left Column */}
        <div className="flex flex-col justify-center px-6 py-12 md:pl-[60px] md:pr-[48px] md:py-[80px]">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/20 border border-accent/30 w-fit mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[12px] font-bold text-accent uppercase tracking-wider">
              India's Premium Kitchen Store
            </span>
          </div>
          
          <h1 className="font-display font-bold text-white leading-[1.1] tracking-tight mb-4 text-[clamp(36px,5vw,60px)]">
            Cook better,<br />
            <em className="text-accent not-italic">every day.</em>
          </h1>
          
          <p className="font-body text-[18px] text-white/65 max-w-[400px] mb-8">
            Premium cookware, authentic utensils, and expert AI recommendations — all in one place.
          </p>
          
          <div className="flex flex-wrap items-center gap-4 mb-12">
            <Link
              href="/products"
              className="px-6 py-3.5 bg-gradient-to-r from-brand to-brand-dark text-white font-semibold text-[14px] rounded-xl shadow-[0_4px_16px_rgba(192,57,43,0.4)] hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(192,57,43,0.5)] transition-all"
            >
              Shop Now
            </Link>
            <Link
              href="/assistant"
              className="px-6 py-3.5 bg-white/5 border-[1.5px] border-white/20 backdrop-blur-md text-white font-semibold text-[14px] rounded-xl hover:bg-white/10 hover:border-white/40 transition-all flex items-center gap-2 group"
            >
              Ask KitchenGenie
              <Sparkles size={16} className="text-accent group-hover:animate-pulse" />
            </Link>
          </div>
          
          {/* Stats Row */}
          <div className="flex items-center gap-8 border-t border-white/10 pt-8 mt-auto">
            <div>
              <div className="font-display font-bold text-[22px] text-white">1,400+</div>
              <div className="text-[12px] text-white/45 uppercase font-semibold tracking-wider">Products</div>
            </div>
            <div>
              <div className="font-display font-bold text-[22px] text-white">4.8★</div>
              <div className="text-[12px] text-white/45 uppercase font-semibold tracking-wider">Rating</div>
            </div>
            <div>
              <div className="font-display font-bold text-[22px] text-white">50K+</div>
              <div className="text-[12px] text-white/45 uppercase font-semibold tracking-wider">Customers</div>
            </div>
          </div>
        </div>

        {/* Right Column (Image) */}
        <div className="hidden md:block relative h-full w-full">
          <Image
            src="https://images.unsplash.com/photo-1592156328757-ae2941276b2c?w=900&h=700&fit=crop&auto=format"
            alt="Premium Cookware"
            fill
            className="object-cover"
            priority
          />
          {/* Dual gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#21110a] via-transparent to-transparent opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#21110a] via-transparent to-transparent opacity-50" />
          
          {/* Floating Card */}
          <div className="absolute bottom-8 right-8 bg-white/95 backdrop-blur-xl p-4 rounded-[14px] shadow-xl border border-white/20 min-w-[200px]">
            <div className="text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1">Trending Now</div>
            <div className="font-display font-semibold text-[15px] text-ink mb-2">Cast Iron Kadai</div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-[18px] text-brand">₹1,299</span>
              <span className="text-[13px] text-ink-muted line-through">₹2,199</span>
            </div>
            <div className="absolute top-4 right-4 px-2 py-0.5 bg-accent/10 text-accent text-[10px] font-bold rounded-full">41% OFF</div>
          </div>
        </div>
      </section>

      {/* ─── Category Grid ─── */}
      <section className="max-w-7xl mx-auto w-full px-6 pt-[72px] pb-[48px]">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-[36px] text-ink leading-tight">Shop by Category</h2>
            <p className="text-[16px] text-ink-muted mt-1">Authentic cookware tailored for Indian recipes</p>
          </div>
          <Link
            href="/products"
            className="hidden sm:inline-flex px-5 py-2.5 rounded-xl border-2 border-brand text-brand font-semibold text-[14px] hover:bg-brand hover:text-white transition-colors"
          >
            View All 1,400+
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { name: "Cookware", desc: "Kadais, tawas, pressure cookers", color: "#c0392b", img: "https://images.unsplash.com/photo-1592156328757-ae2941276b2c?w=600&h=400&fit=crop&auto=format" },
            { name: "Storage", desc: "Steel dabbas, canisters, jars", color: "#e67e22", img: "https://images.unsplash.com/photo-1592824555364-48a8ca0f0caf?w=600&h=400&fit=crop&auto=format" },
            { name: "Cutlery", desc: "Knives, peelers, graters", color: "#8e44ad", img: "https://images.unsplash.com/photo-1609467334293-030ac6448fd8?w=600&h=400&fit=crop&auto=format" },
            { name: "Bakeware", desc: "Trays, cake tins, molds", color: "#16a085", img: "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=600&h=400&fit=crop&auto=format" }
          ].map((cat) => (
            <Link
              key={cat.name}
              href={`/products?category=${cat.name.toLowerCase()}`}
              className="relative h-[200px] rounded-[16px] overflow-hidden group hover:-translate-y-1 hover:shadow-lg transition-all block"
            >
              <Image src={cat.img} alt={cat.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, 25vw" />
              {/* Custom Gradient Overlay via CSS */}
              <div 
                className="absolute inset-0 transition-opacity"
                style={{
                  background: `linear-gradient(to top, ${cat.color}e8 0%, ${cat.color}66 50%, transparent 80%)`
                }}
              />
              <div className="absolute bottom-5 left-5 right-5">
                <h3 className="font-display font-bold text-[20px] text-white mb-0.5">{cat.name}</h3>
                <p className="text-[13px] text-white/80 font-medium">{cat.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Featured Products ─── */}
      <section className="w-full bg-white py-[72px]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-display font-bold text-[36px] text-ink leading-tight">Trending Now</h2>
              <p className="text-[16px] text-ink-muted mt-1">Popular utensils from top Indian manufacturers</p>
            </div>
            <Link
              href="/products"
              className="hidden sm:inline-flex px-5 py-2.5 rounded-xl border-2 border-brand text-brand font-semibold text-[14px] hover:bg-brand hover:text-white transition-colors"
            >
              See All Products
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id || product.item_id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI Banner ─── */}
      <section className="max-w-7xl mx-auto w-full px-6 pb-[72px]">
        <div 
          className="relative w-full rounded-[24px] p-8 md:p-[56px_60px] overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10"
          style={{ background: "linear-gradient(135deg, #1a0f08 0%, #3d1a08 60%, #5c2a0d 100%)" }}
        >
          {/* Radial Glow */}
          <div className="absolute top-1/2 left-[70%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/15 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 max-w-[520px]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-light flex items-center justify-center shadow-md">
                <Sparkles size={18} className="text-white" />
              </div>
              <span className="text-[12px] font-bold text-accent uppercase tracking-[0.1em]">
                Powered by AI
              </span>
            </div>
            
            <h2 className="font-display font-bold text-white text-[clamp(26px,3.5vw,40px)] leading-[1.15] mb-4">
              Meet KitchenGenie — your personal <br />
              <em className="text-accent not-italic">culinary shopping assistant.</em>
            </h2>
            
            <p className="text-[16px] text-white/60 mb-8 font-medium">
              Tell KitchenGenie what you cook, your budget, or your kitchen setup — and get personalized utensil recommendations in seconds.
            </p>
            
            <div className="flex flex-wrap gap-3">
              {[
                "Student Going Abroad",
                "Starter Kitchen Kit",
                "Best kadai under ₹1000"
              ].map(chip => (
                <Link
                  key={chip}
                  href="/assistant"
                  className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-[13px] font-medium hover:bg-white/20 transition-colors"
                >
                  {chip}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="relative z-10 shrink-0">
            <Link
              href="/assistant"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-accent to-accent-light text-white font-bold text-[16px] rounded-[14px] shadow-[0_8px_24px_rgba(230,126,34,0.4)] hover:scale-[1.04] transition-transform duration-300"
            >
              Chat with KitchenGenie &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Value Props ─── */}
      <section className="w-full border-t border-ink/5">
        <div className="max-w-7xl mx-auto px-6 py-[72px] grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: ShieldCheck, title: "Authentic Products", desc: "Every item is sourced directly from trusted Indian manufacturers and certified brands." },
            { icon: Truck, title: "Fast Delivery", desc: "Next-day delivery to 100+ cities across India. Order before 3 PM for same-day dispatch." },
            { icon: BadgeIndianRupee, title: "Best Prices", desc: "Price-match guarantee. We beat any competitor price or refund the difference." }
          ].map((prop) => (
            <div key={prop.title} className="flex items-start gap-5">
              <div className="w-[56px] h-[56px] rounded-[14px] bg-brand/10 flex items-center justify-center shrink-0">
                <prop.icon size={28} className="text-brand" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-display font-semibold text-[18px] text-ink mb-1.5">{prop.title}</h3>
                <p className="text-[15px] text-ink-muted leading-[1.6]">{prop.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="w-full bg-[#1a0f08] pt-[56px] pb-[32px] px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12">
            {/* Brand Col */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-accent flex items-center justify-center">
                  <UtensilsCrossed size={16} className="text-white" />
                </div>
                <span className="font-display font-bold text-[18px] text-white">UtensilKart</span>
              </div>
              <p className="text-[14px] text-white/50 max-w-[260px] leading-relaxed">
                India's premier destination for authentic kitchen utensils and cookware since 2019.
              </p>
            </div>
            
            {/* Links Cols */}
            {[
              { title: "Shop", links: ["Cookware", "Storage", "Cutlery", "Bakeware"] },
              { title: "Company", links: ["About Us", "Blog", "Careers", "Press"] },
              { title: "Support", links: ["Help Center", "Returns", "Track Order", "Contact"] }
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-[13px] font-bold text-white/80 uppercase tracking-[0.08em] mb-4">
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map(link => (
                    <li key={link}>
                      <Link href="#" className="text-[14px] text-white/45 hover:text-white/85 transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          {/* Bottom Strip */}
          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-white/45">
            <div>© 2024 UtensilKart. All rights reserved.</div>
            <div>Made with <span className="text-brand">♥</span> for Indian kitchens</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
