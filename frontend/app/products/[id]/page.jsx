"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  ChevronLeft,
  Package,
  PackageX,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { fetchProductById } from "@/lib/api/productApi";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { PriceComparatorWidget } from "@/components/product/PriceComparatorWidget";
import { ARViewerButton } from "@/components/product/ARViewerButton";
import { cn } from "@/lib/utils/cn";
import { getProductImages } from "@/lib/utils/productImages";

function PDPSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="skeleton h-4 w-24 rounded mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="skeleton aspect-square rounded-[var(--radius-xl)]" />
        <div className="space-y-4">
          <div className="skeleton h-5 w-24 rounded" />
          <div className="skeleton h-8 w-3/4 rounded" />
          <div className="skeleton h-6 w-1/3 rounded" />
          <div className="skeleton h-24 w-full rounded" />
          <div className="skeleton h-12 w-full rounded" />
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProductById(id),
    staleTime: 1000 * 60 * 10,
  });

  if (isLoading) return <PDPSkeleton />;

  if (isError || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-lg font-medium text-[var(--color-text-secondary)]">Product not found.</p>
        <Link href="/products" className="mt-4 inline-block text-[var(--color-primary)] hover:underline">
          Back to products
        </Link>
      </div>
    );
  }

  const {
    name,
    brand,
    description,
    price,
    originalPrice,
    currency = "INR",
    inStock,
    material,
    capacity,
    category,
    tags = [],
  } = product;

  const displayImages = getProductImages(product);

  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    toast.success(`${name} added to cart`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors duration-[var(--transition-fast)]"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          Back to products
        </Link>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* ── Image gallery ─────────────────────────────────────────────── */}
        <div className="space-y-3">
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="relative aspect-square rounded-[var(--radius-xl)] overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-muted)]"
          >
            {displayImages[selectedImage] ? (
              <Image
                src={displayImages[selectedImage]}
                alt={`${name} — image ${selectedImage + 1}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
                No image
              </div>
            )}
          </motion.div>

          {/* Thumbnail strip */}
          {displayImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {displayImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  aria-label={`View image ${i + 1}`}
                  className={cn(
                    "flex-shrink-0 w-16 h-16 rounded-[var(--radius-md)] overflow-hidden border-2 transition-colors duration-[var(--transition-fast)]",
                    selectedImage === i
                      ? "border-[var(--color-primary)]"
                      : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
                  )}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${i + 1}`}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product info ──────────────────────────────────────────────── */}
        <div>
          <p className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-1">
            {brand}
          </p>

          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] leading-snug mb-4">
            {name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-[var(--color-text-primary)]">
              {formatCurrency(price, currency)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg text-[var(--color-text-muted)] line-through">
                  {formatCurrency(originalPrice, currency)}
                </span>
                <span className="px-2 py-0.5 text-sm font-semibold bg-[var(--color-accent)] text-[var(--color-text-inverse)] rounded-[var(--radius-full)]">
                  {discountPercent}% off
                </span>
              </>
            )}
          </div>

          {/* Stock status */}
          <div className="flex items-center gap-1.5 mb-5">
            {inStock ? (
              <>
                <Package size={16} className="text-[var(--color-badge-in-stock)]" aria-hidden="true" />
                <span className="text-sm font-medium text-[var(--color-badge-in-stock)]">In stock</span>
              </>
            ) : (
              <>
                <PackageX size={16} className="text-[var(--color-badge-out-of-stock)]" aria-hidden="true" />
                <span className="text-sm font-medium text-[var(--color-badge-out-of-stock)]">Out of stock</span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-[var(--color-text-secondary)] leading-relaxed mb-6">{description}</p>

          {/* Specs */}
          {(material || capacity) && (
            <dl className="grid grid-cols-2 gap-3 mb-6 text-sm">
              {material && (
                <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-surface-muted)]">
                  <dt className="text-[var(--color-text-muted)] text-xs uppercase tracking-wide mb-0.5">Material</dt>
                  <dd className="font-medium text-[var(--color-text-primary)]">{material}</dd>
                </div>
              )}
              {capacity && (
                <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-surface-muted)]">
                  <dt className="text-[var(--color-text-muted)] text-xs uppercase tracking-wide mb-0.5">Capacity</dt>
                  <dd className="font-medium text-[var(--color-text-primary)]">{capacity}</dd>
                </div>
              )}
            </dl>
          )}

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-[var(--color-primary)] text-[var(--color-text-inverse)] font-semibold rounded-[var(--radius-md)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-[var(--transition-fast)]"
          >
            <ShoppingCart size={20} aria-hidden="true" />
            {inStock ? "Add to cart" : "Out of stock"}
          </button>

          {/* AR Visualizer button */}
          <ARViewerButton product={product} />

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius-full)] bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)]"
                >
                  <Tag size={10} aria-hidden="true" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Price Comparator (async, non-blocking, below fold) ──────────── */}
      <PriceComparatorWidget productId={id} />
    </div>
  );
}
