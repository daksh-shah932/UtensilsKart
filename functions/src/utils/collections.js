/**
 * Centralized Firestore collection name constants.
 * All services MUST import from here — never use raw string literals.
 */
const COLLECTIONS = {
  USERS: "users",
  PRODUCTS: "products",
  PRICE_COMPARISONS: "priceComparisons",
  OTP_REQUESTS: "otpRequests",
  IMAGE_SEARCH_LOGS: "imageSearchLogs",
  CHAT_SESSIONS: "chatSessions",
  ORDERS: "orders",
  PAYMENTS: "payments",
};

module.exports = { COLLECTIONS };
