import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatPrice } from "@/lib/format";
import { getOrderByAccessToken } from "@/server/orders";
import { paymentMode, settleStripeSession } from "@/server/payments";
import { RefreshWhilePending } from "./RefreshWhilePending";
import styles from "../../checkout.module.css";

export const metadata: Metadata = { title: "Order confirmation", robots: { index: false } };

type Props = { params: Promise<{ token: string }>; searchParams: Promise<{ session_id?: string }> };

/** Order status comes from the database — never from the redirect itself. */
export default async function ConfirmationPage({ params, searchParams }: Props) {
  const { token } = await params;
  const { session_id } = await searchParams;
  let order = getOrderByAccessToken(token);
  if (!order) notFound();

  if (order.status === "pending_payment" && paymentMode() === "stripe" && session_id && /^cs_[A-Za-z0-9_]{10,200}$/.test(session_id) && session_id === order.paymentRef) {
    try {
      await settleStripeSession(session_id); // server-side verification with Stripe
      order = getOrderByAccessToken(token)!;
    } catch {
      /* fall through to pending state; webhook will settle */
    }
  }

  return (
    <section style={{ padding: "48px 0 96px" }} aria-labelledby="confirm-title">
      <div className="container-reading" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {order.status === "paid" && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <p className="t-eyebrow">Order confirmed</p>
              <h1 id="confirm-title" className="t-h1" style={{ color: "var(--color-brand-espresso)" }}>
                Thank you, {order.firstName}.
              </h1>
              <p className="t-body" style={{ color: "var(--color-neutral-700)" }}>
                Your order <strong>{order.orderNumber}</strong> has been received and payment confirmed.
              </p>
            </div>
            <Alert tone="success" title="Payment confirmed.">
              A confirmation will be sent to {order.email} once email delivery is configured by Leyte Leather.
            </Alert>
          </>
        )}
        {order.status === "pending_payment" && (
          <>
            <h1 id="confirm-title" className="t-h1" style={{ color: "var(--color-brand-espresso)" }}>
              Confirming your payment…
            </h1>
            <RefreshWhilePending />
          </>
        )}
        {(order.status === "payment_failed" || order.status === "cancelled") && (
          <>
            <h1 id="confirm-title" className="t-h1" style={{ color: "var(--color-brand-espresso)" }}>
              Payment was not completed.
            </h1>
            <EmptyState
              icon="error"
              title="We couldn't take payment for this order."
              actions={
                <>
                  <Button href="/checkout">Try again</Button>
                  <Button href="/cart" variant="secondary">
                    Review cart
                  </Button>
                </>
              }
            >
              You have not been charged for order {order.orderNumber}. Your cart has been kept so you can try again.
            </EmptyState>
          </>
        )}

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Order {order.orderNumber}</h2>
          <ul className={styles.items}>
            {order.items.map((i) => (
              <li key={`${i.productId}-${JSON.stringify(i.config)}`} className={styles.item}>
                <div className={styles.itemText}>
                  <p className={styles.itemName}>{i.name}</p>
                  <p>
                    Qty {i.quantity} × {formatPrice(i.unitPriceCents)}
                    {i.config.personalisation ? " · Personalised (details pending)" : ""}
                  </p>
                </div>
                <p className={styles.itemPrice}>{formatPrice(i.lineTotalCents)}</p>
              </li>
            ))}
          </ul>
          <dl className={styles.rows}>
            <div className={styles.row}>
              <dt>Merchandise subtotal</dt>
              <dd>{formatPrice(order.subtotalCents)}</dd>
            </div>
            {order.shippingCents !== null && (
              <div className={styles.row}>
                <dt>Shipping</dt>
                <dd>{formatPrice(order.shippingCents)}</dd>
              </div>
            )}
            {order.taxCents !== null && (
              <div className={styles.row}>
                <dt>Taxes</dt>
                <dd>{formatPrice(order.taxCents)}</dd>
              </div>
            )}
            {order.totalCents !== null && (
              <div className={`${styles.row} ${styles.total}`}>
                <dt>Total paid</dt>
                <dd>{formatPrice(order.totalCents)}</dd>
              </div>
            )}
          </dl>
        </div>
        {order.status === "paid" && (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Button href="/shop">Continue shopping</Button>
            <Button href="/account/orders" variant="secondary">
              View order history
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
