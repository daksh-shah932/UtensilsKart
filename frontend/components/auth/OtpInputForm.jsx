"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ResendTimer } from "./ResendTimer";
import { useCountdown } from "@/hooks/useCountdown";

const OTP_LENGTH = 6;
const OTP_EXPIRY_SECONDS = 9 * 60; // 9 min (backend allows up to 10)

/**
 * 6-digit OTP input with:
 * - Individual digit boxes with auto-advance focus
 * - Auto-submit on last digit
 * - Web OTP API auto-fill on supported mobile browsers
 * - Expiry countdown
 * - Resend timer
 */
export function OtpInputForm({ identifier, onVerify, onResend, isVerifying, isResending, error, devOtp }) {
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));

  // Auto-fill the fixed dev OTP when it arrives from the backend
  useEffect(() => {
    if (devOtp && devOtp.length === OTP_LENGTH) {
      setDigits(devOtp.split(""));
    }
  }, [devOtp]);
  const inputsRef = useRef([]);
  const expiryCountdown = useCountdown();

  // Start the expiry timer on mount
  useEffect(() => {
    expiryCountdown.start(OTP_EXPIRY_SECONDS);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Web OTP API auto-fill (progressive enhancement)
  useEffect(() => {
    if (typeof window === "undefined" || !("OTPCredential" in window)) return;

    const abortController = new AbortController();
    navigator.credentials
      .get({ otp: { transport: ["sms"] }, signal: abortController.signal })
      .then((credential) => {
        if (credential?.code) {
          const codeDigits = credential.code.slice(0, OTP_LENGTH).split("");
          const filled = [...codeDigits, ...Array(OTP_LENGTH).fill("")].slice(0, OTP_LENGTH);
          setDigits(filled);
          onVerify(codeDigits.join(""));
        }
      })
      .catch(() => {}); // silently ignore — unsupported browser or user dismissal

    return () => abortController.abort();
  }, [onVerify]);

  const handleChange = useCallback(
    (index, value) => {
      // Only accept single digits
      const digit = value.replace(/\D/g, "").slice(-1);
      const newDigits = [...digits];
      newDigits[index] = digit;
      setDigits(newDigits);

      if (digit && index < OTP_LENGTH - 1) {
        inputsRef.current[index + 1]?.focus();
      }

      // Auto-submit when all 6 digits filled
      if (digit && index === OTP_LENGTH - 1) {
        const complete = [...newDigits.slice(0, -1), digit];
        if (complete.every((d) => d !== "")) {
          onVerify(complete.join(""));
        }
      }
    },
    [digits, onVerify]
  );

  const handleKeyDown = useCallback(
    (index, e) => {
      if (e.key === "Backspace") {
        if (digits[index]) {
          const newDigits = [...digits];
          newDigits[index] = "";
          setDigits(newDigits);
        } else if (index > 0) {
          inputsRef.current[index - 1]?.focus();
        }
      }
      if (e.key === "ArrowLeft" && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
      if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    },
    [digits]
  );

  const handlePaste = useCallback(
    (e) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
      if (!pasted) return;
      const newDigits = [...Array(OTP_LENGTH).fill("")];
      pasted.split("").forEach((d, i) => (newDigits[i] = d));
      setDigits(newDigits);
      const lastIndex = Math.min(pasted.length, OTP_LENGTH) - 1;
      inputsRef.current[lastIndex]?.focus();
      if (pasted.length === OTP_LENGTH) {
        onVerify(pasted);
      }
    },
    [onVerify]
  );

  const expiryMins = Math.floor(expiryCountdown.seconds / 60);
  const expirySecs = expiryCountdown.seconds % 60;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full"
    >
      {/* Heading */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Enter OTP</h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Sent to <span className="font-medium text-[var(--color-text-primary)]">{identifier}</span>
        </p>
        {expiryCountdown.isRunning && (
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Expires in {expiryMins}:{String(expirySecs).padStart(2, "0")}
          </p>
        )}
      </div>

      {/* Dev mode banner */}
      {devOtp && (
        <div className="mb-4 px-3 py-2 rounded-[var(--radius-md)] bg-[var(--color-warning-light)] border border-[var(--color-warning)] text-center">
          <p className="text-xs font-semibold text-[var(--color-warning)]">
            DEV MODE — OTP auto-filled: <span className="font-mono tracking-widest">{devOtp}</span>
          </p>
        </div>
      )}

      {/* Digit inputs */}
      <div
        className="flex justify-center gap-2 sm:gap-3 mb-4"
        role="group"
        aria-label="One-time password input"
      >
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputsRef.current[index] = el)}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={digit}
            aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={isVerifying}
            className={cn(
              "w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-[var(--radius-md)] border-2 bg-[var(--color-surface)] text-[var(--color-text-primary)] transition-colors duration-[var(--transition-fast)] focus:outline-none focus:border-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed",
              error
                ? "border-[var(--color-error)]"
                : digit
                  ? "border-[var(--color-primary)]"
                  : "border-[var(--color-border)]"
            )}
          />
        ))}
      </div>

      {/* Error message */}
      {error && (
        <p
          role="alert"
          className="text-sm text-[var(--color-error)] text-center mb-3"
        >
          {error}
        </p>
      )}

      {/* Submit button (manual, in case auto-submit was missed) */}
      <button
        type="button"
        onClick={() => onVerify(digits.join(""))}
        disabled={isVerifying || digits.some((d) => !d)}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[var(--color-primary)] text-[var(--color-text-inverse)] font-semibold rounded-[var(--radius-md)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-[var(--transition-fast)]"
      >
        {isVerifying && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
        {isVerifying ? "Verifying…" : "Verify OTP"}
      </button>

      <ResendTimer onResend={onResend} isLoading={isResending} />
    </motion.div>
  );
}
