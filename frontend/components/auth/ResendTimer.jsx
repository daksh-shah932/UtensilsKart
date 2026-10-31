"use client";

import { useEffect } from "react";
import { useCountdown } from "@/hooks/useCountdown";

const COOLDOWN_SECONDS = 60;

/**
 * Shows a disabled countdown button immediately after OTP is sent.
 * Re-enables and calls onResend when the timer hits zero.
 */
export function ResendTimer({ onResend, isLoading }) {
  const { seconds, isRunning, start } = useCountdown();

  // Start cooldown whenever this component mounts (i.e. OTP was just sent)
  useEffect(() => {
    start(COOLDOWN_SECONDS);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleResend = () => {
    start(COOLDOWN_SECONDS);
    onResend();
  };

  return (
    <div className="text-center mt-2">
      {isRunning ? (
        <p className="text-sm text-[var(--color-text-muted)]">
          Resend OTP in{" "}
          <span className="font-semibold text-[var(--color-text-secondary)]">{seconds}s</span>
        </p>
      ) : (
        <button
          type="button"
          onClick={handleResend}
          disabled={isLoading}
          className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-[var(--transition-fast)]"
        >
          {isLoading ? "Sending…" : "Resend OTP"}
        </button>
      )}
    </div>
  );
}
