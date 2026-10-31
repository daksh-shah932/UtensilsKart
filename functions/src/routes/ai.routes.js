const express = require("express");
const aiController = require("../controllers/ai.controller");

const router = express.Router();

// POST /api/ai/chat - Send message and get AI response
router.post("/chat", aiController.chat);

// GET /api/ai/health - Check AI service status
router.get("/health", aiController.health);

// GET /api/ai/history - Get chat history for session
router.get("/history", aiController.history);

module.exports = router;
