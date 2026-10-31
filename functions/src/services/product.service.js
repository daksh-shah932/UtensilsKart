const { db } = require("../config/firebase");
const { COLLECTIONS } = require("../utils/collections");

// ─── List Products ────────────────────────────────────────────────────────────

async function listProducts({ category, brand, minPrice, maxPrice, inStock, search, page, limit }) {
  let query = db.collection(COLLECTIONS.PRODUCTS);

  if (category) query = query.where("category", "==", category);
  if (brand) query = query.where("brand", "==", brand);
  if (typeof inStock === "boolean") query = query.where("inStock", "==", inStock);

  // Fetch all matching docs (no orderBy to avoid index requirement)
  const snapshot = await query.get();

  let products = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? data.updatedAt,
    };
  });

  // Sort in-memory (fast for small catalogs)
  products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Post-fetch filters
  if (minPrice !== undefined) products = products.filter((p) => p.price >= minPrice);
  if (maxPrice !== undefined) products = products.filter((p) => p.price <= maxPrice);

  if (search) {
    const term = search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.brand?.toLowerCase().includes(term) ||
        p.tags?.some((t) => t.toLowerCase().includes(term))
    );
  }

  const total = products.length;
  const startIndex = (page - 1) * limit;
  const paginated = products.slice(startIndex, startIndex + limit);

  return {
    products: paginated,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ─── Get Product by ID ────────────────────────────────────────────────────────

async function getProductById(productId) {
  const doc = await db.collection(COLLECTIONS.PRODUCTS).doc(productId).get();
  if (!doc.exists) return null;
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString() ?? data.createdAt,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? data.updatedAt,
  };
}

// ─── Create Product ───────────────────────────────────────────────────────────

async function createProduct(data) {
  const now = new Date();
  const ref = db.collection(COLLECTIONS.PRODUCTS).doc();
  const product = { ...data, createdAt: now, updatedAt: now };
  await ref.set(product);
  return { id: ref.id, ...product };
}

// ─── Update Product ───────────────────────────────────────────────────────────

async function updateProduct(productId, data) {
  const ref = db.collection(COLLECTIONS.PRODUCTS).doc(productId);
  const doc = await ref.get();
  if (!doc.exists) return null;

  const updates = { ...data, updatedAt: new Date() };
  await ref.update(updates);
  return { id: productId, ...doc.data(), ...updates };
}

// ─── Delete Product ───────────────────────────────────────────────────────────

async function deleteProduct(productId) {
  const ref = db.collection(COLLECTIONS.PRODUCTS).doc(productId);
  const doc = await ref.get();
  if (!doc.exists) return false;
  await ref.delete();
  return true;
}

module.exports = { listProducts, getProductById, createProduct, updateProduct, deleteProduct };
