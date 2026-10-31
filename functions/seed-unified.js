/**
 * Unified Seed Script
 * ─────────────────────────────────────────────────────────────────
 * 1. Reads stainless_steel_kitchen_utensils.json
 *    → Seeds full product records into Firestore `products` collection
 *    → Each product gets rich metadata: steel grade, weight, capacity,
 *      thickness, rust rating, induction compat, dishwasher safe, etc.
 *
 * 2. Reads stainless_steel_kitchen_utensils_billing_dataset.csv
 *    → Seeds transactions into Firestore `transactions` collection
 *    → Enriches matching products with aggregated sales data
 *      (totalSold, totalRevenue, avgDiscount, rating from sales)
 *
 * Usage:
 *   node seed-unified.js
 *
 * Or with custom paths:
 *   node seed-unified.js "path/to/utensils.json" "path/to/billing.csv"
 */

require("dotenv").config();
const fs   = require("fs");
const path = require("path");
const rl   = require("readline");

const { db }          = require("./src/config/firebase");
const { COLLECTIONS } = require("./src/utils/collections");
const { getProductImages } = require("./src/utils/productImages");

// ── File paths ────────────────────────────────────────────────────────────────
const JSON_PATH = process.argv[2] || path.resolve(
  "C:/Users/daksh/Downloads",
  "stainless_steel_kitchen_utensils.json"
);
const CSV_PATH = process.argv[3] || path.resolve(
  "C:/Users/daksh/Downloads",
  "stainless_steel_kitchen_utensils_billing_dataset.csv"
);

// ── Category normaliser ───────────────────────────────────────────────────────
const CATEGORY_MAP = {
  Bakeware:     "bakeware",
  Cookware:     "cookware",
  Storage:      "storage",
  Cutlery:      "cutlery",
  "Cutlery Set":"cutlery",
  Utensil:      "utensil",
  "Utensil Set":"utensil",
  Serveware:    "serveware",
  Appliance:    "appliance",
  Cleaning:     "cleaning",
};

// ── Unsplash images by category ──────────────────────────────────────────────
const CATEGORY_IMAGES = {
  bakeware:  "https://images.unsplash.com/photo-1574085733277-851d9d856a3a?w=800&q=80",
  cookware:  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
  storage:   "https://images.unsplash.com/photo-1584990347449-39b32ce3f37d?w=800&q=80",
  cutlery:   "https://images.unsplash.com/photo-1593759608142-e976b11c4fc3?w=800&q=80",
  utensil:   "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800&q=80",
  serveware: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80",
  appliance: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80",
  cleaning:  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
};

// ── Build tags from JSON item ─────────────────────────────────────────────────
function buildTags(item) {
  const tags = new Set();
  const name = (item.item_name || "").toLowerCase();
  name.split(" ").filter(w => w.length > 3).forEach(w => tags.add(w));
  if (item.brand && item.brand !== "Generic")
    tags.add(item.brand.toLowerCase());
  if (item.steel_grade) tags.add(item.steel_grade.toLowerCase().replace(/\s/g,"_"));
  if (item.finish)      tags.add(item.finish.toLowerCase().replace(/\s/g,"_"));
  if (item.induction_compatible === "Yes") tags.add("induction_compatible");
  if (item.dishwasher_safe === "Yes")      tags.add("dishwasher_safe");
  if (item.magnetic === "Yes")             tags.add("magnetic");
  tags.add("stainless_steel");
  tags.add("kitchen");
  tags.add("indian_kitchen");
  return [...tags].slice(0, 15);
}

// ── CSV parser ────────────────────────────────────────────────────────────────
function parseCSVLine(line) {
  const result = [];
  let current = "", inQ = false;
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ; }
    else if (ch === ',' && !inQ) { result.push(current.trim()); current = ""; }
    else { current += ch; }
  }
  result.push(current.trim());
  return result;
}

