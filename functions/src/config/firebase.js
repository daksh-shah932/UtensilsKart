const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

if (!admin.apps.length) {
  const isCloudEnvironment =
    process.env.FUNCTION_TARGET ||
    process.env.K_SERVICE ||
    process.env.GOOGLE_CLOUD_PROJECT;

  if (isCloudEnvironment) {
    admin.initializeApp();
  } else {
    const serviceAccountPath = path.resolve(__dirname, "../../service-account.json");
    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error(
        "[Firebase] service-account.json not found at functions/service-account.json.\n" +
        "Download from: Firebase Console → Project Settings → Service Accounts → Generate new private key"
      );
    }
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: "ipd-project-63fbf",
    });
  }
}

const db = admin.firestore();

// Note: Firebase Auth is NOT used — authentication is handled via custom JWT.
module.exports = { admin, db };
