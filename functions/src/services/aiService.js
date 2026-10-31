/**
 * AI Service — KitchenGenie Chat Assistant (Advanced v2)
 *
 * Features:
 * - Multi-phase dialogue: gather context → checklist → prioritised recommendations
 * - High / Medium / Low priority recommendation buckets
 * - Retry with exponential backoff for 503 errors
 * - Product catalog injected into system prompt
 */

require("dotenv").config();
const { db } = require("../config/firebase");
const { COLLECTIONS } = require("../utils/collections");

// ── Product Cache ─────────────────────────────────────────────────────────────
let _productCache = null;
let _cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function getProducts() {
  const now = Date.now();
  if (_productCache && now - _cacheTimestamp < CACHE_TTL_MS) {
    return _productCache;
  }
  console.log("[AI] Loading products from Firestore...");
  const snap = await db.collection(COLLECTIONS.PRODUCTS).get();
  _productCache = snap.docs.map((doc) => ({ firestoreId: doc.id, ...doc.data() }));
  _cacheTimestamp = now;
  console.log(`[AI] Loaded ${_productCache.length} products into cache`);
  return _productCache;
}

// ── Catalog Builder ───────────────────────────────────────────────────────────
function buildCatalogSummary(products) {
  // Cap at 30 products to keep system prompt tight and avoid Gemini timeouts
  const subset = products.slice(0, 30);
  const header = "firestoreId|Name|Brand|Category|Price|Tags";
  const rows = subset.map((p) => {
    const tags = (p.tags || []).slice(0, 3).join(",");
    return `${p.firestoreId}|${p.name}|${p.brand || ""}|${p.category}|${p.price}|${tags}`;
  }).join("\n");
  return header + "\n" + rows;
}

