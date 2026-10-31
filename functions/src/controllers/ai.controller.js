const aiService = require("../services/aiService");

async function chat(req, res) {
  // Set a long timeout — Gemini can take 15-20s on first call
  req.setTimeout(60000);
  res.setTimeout(60000);

  try {
    const { messages, sessionId, chatId } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    // Call the real AI service (Gemini + product recommendations)
    const result = await aiService.chat(messages, sessionId, chatId);

    return res.json({
      reply: result.reply || result.message || "",
      options: result.options || null,
      recommended_products: result.recommended_products || result.products || [],
      sessionId,
      chatId
    });

  } catch (err) {
    console.error("[AI Chat]", err.message);
    const isQuota = err.message?.includes("429") || err.message?.includes("quota");
    return res.status(503).json({
      error: isQuota
        ? "AI is temporarily rate-limited. Please wait a minute and try again."
        : "AI service error",
      details: err.message
    });
  }
}

async function health(req, res) {
  return res.json({ 
    status: "ready",
    model: "gemini-3.8-flash",
    provider: "Google Gemini"
  });
}

async function history(req, res) {
  try {
    const { sessionId } = req.query;
    
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId query parameter required" });
    }

    const history = await aiService.getChatHistory(sessionId);
    return res.json({ history: history || [] });

  } catch (err) {
    console.error("[AI History]", err);
    return res.status(500).json({ error: "Failed to load history" });
  }
}

module.exports = { chat, health, history };
