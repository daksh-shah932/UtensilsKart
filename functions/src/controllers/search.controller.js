const searchService = require("../services/search.service");

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB per spec

// POST /api/search/image
async function imageSearch(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "Image file is required" });
  }

  if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
    return res.status(400).json({
      error: `Unsupported file type. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`,
    });
  }

  if (req.file.size > MAX_FILE_SIZE_BYTES) {
    return res.status(400).json({ error: "File too large. Maximum size is 8MB" });
  }

  try {
    // userId extracted from JWT if authenticated; null for guest searches
    const userId = req.user?.uid ?? null;

    const result = await searchService.imageSearch(req.file.buffer, req.file.mimetype, userId);
    return res.status(200).json(result);
  } catch (err) {
    console.error("[imageSearch]", err);
    return res.status(500).json({ error: "Image search failed" });
  }
}

module.exports = { imageSearch };
