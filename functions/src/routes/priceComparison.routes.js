const { Router } = require("express");
const priceComparisonController = require("../controllers/priceComparison.controller");
const { requireAuth } = require("../middleware/requireAuth");
const { requireAdmin } = require("../middleware/requireAdmin");

const router = Router();

// Public: GET /api/products/:id/price-comparison
router.get(
  "/products/:id/price-comparison",
  priceComparisonController.getPriceComparison
);

// Admin: POST /api/admin/price-comparison/:productId/map
router.post(
  "/admin/price-comparison/:productId/map",
  requireAuth,
  requireAdmin,
  priceComparisonController.mapCompetitor
);

// Internal/cron: POST /api/internal/price-comparison/refresh
// Protected by a shared secret header rather than user auth
router.post("/internal/price-comparison/refresh", (req, res, next) => {
  const secret = req.headers["x-internal-secret"];
  if (!secret || secret !== process.env.INTERNAL_API_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}, priceComparisonController.refreshBatch);

module.exports = router;
