const { requestOtpSchema, verifyOtpSchema, resendOtpSchema } = require("../payloadValidators/auth.validator");
const authService = require("../services/auth.service");

const REFRESH_COOKIE_NAME = "refreshToken";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path: "/",
};

// POST /api/auth/otp/request
async function requestOtp(req, res) {
  const parsed = requestOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
  }
  try {
    const result = await authService.requestOtp(parsed.data.identifier, parsed.data.channel);
    return res.status(200).json(result);
  } catch (err) {
    console.error("[requestOtp]", err);
    return res.status(err.status || 500).json({ error: err.message });
  }
}

// POST /api/auth/otp/verify
async function verifyOtp(req, res) {
  const parsed = verifyOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
  }
  try {
    const { accessToken, refreshToken, user, isNewUser, message } =
      await authService.verifyOtp(parsed.data.identifier, parsed.data.otp);

    // Refresh token goes in an httpOnly cookie — frontend never reads it directly
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, COOKIE_OPTIONS);

    return res.status(200).json({ accessToken, user, isNewUser, message });
  } catch (err) {
    console.error("[verifyOtp]", err);
    return res.status(err.status || 500).json({ error: err.message });
  }
}

// POST /api/auth/otp/resend
async function resendOtp(req, res) {
  const parsed = resendOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
  }
  try {
    const result = await authService.resendOtp(parsed.data.identifier, parsed.data.channel);
    return res.status(200).json(result);
  } catch (err) {
    console.error("[resendOtp]", err);
    return res.status(err.status || 500).json({ error: err.message });
  }
}

// POST /api/auth/refresh
async function refresh(req, res) {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: "No refresh token provided" });
  }
  try {
    const { accessToken, refreshToken } = await authService.refreshAccessToken(token);
    // Rotate refresh token
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, COOKIE_OPTIONS);
    return res.status(200).json({ accessToken });
  } catch (err) {
    res.clearCookie(REFRESH_COOKIE_NAME, { path: "/" });
    return res.status(err.status || 401).json({ error: err.message });
  }
}

// POST /api/auth/logout
async function logout(req, res) {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/" });
  return res.status(200).json({ message: "Logged out successfully" });
}

module.exports = { requestOtp, verifyOtp, resendOtp, refresh, logout };
