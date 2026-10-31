const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { db } = require("../config/firebase");
const { COLLECTIONS } = require("../utils/collections");

const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

// In development, always use this fixed OTP — no SMS provider needed
const DEV_OTP = "123456";
const IS_DEV = process.env.NODE_ENV !== "production";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "dev-access-secret-change-in-production";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-in-production";
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateOtp() {
  if (IS_DEV) return DEV_OTP;
  const buf = crypto.randomBytes(4);
  const num = buf.readUInt32BE(0) % 1000000;
  return String(num).padStart(6, "0");
}

function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

function getOtpDocId(identifier) {
  return crypto.createHash("sha256").update(identifier).digest("hex");
}

function generateTokens(userId, role) {
  const payload = { uid: userId, role };

  const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });

  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });

  return { accessToken, refreshToken };
}

// ─── Request OTP ──────────────────────────────────────────────────────────────

async function requestOtp(identifier, channel) {
  const docId = getOtpDocId(identifier);
  const docRef = db.collection(COLLECTIONS.OTP_REQUESTS).doc(docId);
  const existing = await docRef.get();

  if (existing.exists) {
    const data = existing.data();
    const secondsSinceCreated = (Date.now() - data.createdAt.toMillis()) / 1000;
    if (secondsSinceCreated < RESEND_COOLDOWN_SECONDS) {
      const waitSeconds = Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceCreated);
      throw Object.assign(
        new Error(`Please wait ${waitSeconds}s before requesting another OTP`),
        { status: 429 }
      );
    }
  }

  const otp = generateOtp();
  const otpHash = hashOtp(otp);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await docRef.set({ identifier, otpHash, channel, attempts: 0, expiresAt, createdAt: now });

  if (IS_DEV) {
    console.log(`\n╔══════════════════════════════════════════╗`);
    console.log(`║  [DEV] OTP for ${identifier.padEnd(24)}║`);
    console.log(`║  Code : ${DEV_OTP}   (always 123456 in dev) ║`);
    console.log(`╚══════════════════════════════════════════╝\n`);
  }

  return {
    message: IS_DEV
      ? `[DEV MODE] OTP is always ${DEV_OTP} — no SMS sent`
      : `OTP sent via ${channel} to ${identifier}`,
    expiresInMinutes: OTP_EXPIRY_MINUTES,
    ...(IS_DEV && { _devOtp: DEV_OTP }),
  };
}

// ─── Verify OTP ───────────────────────────────────────────────────────────────

async function verifyOtp(identifier, submittedOtp) {
  const docId = getOtpDocId(identifier);
  const docRef = db.collection(COLLECTIONS.OTP_REQUESTS).doc(docId);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw Object.assign(
      new Error("No OTP request found. Please request a new OTP."),
      { status: 400 }
    );
  }

  const data = doc.data();

  if (new Date() > data.expiresAt.toDate()) {
    await docRef.delete();
    throw Object.assign(new Error("OTP has expired. Please request a new one."), { status: 400 });
  }

  if (data.attempts >= MAX_ATTEMPTS) {
    await docRef.delete();
    throw Object.assign(new Error("Too many failed attempts. Please request a new OTP."), { status: 429 });
  }

  const submittedHash = hashOtp(submittedOtp);

  if (submittedHash !== data.otpHash) {
    await docRef.update({ attempts: data.attempts + 1 });
    const remaining = MAX_ATTEMPTS - data.attempts - 1;
    throw Object.assign(
      new Error(`Invalid OTP. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`),
      { status: 400 }
    );
  }

  // OTP valid — delete record immediately
  await docRef.delete();

  // Upsert user in Firestore
  const usersRef = db.collection(COLLECTIONS.USERS);
  const isEmail = identifier.includes("@");
  const field = isEmail ? "email" : "phone";
  const existingUsers = await usersRef.where(field, "==", identifier).limit(1).get();

  let userId;
  let isNewUser = false;

  if (!existingUsers.empty) {
    userId = existingUsers.docs[0].id;
    await usersRef.doc(userId).update({ lastLoginAt: new Date() });
  } else {
    const newUserRef = usersRef.doc();
    await newUserRef.set({
      [field]: identifier,
      role: "customer",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
    });
    userId = newUserRef.id;
    isNewUser = true;
  }

  // Fetch role from Firestore
  const userDoc = await usersRef.doc(userId).get();
  const role = userDoc.data()?.role ?? "customer";

  // Issue our own JWT pair
  const { accessToken, refreshToken } = generateTokens(userId, role);

  return {
    message: "OTP verified successfully",
    accessToken,
    refreshToken,
    user: { uid: userId, identifier, role },
    isNewUser,
  };
}

// ─── Refresh Token ────────────────────────────────────────────────────────────

async function refreshAccessToken(refreshToken) {
  let payload;
  try {
    payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
  } catch {
    throw Object.assign(new Error("Invalid or expired refresh token"), { status: 401 });
  }

  // Verify user still exists
  const userDoc = await db.collection(COLLECTIONS.USERS).doc(payload.uid).get();
  if (!userDoc.exists) {
    throw Object.assign(new Error("User not found"), { status: 401 });
  }

  const role = userDoc.data()?.role ?? "customer";
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(payload.uid, role);

  return { accessToken, refreshToken: newRefreshToken };
}

// ─── Resend OTP ───────────────────────────────────────────────────────────────

async function resendOtp(identifier, channel) {
  return requestOtp(identifier, channel);
}

module.exports = { requestOtp, verifyOtp, resendOtp, refreshAccessToken };
