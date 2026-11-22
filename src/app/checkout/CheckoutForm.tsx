"use client";

import { useHydrated } from "@/lib/client/useHydrated";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { api, ApiRequestError } from "@/lib/client/api";
import { checkoutSchema } from "@/lib/validation";
import styles from "./checkout.module.css";

const formSchema = checkoutSchema.omit({ idempotencyKey: true });
type FormValues = z.input<typeof formSchema>;

function newKey() {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function CheckoutForm({
  defaults,
  emailLocked,
  disabled,
  devMode,
}: {
  defaults: Partial<FormValues>;
  emailLocked: boolean;
  disabled: boolean;
  devMode: boolean;
}) {
  // One idempotency key per checkout attempt: double clicks / retries cannot create duplicate orders.
  const idempotencyKey = useMemo(newKey, []);
  const [serverError, setServerError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const hydrated = useHydrated();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { phone: "", ...defaults }, mode: "onTouched" });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const res = await api<{ redirectUrl: string }>("/api/checkout", { method: "POST", body: { ...values, idempotencyKey } });
      setRedirecting(true);
      window.location.assign(res.redirectUrl);
    } catch (e) {
      if (e instanceof ApiRequestError && e.fields) {
        for (const [k, msg] of Object.entries(e.fields)) setError(k as keyof FormValues, { message: msg });
      }
      setServerError(e instanceof ApiRequestError ? e.message : "We couldn't complete that. Please try again.");
    }
  });

  const busy = isSubmitting || redirecting;

  return (
    <form method="post" className={styles.form} onSubmit={onSubmit} noValidate aria-describedby={serverError ? "checkout-error" : undefined}>
      {serverError && (
        <Alert id="checkout-error" tone="error" title="We couldn't complete your checkout." card>
          {serverError} Your details have been kept.
        </Alert>
      )}
      <section className={styles.card} aria-labelledby="contact-title">
        <h2 id="contact-title" className={styles.cardTitle}>
          Contact details
        </h2>
        <div className={styles.fields}>
          <TextField
            label="Email address"
            type="email"
            autoComplete="email"
            icon="mail"
            required
            readOnly={emailLocked}
            hint={emailLocked ? "Orders are linked to your signed-in account." : "We'll send your order confirmation here."}
            error={errors.email?.message}
            {...register("email")}
          />
          <div className={`${styles.fields} ${styles.two}`}>
            <TextField label="First name" autoComplete="given-name" required error={errors.firstName?.message} {...register("firstName")} />
            <TextField label="Last name" autoComplete="family-name" required error={errors.lastName?.message} {...register("lastName")} />
          </div>
          <TextField label="Phone number" type="tel" autoComplete="tel" optional error={errors.phone?.message} {...register("phone")} />
        </div>
      </section>

      <section className={styles.card} aria-labelledby="payment-title">
        <h2 id="payment-title" className={styles.cardTitle}>
          Shipping &amp; payment
        </h2>
        <p className={styles.secure}>
          <Icon name="lock" size={18} />
          <span>
            {devMode
              ? "Development payment mode: no real payment will be taken. You'll be able to simulate a successful or failed payment."
              : "You'll enter your shipping address and card details on our payment provider's secure page. Card details never reach Leyte Leather's servers."}
          </span>
        </p>
        <Button type="submit" fullWidth loading={busy} loadingText={redirecting ? "Redirecting to payment…" : "Creating your order…"} disabled={!hydrated || disabled}>
          Continue to payment
        </Button>
      </section>
    </form>
  );
}
