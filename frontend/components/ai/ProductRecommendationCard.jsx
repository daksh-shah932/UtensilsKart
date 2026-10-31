"use client";

import { useState } from "react";
import Link from "next/link";

const CATEGORY_ICONS = {
  cookware: "🍳",
  storage: "📦",
  cutlery: "🍴",
  utensil: "🥄",
  appliance: "⚡",
  serveware: "🍽️",
  bakeware: "🎂",
  cleaning: "🧹",
};

export default function ProductRecommendationCard({ product }) {
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const icon = CATEGORY_ICONS[product.category] || "🛒";
  const highlightTags = (product.tags || []).slice(0, 2);
  const extraTags = (product.tags || []).slice(2, 4);
  const hasImage = product.images && product.images[0];
  const detailHref = `/products?search=${encodeURIComponent(product.name)}`;

  return (
    <Link href={detailHref} className="kg-product-card" id={`kg-product-${product.id}`}>
      {/* Image */}
      <div className="kg-product-image">
        {hasImage ? (
          <img src={product.images[0]} alt={product.name} loading="lazy" />
        ) : (
          <span>{icon}</span>
        )}
      </div>

      {/* Body */}
      <div className="kg-product-body">
        <div className="kg-product-name">{product.name}</div>
        <div className="kg-product-brand">{product.brand}</div>

        <div className="kg-product-price-row">
          <span className="kg-product-price">₹{(product.price || 0).toLocaleString("en-IN")}</span>
          {product.originalPrice && (
            <span className="kg-product-orig-price">
              ₹{product.originalPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {product.rating != null && (
          <div className="kg-product-rating">
            {"★".repeat(Math.round(product.rating))}
            {"☆".repeat(5 - Math.round(product.rating))}
            <span style={{ color: "var(--kg-text-muted)", marginLeft: "3px" }}>
              {product.rating.toFixed(1)}
            </span>
          </div>
        )}

        <div className="kg-product-tags">
          {highlightTags.map((tag) => (
            <span key={tag} className="kg-tag highlight">
              {tag.replace(/_/g, " ")}
            </span>
          ))}
          {extraTags.map((tag) => (
            <span key={tag} className="kg-tag">
              {tag.replace(/_/g, " ")}
            </span>
          ))}
        </div>

        <button
          className={`kg-add-to-cart ${added ? "added" : ""}`}
          onClick={handleAddToCart}
          id={`kg-add-to-cart-${product.id}`}
        >
          {added ? "✓ Added!" : "Add to Cart"}
        </button>
      </div>
    </Link>
  );
}
