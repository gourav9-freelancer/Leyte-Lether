"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { api, ApiRequestError } from "@/lib/client/api";
import { useHydrated } from "@/lib/client/useHydrated";
import { forgotPasswordSchema } from "@/lib/validation";
import styles from "./auth.module.css";

type Values = z.input<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hydrated = useHydrated();
  const { register, handleSubmit, formState } = useForm<Values>({ resolver: zodResolver(forgotPasswordSchema), mode: "onTouched" });
  const onSubmit = handleSubmit(async (v) => {
    setError(null);
    try {
      await api("/api/auth/forgot-password", { method: "POST", body: v });
      setSent(true);
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : "Something unexpected happened. Please try again in a moment.");
    }
  });
  if (sent) {
    return (
      <Alert tone="success" title="Check your email.">
        If an account exists for that address, we&apos;ve sent a link to reset your password. The link expires in 30 minutes.
      </Alert>
    );
  }
  return (
    <form method="post" className={styles.form} onSubmit={onSubmit} noValidate>
      {error && (
        <Alert tone="error" title="We couldn't send the link." card>
          {error}
        </Alert>
      )}
      <TextField label="Email address" type="email" icon="mail" autoComplete="email" required error={formState.errors.email?.message} {...register("email")} />
      <Button type="submit" fullWidth loading={formState.isSubmitting} loadingText="Sending…" disabled={!hydrated}>
        Send reset link
      </Button>
    </form>
  );
}
