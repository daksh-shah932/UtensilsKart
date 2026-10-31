import { Ruler } from "lucide-react";

/**
 * Static size comparison fallback for browsers/devices that don't support WebXR.
 * Shows product dimensions alongside a common reference object.
 */
export function ARFallbackComparison({ product }) {
  const { name, capacity, images } = product;

  return (
    <div className="mt-6 p-5 bg-[var(--color-surface-muted)] rounded-[var(--radius-lg)] border border-[var(--color-border)]">
      <div className="flex items-center gap-2 mb-3">
        <Ruler size={18} className="text-[var(--color-text-secondary)]" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-[var(--color-text-secondary)]">
          Size Reference
        </h3>
      </div>

      <p className="text-sm text-[var(--color-text-muted)] mb-4">
        AR preview isn&apos;t supported on this device. Here&apos;s a size comparison to help you visualize.
      </p>

      <div className="flex items-start gap-4">
        {/* Product thumbnail */}
        {images?.[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={images[0]}
            alt={name}
            className="w-24 h-24 object-contain rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]"
          />
        )}

        <div className="flex-1 space-y-2">
          <div className="text-sm">
            <span className="font-medium text-[var(--color-text-primary)]">{name}</span>
            {capacity && (
              <span className="ml-2 text-[var(--color-text-muted)]">· {capacity}</span>
            )}
          </div>

          {/* Reference comparison */}
          <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
            <span className="px-2 py-1 bg-[var(--color-surface)] rounded border border-[var(--color-border)]">
              🍽️ Standard dinner plate ≈ 27cm
            </span>
            <span className="px-2 py-1 bg-[var(--color-surface)] rounded border border-[var(--color-border)]">
              📄 A4 sheet ≈ 21 × 30cm
            </span>
          </div>

          <p className="text-xs text-[var(--color-text-muted)]">
            Compare the dimensions above to these everyday objects for scale.
          </p>
        </div>
      </div>
    </div>
  );
}
