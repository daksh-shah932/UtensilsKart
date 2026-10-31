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
    console.error("[AI Chat Error]", err.message);
    console.error("[AI Chat Stack]", err.stack);
    
    // Determine specific error type
    const isQuota = err.message?.includes("429") || err.message?.includes("quota") || err.message?.includes("rate");
    const isApiKey = err.message?.includes("API key") || err.message?.includes("GEMINI_API_KEY");
    const isTimeout = err.message?.includes("timeout") || err.message?.includes("ETIMEDOUT");
    const isNetwork = err.message?.includes("ECONNREFUSED") || err.message?.includes("fetch failed");
    
    let userError = "AI service encountered an error";
    let statusCode = 503;
    
    if (isQuota) {
      userError = "AI is temporarily rate-limited. The free tier allows 20 requests per day. Please wait or use a new API key.";
      statusCode = 429;
    } else if (isApiKey) {
      userError = "Gemini API key is missing or invalid. Please check your .env file.";
      statusCode = 500;
    } else if (isTimeout) {
      userError = "AI request timed out. Please try again with a simpler question.";
      statusCode = 504;
    } else if (isNetwork) {
      userError = "Cannot connect to Gemini API. Please check your internet connection.";
      statusCode = 503;
    } else if (err.message) {
      userError = err.message;
    }
    
    return res.status(statusCode).json({
      error: userError,
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
