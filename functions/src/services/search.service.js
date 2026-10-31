const { db } = require("../config/firebase");
const { COLLECTIONS } = require("../utils/collections");

/**
 * Image search service.
 *
 * The ML embedding + vector similarity layer is explicitly out of scope.
 * This service:
 *  1. Accepts the uploaded image buffer (already validated by multer middleware)
 *  2. Logs the search event (for analytics)
 *  3. Returns a stub response — wire your embedding provider here when ready.
 *
 * The upload file is NOT persisted beyond the request (privacy requirement from spec).
 */
async function imageSearch(fileBuffer, mimetype, userId = null) {
  // Log the search event (no image data stored)
  const logRef = db.collection(COLLECTIONS.IMAGE_SEARCH_LOGS).doc();
  await logRef.set({
    userId: userId ?? null,
    mimetype,
    fileSizeBytes: fileBuffer.length,
    searchedAt: new Date(),
    // ML results are a future concern — placeholder shape shown below
    resultProductIds: [],
    status: "pending_ml_integration",
  });

  // ── STUB: Replace with embedding provider call ────────────────────────────
  // When the ML layer is ready, this is where you would:
  //   1. Send fileBuffer to your embedding service
  //   2. Run a vector similarity query against your product embeddings
  //   3. Return ranked product IDs
  //
  // For now, return an empty result set so the frontend degrades gracefully.
  // ──────────────────────────────────────────────────────────────────────────

  return {
    products: [],
    total: 0,
    message: "Image search is not yet configured. Please refine your search with text.",
    logId: logRef.id,
  };
}

module.exports = { imageSearch };
