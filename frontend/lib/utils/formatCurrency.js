const DEFAULT_LOCALE = "en-IN";
const DEFAULT_CURRENCY = "INR";

/**
 * Single source of truth for currency formatting across UtensilKart.
 * Used by PriceComparatorWidget, ProductCard, PDP, etc.
 */
export function formatCurrency(amount, currency = DEFAULT_CURRENCY, locale = DEFAULT_LOCALE) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Computes savings as both absolute (₹) and percentage relative to a reference price.
 * Returns null if inputs are invalid or there are no savings.
 */
export function computeSavings(ourPrice, competitorPrice) {
  if (!Number.isFinite(ourPrice) || !Number.isFinite(competitorPrice)) return null;
  if (competitorPrice <= ourPrice) return null;

  const absolute = competitorPrice - ourPrice;
  const percentage = Math.round((absolute / competitorPrice) * 100);
  return { absolute, percentage };
}
