import type { Metadata } from "next";
import Image from "next/image";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatPrice } from "@/lib/format";
import { currentCustomer } from "@/server/auth";
import { getCart } from "@/server/cart";
import { paymentMode } from "@/server/payments";
import { CheckoutForm } from "./CheckoutForm";
import styles from "./checkout.module.css";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ payment?: string }> }) {
  const [cart, customer, sp] = await Promise.all([getCart(), currentCustomer(), searchParams]);
  const mode = paymentMode();

  return (
    <>
      <section className={styles.intro} aria-labelledby="checkout-title">
        <div className={`container ${styles.introText}`}>
          <p className="t-eyebrow">Checkout</p>
          <h1 id="checkout-title" className="t-h1" style={{ color: "var(--color-brand-espresso)" }}>
            Almost yours.
          </h1>
          <p className="t-body" style={{ color: "var(--color-neutral-700)" }}>
            Confirm your details, then complete payment securely.
          </p>
        </div>
      </section>

      {cart.lines.length === 0 && cart.issues.length > 0 ? (
        <div className="container" style={{ paddingBlock: 48, display: "grid", gap: 16, maxWidth: 760 }}>
          <Alert tone="warning" title="Your cart needs a review." actions={<Button href="/cart" compact>Review your cart</Button>}>
            {cart.issues.join(" ")}
          </Alert>
        </div>
      ) : cart.lines.length === 0 ? (
        <div className="container" style={{ paddingBlock: 48 }}>
          <EmptyState icon="shopping_bag" title="Your cart is empty." actions={<Button href="/shop">Explore the Collection</Button>}>
            Add a piece to your cart before checking out.
          </EmptyState>
        </div>
      ) : (
        <div className={styles.main}>
          <div className={`container ${styles.grid}`}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {sp.payment === "cancelled" && (
                <Alert tone="warning" title="Payment was not completed.">
                  You have not been charged. Your cart is saved — you can try again when you&apos;re ready.
                </Alert>
              )}
              {mode === "unconfigured" && (
                <Alert tone="error" title="Online payment isn't available yet." card>
                  Leyte Leather hasn&apos;t finished configuring online payments. Your cart is saved. Please check back soon.
                </Alert>
              )}
              {mode === "development" && (
                <Alert tone="warning" title="Development payment mode">
                  This environment uses a payment simulator. No real payments are processed.
                </Alert>
              )}
              {cart.issues.map((i) => (
                <Alert key={i} tone="warning" title="Your cart was updated.">
                  {i}
                </Alert>
              ))}
              <CheckoutForm
                defaults={{ email: customer?.email ?? "", firstName: customer?.first_name ?? "", lastName: customer?.last_name ?? "", phone: customer?.phone ?? "" }}
                emailLocked={Boolean(customer)}
                disabled={mode === "unconfigured"}
                devMode={mode === "development"}
              />
            </div>
            <aside className={`${styles.card} ${styles.sticky}`} aria-labelledby="review-title">
              <h2 id="review-title" className={styles.cardTitle}>
                Order review
              </h2>
              <ul className={styles.items}>
                {cart.lines.map((l) => (
                  <li key={l.id} className={styles.item}>
                    <div className={styles.itemThumb}>
                      <Image src={l.image.src} alt="" fill sizes="56px" />
                    </div>
                    <div className={styles.itemText}>
                      <p className={styles.itemName}>{l.name}</p>
                      <p>
                        Qty {l.quantity}
                        {l.config.personalisation ? " · Personalised (details pending)" : ""}
                      </p>
                    </div>
                    <p className={styles.itemPrice}>{formatPrice(l.lineTotalCents)}</p>
                  </li>
                ))}
              </ul>
              <dl className={styles.rows}>
                <div className={styles.row}>
                  <dt>Merchandise subtotal</dt>
                  <dd>{formatPrice(cart.subtotalCents)}</dd>
                </div>
                <div className={styles.row}>
                  <dt>Shipping</dt>
                  <dd>Calculated at payment</dd>
                </div>
                <div className={styles.row}>
                  <dt>Taxes</dt>
                  <dd>Calculated at payment</dd>
                </div>
                <div className={`${styles.row} ${styles.total}`}>
                  <dt>Subtotal before shipping and taxes</dt>
                  <dd>{formatPrice(cart.subtotalCents)}</dd>
                </div>
              </dl>
              <Button href="/cart" variant="text" compact>
                Edit cart
              </Button>
            </aside>
          </div>
        </div>
      )}
    </>
  );
}
