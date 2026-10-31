const { Router } = require("express");
const productController = require("../controllers/product.controller");
const { requireAuth } = require("../middleware/requireAuth");
const { requireAdmin } = require("../middleware/requireAdmin");

const router = Router();

// Public routes
router.get("/", productController.listProducts);
router.get("/:id", productController.getProduct);

// Admin-only routes
router.post("/", requireAuth, requireAdmin, productController.createProduct);
router.patch("/:id", requireAuth, requireAdmin, productController.updateProduct);
router.delete("/:id", requireAuth, requireAdmin, productController.deleteProduct);

module.exports = router;
