import { ExternalLink, PackageX, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { cn } from "@/lib/utils/cn";

export function CompetitorPriceCard({ competitor }) {
  const { platform, competitorProductUrl, price, currency = "INR", inStock } = competitor;

  return (
    <div className="flex flex-col justify-between p-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] hover:border-[var(--color-border-strong)] transition-colors duration-[var(--transition-fast)]">
      <div className="space-y-1.5">
        {/* Platform name */}
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">{platform}</p>

        {/* Price */}
        {price !== null && price !== undefined ? (
          <p className="text-lg font-bold text-[var(--color-text-primary)]">
            {formatCurrency(price, currency)}
          </p>
        ) : (
          <p className="text-sm text-[var(--color-text-muted)]">Price unavailable</p>
        )}

        {/* Stock badge */}
        <div className="flex items-center gap-1">
          {inStock ? (
            <>
              <Package size={12} className="text-[var(--color-badge-in-stock)]" aria-hidden="true" />
              <span className="text-xs text-[var(--color-badge-in-stock)] font-medium">In stock</span>
            </>
          ) : (
            <>
              <PackageX size={12} className="text-[var(--color-badge-out-of-stock)]" aria-hidden="true" />
              <span className="text-xs text-[var(--color-badge-out-of-stock)] font-medium">Out of stock</span>
            </>
          )}
        </div>
      </div>

      {/* External link */}
      {competitorProductUrl && (
        <a
          href={competitorProductUrl}
          target="_blank"
          rel="noopener noreferrer nofollow sponsored"
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] hover:underline"
          aria-label={`View on ${platform} (opens in new tab)`}
        >
          View on {platform}
          <ExternalLink size={11} aria-hidden="true" />
        </a>
      )}
    </div>
  );
}
