"use client";

import { useQuery } from "@tanstack/react-query";
import { BadgeCheck } from "lucide-react";
import { fetchPriceComparison } from "@/lib/api/priceComparisonApi";
import { formatCurrency, computeSavings } from "@/lib/utils/formatCurrency";
import { CompetitorPriceCard } from "./CompetitorPriceCard";
import { PriceComparatorSkeleton } from "./PriceComparatorSkeleton";

/**
 * Price Comparator Widget — renders below primary product info on the PDP.
 * Silently returns null on error, 404, or empty competitors list.
 * Never blocks the PDP — fetches asynchronously via React Query.
 */
export function PriceComparatorWidget({ productId }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["price-comparison", productId],
    queryFn: () => fetchPriceComparison(productId),
    staleTime: 1000 * 60 * 8, // 8 min — backend cache is 6-24hr
    retry: false, // don't retry on 404 — product just has no comparison data
  });

  if (isLoading) return <PriceComparatorSkeleton />;

  // Silent hide on error, 404, or no usable competitors
  if (isError || !data) return null;
  const competitors = (data.competitors ?? []).filter(
    (c) => c.price !== null && !c.isBlacklisted
  );
  if (!competitors.length) return null;

  // Determine if we have the best price (computed client-side — never trust a pre-baked string)
  const minCompetitorPrice = Math.min(...competitors.map((c) => c.price));
  const ourPrice = data.ourPrice;
  const isBestPrice = typeof ourPrice === "number" && ourPrice <= minCompetitorPrice;
  const savings = isBestPrice ? computeSavings(ourPrice, minCompetitorPrice) : null;

  return (
    <section
      className="mt-8 p-5 bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)]"
      aria-label="Price comparison"
    >
      <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-4">
        Compare Prices
      </h3>

      {/* Our price row */}
      {typeof ourPrice === "number" && (
        <div className="flex items-center gap-3 mb-4 p-3 rounded-[var(--radius-md)] bg-[var(--color-success-light)] border border-[var(--color-success)]">
          <div className="flex-1">
            <p className="text-xs font-medium text-[var(--color-text-muted)]">UtensilKart</p>
            <p className="text-xl font-bold text-[var(--color-text-primary)]">
              {formatCurrency(ourPrice, data.competitors?.[0]?.currency ?? "INR")}
            </p>
          </div>
          {isBestPrice && (
            <div className="flex flex-col items-end gap-0.5">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-[var(--radius-full)] bg-[var(--color-badge-best-price)] text-[var(--color-text-inverse)] text-xs font-bold">
                <BadgeCheck size={12} aria-hidden="true" />
                Best Price
              </span>
              {savings && (
                <p className="text-xs text-[var(--color-success)] font-medium">
                  Save {formatCurrency(savings.absolute)} ({savings.percentage}% off)
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Competitor cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {competitors.map((competitor) => (
          <CompetitorPriceCard key={competitor.platform} competitor={competitor} />
        ))}
      </div>

      <p className="mt-3 text-xs text-[var(--color-text-muted)]">
        Prices updated periodically. Click through for live pricing.
      </p>
    </section>
  );
}