// ── Batch writer (≤ 499 ops per batch) ───────────────────────────────────────
async function writeBatch(ops) {
  const SIZE = 490;
  for (let i = 0; i < ops.length; i += SIZE) {
    const chunk = ops.slice(i, i + SIZE);
    const batch = db.batch();
    chunk.forEach(({ ref, data, merge }) => {
      if (merge) batch.set(ref, data, { merge: true });
      else       batch.set(ref, data);
    });
    await batch.commit();
    console.log(`   ✅ Committed ${Math.min(i + SIZE, ops.length)}/${ops.length}`);
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// STEP 1 — Seed products from JSON
// ════════════════════════════════════════════════════════════════════════════════
async function seedProducts() {
  console.log("\n📦 STEP 1: Loading product JSON...");
  console.log("   Path:", JSON_PATH);

  if (!fs.existsSync(JSON_PATH)) {
    console.error("❌ JSON file not found:", JSON_PATH);
    process.exit(1);
  }

  const raw  = fs.readFileSync(JSON_PATH, "utf-8");
  const data = JSON.parse(raw);
  const items = data.Utensils || data.utensils || [];

  if (!items.length) {
    console.error("❌ No items found in JSON (expected key 'Utensils')");
    process.exit(1);
  }

  console.log(`   Found ${items.length} items in JSON`);

  const now = new Date();
  const ops = items.map((item, idx) => {
    const rawCat   = item.category || "Utensil";
    const category = CATEGORY_MAP[rawCat] || rawCat.toLowerCase();
    const productImages = getProductImages(item.item_name, category);

    const product = {
      // ── Identity ─────────────────────────────────────────────
      id:       item.item_id,
      name:     item.item_name,
      brand:    item.brand || "Generic",
      category,
      material: "Stainless Steel",

      // ── Rich specs from JSON ──────────────────────────────────
      steel_grade:           item.steel_grade   || null,
      finish:                item.finish         || null,
      manufacturing_origin:  item.manufacturing_origin || null,
      weight_grams:          item.weight_grams   || null,
      capacity_ml:           item.capacity_ml    || null,
      thickness_mm:          item.thickness_mm   || null,
      induction_compatible:  item.induction_compatible || "No",
      dishwasher_safe:       item.dishwasher_safe || "No",
      magnetic:              item.magnetic        || "No",
      rust_resistance_rating: item.rust_resistance_rating_out_of_5 || null,
      typical_use_frequency: item.typical_use_frequency || null,
      paired_smart_appliance: item.paired_smart_appliance || null,
      smart_rfid_tag_id:     item.smart_rfid_tag_id || null,

      // ── Pricing & stock ───────────────────────────────────────
      price:         Math.round(item.price_inr || 0),
      originalPrice: null,
      currency:      "INR",
      inStock:       (item.stock_quantity || 0) > 0,
      stockCount:    item.stock_quantity || 0,

      // ── Display ───────────────────────────────────────────────
      images:      productImages,
      tags:        buildTags(item),
      description: `${item.item_name} by ${item.brand}. Premium Stainless Steel (${item.steel_grade || "SS"}) kitchen product. ${item.finish ? item.finish + " finish. " : ""}${item.induction_compatible === "Yes" ? "Induction compatible. " : ""}${item.dishwasher_safe === "Yes" ? "Dishwasher safe." : ""}`.trim(),

      // ── AI recommendation metadata ───────────────────────────
      suitable_for: [],    // will be enriched from billing data
      cuisine:      [],    // will be enriched from billing data
      rating:       item.rust_resistance_rating_out_of_5
                      ? parseFloat((3.5 + (item.rust_resistance_rating_out_of_5 / 5) * 1.5).toFixed(1))
                      : 4.0,
      totalSold:    0,
      totalRevenue: 0,

      // ── Meta ─────────────────────────────────────────────────
      source:     "json_import",
      createdAt:  now,
      updatedAt:  now,
    };

    const docRef = db.collection(COLLECTIONS.PRODUCTS).doc(item.item_id);
    return { ref: docRef, data: product, merge: false };
  });

  console.log(`\n🚀 Writing ${ops.length} products to Firestore...`);
  await writeBatch(ops);
  console.log(`\n✅ STEP 1 DONE — ${ops.length} products seeded (collection: products)`);

  // Return name lookup AND the raw items for building secondary index
  const lookup = {};
  items.forEach(item => {
    const key = `${item.item_name}||${item.brand}`;
    lookup[key] = item.item_id;
  });
  return { lookup, items };
}

// ════════════════════════════════════════════════════════════════════════════════
// STEP 2 — Seed transactions from billing CSV + enrich products
// ════════════════════════════════════════════════════════════════════════════════
// ── Build secondary lookup: category+brand → list of item_ids ──────────────────
function buildCategoryBrandLookup(items) {
  const map = new Map();
  for (const item of items) {
    const rawCat  = item.category || "Utensil";
    const cat     = CATEGORY_MAP[rawCat] || rawCat.toLowerCase();
    const brand   = (item.brand || "Generic").toLowerCase();
    const key     = `${cat}||${brand}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item.item_id);
  }
  return map;
}

// ── Extract short product type from billing CSV name ────────────────────────
// e.g. "Stainless Steel Kadai" → "kadai"
//      "Stainless Steel Knife Set (5pc)" → "knife set"
function extractProductType(name) {
  return name
    .replace(/stainless steel/i, "")
    .replace(/\([^)]*\)/g, "")  // remove (5pc) etc
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

async function seedTransactions(productLookup, categoryBrandLookup) {
  console.log("\n📊 STEP 2: Loading billing CSV...");
  console.log("   Path:", CSV_PATH);

  if (!fs.existsSync(CSV_PATH)) {
    console.log("⚠️  Billing CSV not found — skipping transaction seeding");
    return;
  }

  const fileStream = fs.createReadStream(CSV_PATH, { encoding: "utf-8" });
  const reader     = rl.createInterface({ input: fileStream, crlfDelay: Infinity });

  let headers     = null;
  const txOps     = [];             // transaction docs to write
  const productStats = new Map();   // item_id → aggregated stats

  for await (const line of reader) {
    if (!line.trim()) continue;
    const cols = parseCSVLine(line);

    if (!headers) {
      headers = cols.map(h => h.trim().toLowerCase().replace(/\s+/g, "_"));
      continue;
    }

    const row = {};
    headers.forEach((h, i) => (row[h] = (cols[i] || "").trim()));

    const productName  = row["product_name"] || "";
    const brand        = row["brand"]        || "Generic";
    const qty          = parseInt(row["quantity"],       10) || 1;
    const unitPrice    = parseFloat(row["unit_price_inr"])   || 0;
    const totalAmt     = parseFloat(row["total_amount_inr"]) || 0;
    const discountPct  = parseFloat(row["discount_pct"])     || 0;
    const invoiceId    = row["invoice_id"]   || "";
    const invoiceDate  = row["invoice_date"] || "";
    const city         = row["city"]         || "";
    const state        = row["state"]        || "";
    const channel      = row["sales_channel"]|| "";
    const payMode      = row["payment_mode"] || "";

    if (!productName) continue;

    // Strategy 1: exact "name||brand" match (from JSON items)
    const exactKey = `${productName}||${brand}`;
    let resolvedId = productLookup[exactKey] || null;

    // Strategy 2: category+brand match — pick first matching product
    if (!resolvedId) {
      const rawCat = row["category"] || "Utensil";
      const cat    = CATEGORY_MAP[rawCat] || rawCat.toLowerCase();
      const cbKey  = `${cat}||${brand.toLowerCase()}`;
      const candidates = categoryBrandLookup.get(cbKey);
      if (candidates && candidates.length > 0) {
        resolvedId = candidates[0]; // pick first matching product of that brand+category
      }
    }

    // Transaction document
    const txRef = db.collection("transactions").doc();
    txOps.push({
      ref: txRef,
      data: {
        invoice_id:    invoiceId,
        invoice_date:  invoiceDate,
        line_no:       parseInt(row["line_no"], 10) || 1,
        customer_id:   row["customer_id"] || "",
        city,
        state,
        sales_channel: channel,
        product_name:  productName,
        brand,
        category:      CATEGORY_MAP[row["category"]] || (row["category"] || "").toLowerCase(),
        material:      row["material"] || "Stainless Steel",
        quantity:      qty,
        unit_price_inr: unitPrice,
        gross_amount_inr: parseFloat(row["gross_amount_inr"]) || 0,
        discount_pct:  discountPct,
        discount_amount_inr: parseFloat(row["discount_amount_inr"]) || 0,
        taxable_amount_inr:  parseFloat(row["taxable_amount_inr"])  || 0,
        gst_pct:       parseFloat(row["gst_pct"]) || 12,
        tax_amount_inr: parseFloat(row["tax_amount_inr"]) || 0,
        total_amount_inr: totalAmt,
        payment_mode:  payMode,
        product_id:    resolvedId,   // linked to products collection
        createdAt:     new Date(),
      },
      merge: false,
    });

    // Accumulate stats per resolved product
    if (resolvedId) {
      if (!productStats.has(resolvedId)) {
        productStats.set(resolvedId, {
          totalSold:    0,
          totalRevenue: 0,
          discounts:    [],
          channels:     new Set(),
        });
      }
      const s = productStats.get(resolvedId);
      s.totalSold    += qty;
      s.totalRevenue += totalAmt;
      s.discounts.push(discountPct);
      s.channels.add(channel);
    }
  }

  console.log(`   Parsed ${txOps.length} transaction rows`);
  console.log(`   Matched ${productStats.size} products with sales data`);

  // Write transactions
  console.log(`\n🚀 Writing ${txOps.length} transactions to Firestore...`);
  await writeBatch(txOps);
  console.log(`\n✅ STEP 2a DONE — ${txOps.length} transactions seeded (collection: transactions)`);

  // Enrich products with aggregated sales stats
  console.log(`\n🔗 STEP 2b: Enriching ${productStats.size} products with sales stats...`);
  const enrichOps = [];
  const now = new Date();

  for (const [productId, stats] of productStats) {
    const avgDiscount = stats.discounts.reduce((a, b) => a + b, 0) / stats.discounts.length;
    // Rating: 3.5 base + up to 1.5 based on volume
    const rating = Math.round((3.5 + Math.min(stats.totalSold / 20, 1.5)) * 10) / 10;

    const docRef = db.collection(COLLECTIONS.PRODUCTS).doc(productId);
    enrichOps.push({
      ref: docRef,
      data: {
        totalSold:    stats.totalSold,
        totalRevenue: Math.round(stats.totalRevenue),
        avgDiscount:  Math.round(avgDiscount * 10) / 10,
        sales_channels: [...stats.channels],
        rating,
        updatedAt: now,
      },
      merge: true,
    });
  }

  await writeBatch(enrichOps);
  console.log(`\n✅ STEP 2b DONE — ${enrichOps.size || enrichOps.length} products enriched with sales data`);
}

// ════════════════════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════════════════════
async function main() {
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("   UtensilKart — Unified Database Seed");
  console.log("═══════════════════════════════════════════════════════");

  // Step 1: products from JSON
  const { lookup, items } = await seedProducts();

  // Build secondary index for category+brand matching
  const categoryBrandLookup = buildCategoryBrandLookup(items);
  console.log(`\n   Built category+brand index with ${categoryBrandLookup.size} keys`);

  // Step 2: transactions from CSV + enrich products
  await seedTransactions(lookup, categoryBrandLookup);

  console.log("\n🎉 ALL DONE! Database is fully populated.");
  console.log("\nFirestore collections updated:");
  console.log("  • products      — full product catalog with specs");
  console.log("  • transactions  — all billing transactions");
  console.log("\nAI assistant can now recommend from real product data.");
  process.exit(0);
}

main().catch(err => {
  console.error("\n❌ Seeding failed:", err.message);
  console.error(err.stack);
  process.exit(1);
});
