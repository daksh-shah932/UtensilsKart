const { Router } = require("express");
const authController = require("../controllers/auth.controller");

const router = Router();

// POST /api/auth/otp/request  — request an OTP
router.post("/otp/request", authController.requestOtp);

// POST /api/auth/otp/verify   — verify OTP, receive accessToken + refresh cookie
router.post("/otp/verify", authController.verifyOtp);

// POST /api/auth/otp/resend   — resend OTP (subject to cooldown)
router.post("/otp/resend", authController.resendOtp);

// POST /api/auth/refresh      — exchange refresh cookie for new accessToken
router.post("/refresh", authController.refresh);

// POST /api/auth/logout       — clear refresh cookie
router.post("/logout", authController.logout);

module.exports = router;
