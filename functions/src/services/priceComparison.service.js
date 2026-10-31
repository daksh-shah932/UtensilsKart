const { db } = require("../config/firebase");
const { COLLECTIONS } = require("../utils/collections");

// ─── Get cached comparison for a product ─────────────────────────────────────

async function getPriceComparison(productId) {
  const doc = await db.collection(COLLECTIONS.PRICE_COMPARISONS).doc(productId).get();
  if (!doc.exists) return null;

  const data = doc.data();

  // Filter out blacklisted competitors before returning
  const competitors = (data.competitors || []).filter((c) => !c.isBlacklisted);

  return {
    id: doc.id,
    ...data,
    competitors,
  };
}

// ─── Admin: map / override a competitor URL for a product ────────────────────

async function mapCompetitor(productId, { platform, competitorProductUrl, isBlacklisted }) {
  const ref = db.collection(COLLECTIONS.PRICE_COMPARISONS).doc(productId);
  const doc = await ref.get();

  const now = new Date();

  if (!doc.exists) {
    // Bootstrap a new comparison document for this product
    const newDoc = {
      productId,
      competitors: [
        {
          platform,
          competitorProductUrl,
          price: null,
          currency: "INR",
          inStock: null,
          lastCheckedAt: null,
          isBlacklisted: isBlacklisted ?? false,
        },
      ],
      ourPrice: null,
      bestPricePlatform: null,
      matchConfidence: null,
      updatedAt: now,
      createdAt: now,
    };
    await ref.set(newDoc);
    return { id: productId, ...newDoc };
  }

  const data = doc.data();
  const competitors = data.competitors || [];
  const existingIdx = competitors.findIndex((c) => c.platform === platform);

  if (existingIdx >= 0) {
    // Update existing competitor entry
    competitors[existingIdx] = {
      ...competitors[existingIdx],
      competitorProductUrl,
      isBlacklisted: isBlacklisted ?? competitors[existingIdx].isBlacklisted,
    };
  } else {
    competitors.push({
      platform,
      competitorProductUrl,
      price: null,
      currency: "INR",
      inStock: null,
      lastCheckedAt: null,
      isBlacklisted: isBlacklisted ?? false,
    });
  }

  await ref.update({ competitors, updatedAt: now });
  return { id: productId, ...data, competitors, updatedAt: now };
}

// ─── Internal: refresh price data for a batch of products ────────────────────
// NOTE: In production this is called by a scheduled Cloud Function / cron job.
// It would call your price-data provider API here. The stub below shows the
// shape — replace the placeholder with your actual provider call.

async function refreshBatch(productIds) {
  const results = { refreshed: [], skipped: [], errors: [] };

  for (const productId of productIds) {
    try {
      const ref = db.collection(COLLECTIONS.PRICE_COMPARISONS).doc(productId);
      const doc = await ref.get();

      if (!doc.exists) {
        results.skipped.push(productId);
        continue;
      }

      const data = doc.data();
      const competitors = data.competitors || [];
      const now = new Date();

      // ── STUB: replace with real provider API call per competitor ──────────
      // e.g. const livePrice = await priceProviderClient.getPrice(c.competitorProductUrl);
      const updatedCompetitors = competitors.map((c) => ({
        ...c,
        // Placeholder: price stays as-is until a real provider is wired
        lastCheckedAt: now,
      }));
      // ─────────────────────────────────────────────────────────────────────

      // Determine best price platform
      const livePrices = updatedCompetitors
        .filter((c) => !c.isBlacklisted && c.price !== null)
        .map((c) => ({ platform: c.platform, price: c.price }));

      let bestPricePlatform = "ours";
      if (data.ourPrice !== null && livePrices.length > 0) {
        const minCompetitor = livePrices.reduce((a, b) => (a.price < b.price ? a : b));
        if (minCompetitor.price < data.ourPrice) {
          bestPricePlatform = minCompetitor.platform;
        }
      }

      await ref.update({
        competitors: updatedCompetitors,
        bestPricePlatform,
        updatedAt: now,
      });

      results.refreshed.push(productId);
    } catch (err) {
      console.error(`[refreshBatch] Error refreshing ${productId}:`, err.message);
      results.errors.push({ productId, error: err.message });
    }
  }

  return results;
}

module.exports = { getPriceComparison, mapCompetitor, refreshBatch };
