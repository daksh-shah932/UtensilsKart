import { z } from "zod";

export const identifierSchema = z.object({
  identifier: z
    .string()
    .min(1, "Phone number or email is required")
    .refine(
      (val) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ||
        /^\+?[1-9]\d{7,14}$/.test(val),
      { message: "Enter a valid email or phone number (e.g. +919876543210)" }
    ),
  channel: z.enum(["sms", "email", "voice"]).default("sms"),
});

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must be numeric"),
});
