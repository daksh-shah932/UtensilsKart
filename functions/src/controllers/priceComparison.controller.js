const { mapCompetitorSchema, refreshBatchSchema } = require("../payloadValidators/priceComparison.validator");
const priceComparisonService = require("../services/priceComparison.service");

// GET /api/products/:id/price-comparison
async function getPriceComparison(req, res) {
  try {
    const data = await priceComparisonService.getPriceComparison(req.params.id);
    if (!data) return res.status(404).json({ error: "No price comparison found for this product" });
    return res.status(200).json(data);
  } catch (err) {
    console.error("[getPriceComparison]", err);
    return res.status(500).json({ error: "Failed to fetch price comparison" });
  }
}

// POST /api/admin/price-comparison/:productId/map
async function mapCompetitor(req, res) {
  const parsed = mapCompetitorSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
  }

  try {
    const result = await priceComparisonService.mapCompetitor(req.params.productId, parsed.data);
    return res.status(200).json(result);
  } catch (err) {
    console.error("[mapCompetitor]", err);
    return res.status(500).json({ error: "Failed to map competitor" });
  }
}

// POST /api/internal/price-comparison/refresh
async function refreshBatch(req, res) {
  const parsed = refreshBatchSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
  }

  try {
    const result = await priceComparisonService.refreshBatch(parsed.data.productIds);
    return res.status(200).json(result);
  } catch (err) {
    console.error("[refreshBatch]", err);
    return res.status(500).json({ error: "Failed to refresh price comparisons" });
  }
}

module.exports = { getPriceComparison, mapCompetitor, refreshBatch };
