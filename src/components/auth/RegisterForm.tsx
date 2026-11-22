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
import { registerSchema } from "@/lib/validation";
import styles from "./auth.module.css";

type Values = z.input<typeof registerSchema>;

export function RegisterForm({ next }: { next: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const hydrated = useHydrated();
  const { register, handleSubmit, setError: setFieldError, formState } = useForm<Values>({ resolver: zodResolver(registerSchema), mode: "onTouched" });

  const onSubmit = handleSubmit(async (v) => {
    setError(null);
    try {
      await api("/api/auth/register", { method: "POST", body: v });
      setDone(true);
      router.replace(next);
      router.refresh();
    } catch (e) {
      if (e instanceof ApiRequestError && e.fields) {
        for (const [k, m] of Object.entries(e.fields)) setFieldError(k as keyof Values, { message: m });
      }
      setError(e instanceof ApiRequestError ? e.message : "Something unexpected happened. Please try again in a moment.");
    }
  });

  return (
    <form method="post" className={styles.form} onSubmit={onSubmit} noValidate>
      {error && (
        <Alert tone="error" title="We couldn't create your account." card>
          {error}
        </Alert>
      )}
      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <TextField label="First name" autoComplete="given-name" required error={formState.errors.firstName?.message} {...register("firstName")} />
        <TextField label="Last name" autoComplete="family-name" required error={formState.errors.lastName?.message} {...register("lastName")} />
      </div>
      <TextField label="Email address" type="email" icon="mail" autoComplete="email" required error={formState.errors.email?.message} {...register("email")} />
      <TextField
        label="Password"
        type="password"
        autoComplete="new-password"
        required
        hint="Use at least 10 characters."
        error={formState.errors.password?.message}
        {...register("password")}
      />
      <TextField label="Confirm password" type="password" autoComplete="new-password" required error={formState.errors.confirmPassword?.message} {...register("confirmPassword")} />
      <Button type="submit" fullWidth loading={formState.isSubmitting || done} loadingText="Creating your account…" disabled={!hydrated}>
        Create an account
      </Button>
    </form>
  );
}
