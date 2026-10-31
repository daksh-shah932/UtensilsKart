const { Router } = require("express");
const multer = require("multer");
const searchController = require("../controllers/search.controller");

const router = Router();

// Store file in memory only — never persist to disk (privacy requirement)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB hard limit
});

// POST /api/search/image
router.post("/image", upload.single("image"), searchController.imageSearch);

module.exports = router;
