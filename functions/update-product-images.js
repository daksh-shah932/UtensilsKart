/**
 * Update all existing products in Firestore with accurate, item-specific photos.
 */

require("dotenv").config();
const { db } = require("./src/config/firebase");
const { COLLECTIONS } = require("./src/utils/collections");
const { getProductImages } = require("./src/utils/productImages");

async function migrateImages() {
  console.log("🔄 Fetching products from Firestore...");
  const snapshot = await db.collection(COLLECTIONS.PRODUCTS).get();
  console.log(`📦 Found ${snapshot.size} products in Firestore.`);

  if (snapshot.empty) {
    console.log("No products found.");
    return;
  }

  const BATCH_SIZE = 450;
  let currentBatch = db.batch();
  let opCount = 0;
  let updatedCount = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const name = data.name || data.item_name || "";
    const category = data.category || "";
    const accurateImages = getProductImages(name, category);

    // Update product with accurate images
    currentBatch.update(doc.ref, {
      images: accurateImages,
      updatedAt: new Date()
    });

    opCount++;
    updatedCount++;

    if (opCount >= BATCH_SIZE) {
      await currentBatch.commit();
      console.log(`   ✅ Committed batch of ${opCount} updates (Total: ${updatedCount}/${snapshot.size})`);
      currentBatch = db.batch();
      opCount = 0;
    }
  }

  if (opCount > 0) {
    await currentBatch.commit();
    console.log(`   ✅ Committed final batch of ${opCount} updates.`);
  }

  console.log(`\n🎉 Successfully updated all ${updatedCount} products with accurate photos!`);
}

migrateImages()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Migration error:", err);
    process.exit(1);
  });
