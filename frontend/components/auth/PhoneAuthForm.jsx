"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Loader2, Phone } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { identifierSchema } from "@/lib/validators/auth.schema";
import { cn } from "@/lib/utils/cn";

/**
 * Step 1: Collect phone number or email, send OTP request.
 */
export function PhoneAuthForm({ onSuccess, isLoading, serverError }) {
  const [channel, setChannel] = useState("sms");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(identifierSchema),
    defaultValues: { identifier: "", channel: "sms" },
  });

  const identifier = watch("identifier");
  const isEmail = identifier.includes("@");

  const onSubmit = (data) => {
    onSuccess({ identifier: data.identifier, channel });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full"
    >
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
          <Phone size={22} className="text-[var(--color-primary)]" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Sign in</h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Enter your phone number or email to receive an OTP
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="identifier"
            className="text-sm font-medium text-[var(--color-text-primary)]"
          >
            Phone or Email
          </Label>
          <input
            id="identifier"
            type="text"
            autoComplete="tel email"
            placeholder="+91 98765 43210 or you@example.com"
            aria-describedby={errors.identifier ? "identifier-error" : undefined}
            aria-invalid={!!errors.identifier}
            {...register("identifier")}
            className={cn(
              "w-full px-4 py-3 rounded-[var(--radius-md)] border bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors duration-[var(--transition-fast)]",
              errors.identifier
                ? "border-[var(--color-error)] focus:ring-[var(--color-error)]"
                : "border-[var(--color-border)]"
            )}
          />
          {errors.identifier && (
            <p id="identifier-error" role="alert" className="text-xs text-[var(--color-error)]">
              {errors.identifier.message}
            </p>
          )}
        </div>

        {/* Channel selector — only show SMS/Voice toggle for phone numbers */}
        {!isEmail && (
          <div className="flex gap-2">
            {["sms", "voice"].map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => setChannel(ch)}
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-[var(--radius-md)] border transition-colors duration-[var(--transition-fast)]",
                  channel === ch
                    ? "bg-[var(--color-primary-light)] border-[var(--color-primary)] text-[var(--color-primary)]"
                    : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]"
                )}
              >
                {ch === "sms" ? "SMS" : "Voice call"}
              </button>
            ))}
          </div>
        )}

        {/* Server error */}
        {serverError && (
          <p role="alert" className="text-sm text-[var(--color-error)] text-center">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[var(--color-primary)] text-[var(--color-text-inverse)] font-semibold rounded-[var(--radius-md)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-[var(--transition-fast)]"
        >
          {isLoading && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
          {isLoading ? "Sending OTP…" : "Send OTP"}
        </button>
      </form>

      {/* Email fallback affordance */}
      {!isEmail && (
        <p className="mt-4 text-center text-xs text-[var(--color-text-muted)]">
          Having trouble with SMS?{" "}
          <button
            type="button"
            onClick={() => setChannel("email")}
            className="text-[var(--color-primary)] hover:underline font-medium"
          >
            Use email instead
          </button>
        </p>
      )}
    </motion.div>
  );
}
