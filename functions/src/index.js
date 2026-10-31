const { onRequest } = require("firebase-functions/v2/https");
const app = require("./app");

// Export the Express app as a single Firebase Cloud Function
exports.api = onRequest(
  {
    region: "asia-south1",
    timeoutSeconds: 60,
    memory: "256MiB",
  },
  app
);