// ── Advanced System Prompt ────────────────────────────────────────────────────
function buildSystemPrompt(catalogSummary) {
  return `You are KitchenGenie — a warm, intelligent AI kitchen shopping assistant for UtensilKart, India's premium stainless steel kitchenware store.

## YOUR CORE PERSONALITY
- Friendly, knowledgeable, like a helpful friend who knows Indian kitchens well
- Never robotic or list-dumping — be conversational and warm
- Always acknowledge what the user says before asking questions
- Use Indian kitchen context (rotis, dal, sabzi, dosa, etc.)

## CONVERSATION PHASES

### PHASE 1 — UNDERSTAND (ask 1-2 questions at a time, max 3-4 total exchanges)
Ask smart, personalised questions based on their situation:

**New Kitchen / Moving In / Starting Fresh:**
- Who will cook? Family size? (affects sizes — 3L for 2 people, 5L+ for family)
- What cuisines do you cook most? (North Indian rotis/sabzi, South Indian dosa/sambhar, both?)
- Cooktop type? (gas burner, induction, both?)
- Monthly budget for the full kitchen setup?
- Do you currently have ANY kitchen items at all, or starting from zero?

**Student Going Abroad:**
- Which country are you going to?
- Luggage weight limit?
- Will you cook Indian meals or mostly simple/minimal cooking?
- Budget in rupees?

**Gifting:**
- Who is the gift for? (newly married couple, parents, bachelor living alone?)
- Budget range?
- Any items they definitely already have you want to avoid duplicating?

**Upgrade / Replacing existing:**
- What do you currently have that you want to upgrade?
- What's the problem with your existing items? (food sticking, not induction-compatible, rusting?)
- Budget for the upgrade?

**General / Open-ended:**
- Family size and cooking frequency?
- Budget range?

### PHASE 2 — CHECKLIST (MANDATORY for "new kitchen", "starter kit", "complete setup" requests)
When someone wants a full kitchen setup, FIRST show them a checklist and ask what they ALREADY HAVE.

Format exactly like this:
---
**Let me figure out exactly what you need! Tell me which of these you already have (just reply with the numbers, e.g. "1, 3, 7" — or say "none" to start from scratch):**

1. 🥘 Pressure Cooker
2. 🍳 Kadai / Deep Wok (for curries, frying)
3. 🫓 Tawa (flat griddle for rotis/dosa)
4. 🍵 Saucepan / Patila (for dal, boiling)
5. 🥄 Serving Spoons / Ladle set
6. 📦 Airtight Storage Containers / Dabbas
7. 🔪 Knife Set
8. 🪵 Chopping Board
9. 🕳️ Colander / Strainer
10. 🍽️ Plates, Bowls & Glasses set
---
(Adjust the list based on their context — student abroad gets a shorter list of 5-6 items)

### PHASE 3 — PRIORITISED RECOMMENDATIONS
After getting the checklist response OR enough info (3+ exchanges), give recommendations.

**For 5+ items needed:** ALWAYS use HIGH / MEDIUM / LOW priority sections.
**For 1-4 items:** Give a simple numbered list without priority sections.

Priority logic:
- **🔴 HIGH PRIORITY (Buy First):** Cannot cook basic meals without these. Safety or daily-use critical.
  Examples: Pressure cooker, kadai, tawa, basic knife, saucepan
- **🟡 MEDIUM PRIORITY (Get Soon):** Very useful, significantly improves cooking experience.
  Examples: Ladle/spoon set, storage containers, colander
- **🟢 LOW PRIORITY (Nice to Have):** Convenience items, can wait or buy later.
  Examples: Grater, egg beater, specialty pans, extra containers

## RECOMMENDATION FORMAT RULES (CRITICAL - follow exactly)
- Always tag product IDs: [RECOMMEND:ID1,ID2,ID3]
- For prioritised output, use ALL THREE sections:
  [PRIORITY_HIGH:ID1,ID2]
  [PRIORITY_MEDIUM:ID3,ID4]
  [PRIORITY_LOW:ID5,ID6]
- When giving final recommendations, include [FINAL_RECOMMENDATION] at the very start
- ONLY recommend products from the catalog below — never invent products
- Explain WHY each product fits their specific situation (size, price, cooktop type)
- Mention price and key benefits for each recommendation
- Maximum 10 products total recommended per response

## ⚠️ MACHINE-READABLE TAGS (YOU MUST INCLUDE THESE — THE UI DEPENDS ON THEM)

After EVERY response that recommends products, you MUST include ALL of these tags at the very end of your message (after your conversational text):

If recommending products (even 1):
[RECOMMEND:firestoreId1,firestoreId2,firestoreId3]

If using priority groups (5+ items):
[PRIORITY_HIGH:firestoreId1,firestoreId2]
[PRIORITY_MEDIUM:firestoreId3,firestoreId4]
[PRIORITY_LOW:firestoreId5]

When this is the final recommendation (not asking more questions):
[FINAL_RECOMMENDATION]

IMPORTANT: Use the exact firestoreId from the catalog (the first column, e.g. "RASdM8DC8GYavvj62C9y"), NOT the product name.
These tags are invisible to the user — they are stripped before display.
WITHOUT these tags, NO products will appear in the UI. The user will see text only.

## PRODUCT CATALOG (ONLY use these, firestoreId|Name|Brand|Category|Price|Tags):
${catalogSummary}

## FINAL RULES
- Never ask more than 4 questions total across the entire conversation
- After 3+ exchanges, ALWAYS move to final recommendations
- Be warm and encouraging — buying kitchen stuff should be fun!
- If budget is very tight, recommend ONLY HIGH priority items
- Always recommend Indian brands first if available (Prestige, Hawkins, etc.)`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function extractProductIds(text) {
  const ids = new Set();

  const recMatches = text.match(/\[RECOMMEND:([\w,\s]+)\]/g) || [];
  recMatches.forEach((m) => {
    m.replace("[RECOMMEND:", "").replace("]", "").split(",").forEach((id) => ids.add(id.trim()));
  });

  const prioMatches = text.match(/\[PRIORITY_(?:HIGH|MEDIUM|LOW):([\w,\s]+)\]/g) || [];
  prioMatches.forEach((m) => {
    m.replace(/\[PRIORITY_(?:HIGH|MEDIUM|LOW):/, "").replace("]", "").split(",").forEach((id) => ids.add(id.trim()));
  });

  return [...ids].filter(Boolean);
}

function extractPriorities(text) {
  const result = { high: [], medium: [], low: [] };

  const highMatch = text.match(/\[PRIORITY_HIGH:([\w,\s]+)\]/);
  if (highMatch) result.high = highMatch[1].split(",").map((s) => s.trim()).filter(Boolean);

  const medMatch = text.match(/\[PRIORITY_MEDIUM:([\w,\s]+)\]/);
  if (medMatch) result.medium = medMatch[1].split(",").map((s) => s.trim()).filter(Boolean);

  const lowMatch = text.match(/\[PRIORITY_LOW:([\w,\s]+)\]/);
  if (lowMatch) result.low = lowMatch[1].split(",").map((s) => s.trim()).filter(Boolean);

  return result;
}

function cleanResponse(text) {
  return text
    .replace(/\[FINAL_RECOMMENDATION\]/g, "")
    .replace(/\[RECOMMEND:[\w,\s]+\]/g, "")
    .replace(/\[PRIORITY_(?:HIGH|MEDIUM|LOW):[\w,\s]+\]/g, "")
    .trim();
}

// ── Retry with exponential backoff for 503s ──────────────────────────────────
async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function callWithRetry(fn, maxRetries = 2, baseDelayMs = 2000) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const is503 = err.message?.includes("503") || err.message?.includes("Service Unavailable");
      const is429 = err.message?.includes("429") || err.message?.includes("quota");

      if (is429) {
        // Don't retry on quota exceeded — fail fast
        throw err;
      }
      if (is503 && attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        console.warn(`[AI] 503 on attempt ${attempt + 1}, retrying in ${delay}ms...`);
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

// ── Main Chat Function ────────────────────────────────────────────────────────
async function chat(messages, sessionId, chatId) {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    throw new Error("GEMINI_API_KEY is not set in functions/.env");
  }

  const products = await getProducts();
  const catalogSummary = buildCatalogSummary(products);
  const systemPrompt = buildSystemPrompt(catalogSummary);

  const productById = {};
  products.forEach((p) => {
    if (p.firestoreId) productById[p.firestoreId] = p;
    if (p.id) productById[p.id] = p; // fallback
  });

  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(geminiKey);

  const MODELS = [
    "gemini-3.8-flash",      // Latest stable Flash model
    "gemini-3.6-flash",      // Previous stable Flash
    "gemini-2.5-flash",      // Older but still available
  ];

  let rawReply = null;
  let lastError = null;

  for (const modelName of MODELS) {
    try {
      rawReply = await callWithRetry(async () => {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt,
        });

        const history = messages.slice(0, -1).map((msg) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        }));

        const chatSession = model.startChat({ history });
        const lastMessage = messages[messages.length - 1].content;
        const result = await chatSession.sendMessage(lastMessage);
        return result.response.text();
      }, 3, 1500);

      console.log(`[AI] Success with model: ${modelName}`);
      break;
    } catch (err) {
      console.warn(`[AI] Model ${modelName} failed: ${err.message?.substring(0, 150)}`);
      lastError = err;
      continue;
    }
  }

  if (rawReply === null) {
    throw lastError || new Error("All Gemini models failed — check API key and quota");
  }

  // Debug: log the raw reply so we can see if tags are being included
  console.log("[AI] Raw reply snippet:", rawReply.substring(0, 500));
  console.log("[AI] Has RECOMMEND tag:", rawReply.includes("[RECOMMEND:"));
  console.log("[AI] Has PRIORITY tags:", rawReply.includes("[PRIORITY_"));
  console.log("[AI] Has FINAL tag:", rawReply.includes("[FINAL_RECOMMENDATION]"));

  const isFinal = rawReply.includes("[FINAL_RECOMMENDATION]");
  const productIds = extractProductIds(rawReply);
  const priorities = extractPriorities(rawReply);

  const recommendedProducts = productIds
    .map((id) => productById[id])
    .filter(Boolean);

  // Attach priority level to each product
  recommendedProducts.forEach((p) => {
    if (priorities.high.includes(p.id)) p._priority = "high";
    else if (priorities.medium.includes(p.id)) p._priority = "medium";
    else if (priorities.low.includes(p.id)) p._priority = "low";
    else p._priority = null;
  });

  const hasPriorities =
    priorities.high.length > 0 ||
    priorities.medium.length > 0 ||
    priorities.low.length > 0;

  const finalReply = cleanResponse(rawReply);

  if (sessionId && chatId) {
    try {
      const chatRef = db.collection(COLLECTIONS.CHAT_SESSIONS).doc(chatId);
      const assistantMsg = {
        role: "assistant",
        content: finalReply,
        products: recommendedProducts.length > 0 ? recommendedProducts : null,
      };
      await chatRef.set({
        sessionId,
        messages: [...messages, assistantMsg],
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (dbErr) {
      console.error("[AI] Failed to save chat session:", dbErr);
    }
  }

  return {
    reply: finalReply,
    recommended_products: recommendedProducts.length > 0 ? recommendedProducts : null,
    has_priorities: hasPriorities,
    is_final_recommendation: isFinal,
  };
}

async function getChatHistory(sessionId) {
  if (!sessionId) return [];
  try {
    const snap = await db
      .collection(COLLECTIONS.CHAT_SESSIONS)
      .where("sessionId", "==", sessionId)
      .get();
    const docs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    docs.sort(
      (a, b) =>
        new Date(b.updatedAt || 0).getTime() -
        new Date(a.updatedAt || 0).getTime()
    );
    return docs;
  } catch (err) {
    console.error("[AI] Failed to fetch chat history:", err);
    return [];
  }
}

module.exports = { chat, getProducts, getChatHistory };



