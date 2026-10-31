const { createProductSchema, updateProductSchema, productQuerySchema } = require("../payloadValidators/product.validator");
const productService = require("../services/product.service");

// GET /api/products
async function listProducts(req, res) {
  const parsed = productQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
  }

  try {
    const result = await productService.listProducts(parsed.data);
    return res.status(200).json(result);
  } catch (err) {
    console.error("[listProducts]", err);
    return res.status(500).json({ error: "Failed to fetch products" });
  }
}

// GET /api/products/:id
async function getProduct(req, res) {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    return res.status(200).json(product);
  } catch (err) {
    console.error("[getProduct]", err);
    return res.status(500).json({ error: "Failed to fetch product" });
  }
}

// POST /api/products  (admin only)
async function createProduct(req, res) {
  const parsed = createProductSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
  }

  try {
    const product = await productService.createProduct(parsed.data);
    return res.status(201).json(product);
  } catch (err) {
    console.error("[createProduct]", err);
    return res.status(500).json({ error: "Failed to create product" });
  }
}

// PATCH /api/products/:id  (admin only)
async function updateProduct(req, res) {
  const parsed = updateProductSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
  }

  try {
    const product = await productService.updateProduct(req.params.id, parsed.data);
    if (!product) return res.status(404).json({ error: "Product not found" });
    return res.status(200).json(product);
  } catch (err) {
    console.error("[updateProduct]", err);
    return res.status(500).json({ error: "Failed to update product" });
  }
}

// DELETE /api/products/:id  (admin only)
async function deleteProduct(req, res) {
  try {
    const deleted = await productService.deleteProduct(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Product not found" });
    return res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    console.error("[deleteProduct]", err);
    return res.status(500).json({ error: "Failed to delete product" });
  }
}

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
