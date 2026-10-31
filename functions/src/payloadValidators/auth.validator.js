const { z } = require("zod");

const requestOtpSchema = z.object({
  identifier: z
    .string()
    .min(1, "Phone number or email is required")
    .refine(
      (val) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || // email
        /^\+?[1-9]\d{7,14}$/.test(val), // E.164 phone
      { message: "Must be a valid email address or phone number" }
    ),
  channel: z.enum(["sms", "email", "voice"]).default("sms"),
});

const verifyOtpSchema = z.object({
  identifier: z.string().min(1, "Identifier is required"),
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must be numeric"),
});

const resendOtpSchema = z.object({
  identifier: z.string().min(1, "Identifier is required"),
  channel: z.enum(["sms", "email", "voice"]).default("sms"),
});

module.exports = { requestOtpSchema, verifyOtpSchema, resendOtpSchema };
