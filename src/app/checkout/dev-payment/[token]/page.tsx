import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { getOrderByAccessToken } from "@/server/orders";
import { paymentMode } from "@/server/payments";
import { DevPaymentActions } from "./DevPaymentActions";
import styles from "../../checkout.module.css";

export const metadata: Metadata = { title: "Development payment simulator", robots: { index: false } };

/** Only exists in development payment mode — 404 otherwise, including in production. */
export default async function DevPaymentPage({ params }: { params: Promise<{ token: string }> }) {
  if (paymentMode() !== "development") notFound();
  const { token } = await params;
  const order = getOrderByAccessToken(token);
  if (!order) notFound();
  return (
    <section style={{ padding: "48px 0 96px" }}>
      <div className="container-reading">
        <div className={styles.devBanner}>
          <p className="t-eyebrow" style={{ color: "var(--color-warning)" }}>
            Development mode — not a real payment
          </p>
          <h1 className="t-h2" style={{ color: "var(--color-brand-espresso)" }}>
            Payment simulator
          </h1>
          <p className="t-body" style={{ color: "var(--color-neutral-800)" }}>
            Order {order.orderNumber} · {formatPrice(order.subtotalCents)} (before shipping and taxes). In production this step is handled by the
            configured payment provider and this page does not exist.
          </p>
          {order.status === "pending_payment" ? (
            <DevPaymentActions token={token} />
          ) : (
            <p className="t-body">This order is no longer awaiting payment ({order.status}).</p>
          )}
        </div>
      </div>
    </section>
  );
}
