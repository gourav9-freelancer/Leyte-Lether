"use client";

import { useHydrated } from "@/lib/client/useHydrated";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { accountStyles as s } from "@/components/account/AccountShell";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { api, ApiRequestError } from "@/lib/client/api";
import { changePasswordSchema } from "@/lib/validation";

type Values = z.input<typeof changePasswordSchema>;

export function ChangePasswordForm() {
  const [status, setStatus] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const hydrated = useHydrated();
  const { register, handleSubmit, reset, setError, formState } = useForm<Values>({ resolver: zodResolver(changePasswordSchema), mode: "onTouched" });
  const onSubmit = handleSubmit(async (v) => {
    setStatus(null);
    try {
      await api("/api/account/password", { method: "POST", body: v });
      reset({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setStatus({ tone: "success", text: "Your password has been updated. Other devices have been signed out." });
    } catch (e) {
      if (e instanceof ApiRequestError && e.fields) for (const [k, m] of Object.entries(e.fields)) setError(k as keyof Values, { message: m });
      setStatus({ tone: "error", text: e instanceof ApiRequestError ? e.message : "Please try again." });
    }
  });
  return (
    <form method="post" className={s.form} onSubmit={onSubmit} noValidate>
      {status && (
        <Alert tone={status.tone} title={status.tone === "success" ? "Password updated." : "We couldn't update your password."} card={status.tone === "error"}>
          {status.text}
        </Alert>
      )}
      <TextField label="Current password" type="password" autoComplete="current-password" required error={formState.errors.currentPassword?.message} {...register("currentPassword")} />
      <TextField label="New password" type="password" autoComplete="new-password" required hint="Use at least 10 characters." error={formState.errors.newPassword?.message} {...register("newPassword")} />
      <TextField label="Confirm new password" type="password" autoComplete="new-password" required error={formState.errors.confirmPassword?.message} {...register("confirmPassword")} />
      <div className={s.formActions}>
        <Button type="submit" loading={formState.isSubmitting} loadingText="Saving…" disabled={!hydrated}>
          Update password
        </Button>
      </div>
    </form>
  );
}

export function SessionControls({ otherSessions }: { otherSessions: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  async function revoke() {
    setBusy(true);
    setMsg(null);
    try {
      await api("/api/account/sessions", { method: "DELETE" });
      setMsg({ tone: "success", text: "All other devices have been signed out." });
      router.refresh();
    } catch (e) {
      setMsg({ tone: "error", text: e instanceof ApiRequestError ? e.message : "Please try again." });
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={s.form}>
      <p className="t-body-s" style={{ color: "var(--color-neutral-700)" }}>
        You are signed in on this device{otherSessions > 0 ? ` and ${otherSessions} other ${otherSessions === 1 ? "session" : "sessions"}` : " only"}.
      </p>
      {msg && <Alert tone={msg.tone} title={msg.text} />}
      <div className={s.formActions}>
        <Button variant="secondary" onClick={revoke} loading={busy} loadingText="Signing out…" disabled={otherSessions === 0}>
          Sign out of other devices
        </Button>
      </div>
    </div>
  );
}
