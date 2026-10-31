"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { PhoneAuthForm } from "@/components/auth/PhoneAuthForm";
import { OtpInputForm } from "@/components/auth/OtpInputForm";
import { useAuth } from "@/lib/auth/useAuth";
import { requestOtp, verifyOtp, resendOtp } from "@/lib/api/authApi";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();

  const [step, setStep] = useState("request"); // "request" | "verify"
  const [identifier, setIdentifier] = useState("");
  const [channel, setChannel] = useState("sms");

  const [isRequesting, setIsRequesting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const [requestError, setRequestError] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [devOtp, setDevOtp] = useState("");

  // ── Step 1: Request OTP ───────────────────────────────────────────────────
  const handleRequestOtp = useCallback(async ({ identifier: id, channel: ch }) => {
    setIsRequesting(true);
    setRequestError("");
    try {
      const res = await requestOtp(id, ch);
      setIdentifier(id);
      setChannel(ch);
      setStep("verify");
      if (res._devOtp) {
        setDevOtp(res._devOtp);
        toast.info(`Dev mode — OTP is ${res._devOtp}`, { duration: 10000 });
      } else {
        toast.success("OTP sent successfully");
      }
    } catch (err) {
      const msg = err?.response?.data?.error ?? "Failed to send OTP. Please try again.";
      setRequestError(msg);
    } finally {
      setIsRequesting(false);
    }
  }, []);

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────
  const handleVerifyOtp = useCallback(
    async (otp) => {
      if (otp.length !== 6) return;
      setIsVerifying(true);
      setVerifyError("");
      try {
        const data = await verifyOtp(identifier, otp);
        // data = { accessToken, user: { uid, identifier, role }, message }
        signIn(data.accessToken, data.user);
        toast.success("Signed in successfully");
        const redirect = searchParams.get("redirect") ?? "/";
        router.push(redirect);
      } catch (err) {
        const msg = err?.response?.data?.error ?? "Invalid OTP. Please try again.";
        setVerifyError(msg);
      } finally {
        setIsVerifying(false);
      }
    },
    [identifier, signIn, router, searchParams]
  );

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResend = useCallback(async () => {
    setIsResending(true);
    setVerifyError("");
    try {
      const res = await resendOtp(identifier, channel);
      if (res._devOtp) {
        setDevOtp(res._devOtp);
        toast.info(`Dev mode — OTP is ${res._devOtp}`, { duration: 10000 });
      } else {
        toast.success("OTP resent");
      }
    } catch (err) {
      toast.error(err?.response?.data?.error ?? "Could not resend OTP.");
    } finally {
      setIsResending(false);
    }
  }, [identifier, channel]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--color-background)]">
      <div className="w-full max-w-sm bg-[var(--color-surface)] rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] p-8">
        {step === "request" ? (
          <PhoneAuthForm
            onSuccess={handleRequestOtp}
            isLoading={isRequesting}
            serverError={requestError}
          />
        ) : (
          <OtpInputForm
            identifier={identifier}
            onVerify={handleVerifyOtp}
            onResend={handleResend}
            isVerifying={isVerifying}
            isResending={isResending}
            error={verifyError}
            devOtp={devOtp}
          />
        )}
      </div>
    </div>
  );
}
