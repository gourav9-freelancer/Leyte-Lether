"use client";

import { useHydrated } from "@/lib/client/useHydrated";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { accountStyles as s } from "@/components/account/AccountShell";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { api, ApiRequestError } from "@/lib/client/api";
import { profileSchema } from "@/lib/validation";

type Values = z.input<typeof profileSchema>;
type Notice = { kind: "saved" } | { kind: "error"; message: string } | { kind: "expired" } | null;

/**
 * Personal Information card — Figma 3:63 (desktop) / 3:201 (mobile).
 * Read-only details by default; "Edit details" switches to the edit state.
 */
export function ProfileForm({ email, defaults }: { email: string; defaults: Values }) {
  const router = useRouter();
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [saved, setSaved] = useState<Values>(defaults);
  const [notice, setNotice] = useState<Notice>(null);
  const editButton = useRef<HTMLButtonElement>(null);
  const firstField = useRef<HTMLInputElement | null>(null);
  const hydrated = useHydrated();
  const { register, handleSubmit, setError, reset, formState } = useForm<Values>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaults,
    mode: "onTouched",
  });

  // Move focus into the form when editing starts, and back to the trigger when it ends.
  useEffect(() => {
    if (mode === "edit") firstField.current?.focus();
  }, [mode]);

  function startEdit() {
    reset(saved);
    setNotice(null);
    setMode("edit");
  }

  function cancel() {
    reset(saved);
    setNotice(null);
    setMode("view");
    requestAnimationFrame(() => editButton.current?.focus());
  }

  const onSubmit = handleSubmit(async (v) => {
    setNotice(null);
    try {
      const next = await api<Values>("/api/account/profile", { method: "PATCH", body: v });
      setSaved(next);
      reset(next);
      setMode("view");
      setNotice({ kind: "saved" });
      router.refresh();
      requestAnimationFrame(() => editButton.current?.focus());
    } catch (e) {
      if (e instanceof ApiRequestError && e.status === 401) return setNotice({ kind: "expired" });
      if (e instanceof ApiRequestError && e.fields) for (const [k, m] of Object.entries(e.fields)) setError(k as keyof Values, { message: m });
      // Entered values are preserved — the form stays in edit mode.
      setNotice({ kind: "error", message: e instanceof ApiRequestError ? e.message : "Please check your details and try again." });
    }
  });

  const value = (v: string | undefined) =>
    v ? <dd className={s.detailValue}>{v}</dd> : <dd className={`${s.detailValue} ${s.muted}`}>Not yet provided</dd>;
  const firstNameField = register("firstName");

  return (
    <div className={s.panel}>
      <div className={s.panelHead}>
        <div>
          <h2 className={s.panelTitle}>Your details</h2>
          <p className="t-body-s" style={{ color: "var(--color-neutral-700)", marginTop: 4 }}>
            Review or update your name and contact details.
          </p>
        </div>
        {mode === "view" && (
          <Button ref={editButton} variant="secondary" compact onClick={startEdit}>
            <Icon name="edit_note" size={18} />
            <span className="desktop-only">Edit details</span>
            <span className="mobile-only">Edit</span>
          </Button>
        )}
      </div>

      {notice?.kind === "saved" && <Alert tone="success" title="Your details have been saved." onDismiss={() => setNotice(null)} />}
      {notice?.kind === "error" && (
        <Alert tone="error" title="We couldn't save your changes." card>
          {notice.message}
        </Alert>
      )}
      {notice?.kind === "expired" && (
        <Alert
          tone="warning"
          title="Your session has expired."
          actions={
            <Button href="/login?next=/account/personal-information&notice=expired" compact>
              Sign in again
            </Button>
          }
        >
          Please sign in again to securely access your account. Your changes were not saved.
        </Alert>
      )}

      {mode === "view" ? (
        <dl className={s.details}>
          <div>
            <dt className={s.detailLabel}>First name</dt>
            {value(saved.firstName)}
          </div>
          <div>
            <dt className={s.detailLabel}>Last name</dt>
            {value(saved.lastName)}
          </div>
          <div>
            <dt className={s.detailLabel}>Email address</dt>
            {value(email)}
          </div>
          <div>
            <dt className={s.detailLabel}>Phone number</dt>
            {value(saved.phone)}
          </div>
        </dl>
      ) : (
        <form method="post" className={s.form} onSubmit={onSubmit} noValidate aria-label="Edit personal details">
          <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <TextField
              label="First name"
              autoComplete="given-name"
              required
              error={formState.errors.firstName?.message}
              {...firstNameField}
              ref={(el) => {
                firstNameField.ref(el);
                firstField.current = el;
              }}
            />
            <TextField label="Last name" autoComplete="family-name" required error={formState.errors.lastName?.message} {...register("lastName")} />
          </div>
          <TextField label="Email address" type="email" icon="mail" value={email} readOnly disabled hint="Your sign-in email can't be changed here." />
          <TextField label="Phone number" type="tel" autoComplete="tel" optional error={formState.errors.phone?.message} {...register("phone")} />
          <div className={s.formActions}>
            <Button type="submit" loading={formState.isSubmitting} loadingText="Saving…" disabled={!hydrated}>
              Save changes
            </Button>
            <Button variant="secondary" onClick={cancel} disabled={formState.isSubmitting}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
