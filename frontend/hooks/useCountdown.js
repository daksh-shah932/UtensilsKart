"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Generic countdown hook. Reused by:
 * - OTP resend cooldown timer (30–60s)
 * - OTP expiry display timer (5–10 min)
 */
export function useCountdown() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const start = useCallback(
    (durationSeconds) => {
      stop();
      setSeconds(durationSeconds);
      setIsRunning(true);

      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            stop();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [stop]
  );

  const reset = useCallback(() => {
    stop();
    setSeconds(0);
  }, [stop]);

  // Cleanup on unmount
  useEffect(() => () => stop(), [stop]);

  return { seconds, isRunning, start, reset };
}
