"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { api, ApiRequestError } from "@/lib/client/api";
import { useHydrated } from "@/lib/client/useHydrated";
import { resetPasswordSchema } from "@/lib/validation";
import styles from "./auth.module.css";

type Values = z.input<typeof resetPasswordSchema>;

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const hydrated = useHydrated();
  const { register, handleSubmit, formState } = useForm<Values>({ resolver: zodResolver(resetPasswordSchema), defaultValues: { token }, mode: "onTouched" });
  const onSubmit = handleSubmit(async (v) => {
    setError(null);
    try {
      await api("/api/auth/reset-password", { method: "POST", body: v });
      router.replace("/login?notice=reset");
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : "Something unexpected happened. Please try again in a moment.");
    }
  });
  return (
    <form method="post" className={styles.form} onSubmit={onSubmit} noValidate>
      {error && (
        <Alert tone="error" title="We couldn't reset your password." card>
          {error}
        </Alert>
      )}
      <input type="hidden" {...register("token")} />
      <TextField label="New password" type="password" autoComplete="new-password" required hint="Use at least 10 characters." error={formState.errors.password?.message} {...register("password")} />
      <TextField label="Confirm new password" type="password" autoComplete="new-password" required error={formState.errors.confirmPassword?.message} {...register("confirmPassword")} />
      <Button type="submit" fullWidth loading={formState.isSubmitting} loadingText="Saving…" disabled={!hydrated}>
        Set new password
      </Button>
    </form>
  );
}
