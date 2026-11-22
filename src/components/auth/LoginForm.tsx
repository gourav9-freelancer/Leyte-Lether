"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { api, ApiRequestError } from "@/lib/client/api";
import { useHydrated } from "@/lib/client/useHydrated";
import { loginSchema } from "@/lib/validation";
import styles from "./auth.module.css";

type Values = z.input<typeof loginSchema>;

export function LoginForm({ next, notice }: { next: string; notice?: "expired" | "reset" | "signed-out" | null }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const hydrated = useHydrated();
  const { register, handleSubmit, formState } = useForm<Values>({ resolver: zodResolver(loginSchema), mode: "onTouched" });

  const onSubmit = handleSubmit(async (v) => {
    setError(null);
    try {
      await api("/api/auth/login", { method: "POST", body: v });
      setDone(true);
      router.replace(next);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : "Something unexpected happened. Please try again in a moment.");
    }
  });

  return (
    <form method="post" className={styles.form} onSubmit={onSubmit} noValidate>
      {notice === "expired" && (
        <Alert tone="warning" title="Your session has expired.">
          Please sign in again to securely access your account.
        </Alert>
      )}
      {notice === "signed-out" && (
        <Alert tone="success" title="You've been signed out.">
          Sign in again whenever you&apos;re ready.
        </Alert>
      )}
      {notice === "reset" && (
        <Alert tone="success" title="Password updated.">
          Sign in with your new password.
        </Alert>
      )}
      {error && (
        <Alert tone="error" title="We couldn't sign you in." card>
          {error}
        </Alert>
      )}
      <TextField
        label="Email address"
        type="email"
        icon="mail"
        autoComplete="email"
        placeholder="Enter your email address"
        required
        error={formState.errors.email?.message}
        {...register("email")}
      />
      <TextField
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="Enter your password."
        required
        error={formState.errors.password?.message}
        labelAction={
          <Link href="/forgot-password" className={styles.link}>
            Forgot password?
          </Link>
        }
        {...register("password")}
      />
      <Button type="submit" fullWidth loading={formState.isSubmitting || done} loadingText="Signing in…" disabled={!hydrated}>
        Sign In
      </Button>
    </form>
  );
}
