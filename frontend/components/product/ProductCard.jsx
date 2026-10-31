"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/lib/providers/CartProvider";
import { Check, Flame } from "lucide-react";
import { getProductPrimaryImage } from "@/lib/utils/productImages";

export function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const imgSrc = getProductPrimaryImage(product);
  const price = typeof product.price === "number" ? product.price : parseInt(product.price || 0, 10);
  const originalPrice = product.original || product.originalPrice || Math.round(price * 1.45);
  const discount = originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : 0;
  const rating = product.rating || 4.5;
  const reviewsCount = product.reviews || Math.floor(((price * 7) % 650) + 85);
  
  // Tag computation
  const tag = product.tag || (product.steel_grade ? product.steel_grade : (product.induction_compatible === "Yes" ? "Induction" : (rating >= 4.8 ? "Best Seller" : "")));

  const handleAdd = () => {
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const getTagColor = (t) => {
    if (t === "Best Seller" || t === "SS 304") return "bg-brand";
    if (t === "Premium" || t === "SS 316") return "bg-[#2c3e50]";
    if (t === "Induction") return "bg-blue-600";
    return "bg-accent";
  };

  return (
    <div className="bg-white rounded-2xl border border-ink/5 shadow-xs overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col group h-full">
      {/* Image Area */}
      <div className="relative h-[210px] w-full bg-[#f5f0ed] overflow-hidden">
        <Image
          src={imgSrc}
          alt={product.name || "Kitchen Utensil"}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        
        {/* Top-left Tag */}
        {tag && (
          <div
            className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-wider shadow-xs ${getTagColor(
              tag
            )}`}
          >
            {tag}
          </div>
        )}

        {/* Top-right Discount */}
        {discount > 0 && (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-[11px] font-bold text-brand shadow-xs">
            {discount}% OFF
          </div>
        )}

        {/* Induction indicator icon */}
        {product.induction_compatible === "Yes" && (
          <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] text-white font-semibold flex items-center gap-1">
            <Flame size={10} className="text-amber-400" />
            Induction Ready
          </div>
        )}
      </div>

      {/* Body Area */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase text-ink-muted tracking-wider truncate">
              {product.brand || "UtensilKart"}
            </span>
            {product.category && (
              <span className="text-[10px] text-ink-muted/70 capitalize">
                {product.category}
              </span>
            )}
          </div>
          
          <h3 className="font-display font-semibold text-[15px] sm:text-[16px] text-ink leading-snug line-clamp-2 mb-2">
            {product.name}
          </h3>

          {/* Rating Row */}
          <div className="flex items-center gap-1.5 mb-4">
            <span className="text-[#f39c12] text-[13px]">★</span>
            <span className="text-[13px] font-bold text-ink">{rating}</span>
            <span className="text-[12px] text-ink-muted">({reviewsCount.toLocaleString("en-IN")})</span>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-ink/5 flex items-center justify-between gap-2 mt-auto">
          <div className="flex flex-col">
            <span className="font-display font-bold text-[19px] sm:text-[20px] text-brand leading-none">
              ₹{price.toLocaleString("en-IN")}
            </span>
            {originalPrice > price && (
              <span className="text-[12px] text-ink-muted line-through mt-0.5">
                ₹{originalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          
          <button
            onClick={handleAdd}
            className={`px-3.5 py-2 rounded-xl text-white font-semibold text-[13px] transition-all flex items-center gap-1.5 active:scale-95 shadow-sm ${
              added ? "bg-[#27ae60]" : "bg-brand hover:bg-brand-dark"
            }`}
          >
            {added ? (
              <>
                <Check size={14} />
                Added
              </>
            ) : (
              "Add to Cart"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
