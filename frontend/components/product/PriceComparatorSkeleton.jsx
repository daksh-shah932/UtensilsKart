export function PriceComparatorSkeleton() {
  return (
    <div className="mt-8 p-5 bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)]">
      <div className="skeleton h-4 w-40 rounded mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 rounded-[var(--radius-md)] border border-[var(--color-border)] space-y-2"
          >
            <div className="skeleton h-3 w-24 rounded" />
            <div className="skeleton h-5 w-20 rounded" />
            <div className="skeleton h-3 w-16 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
