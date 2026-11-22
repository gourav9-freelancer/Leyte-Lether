"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { api, ApiRequestError } from "@/lib/client/api";
import { formatPrice } from "@/lib/format";
import type { CartLine, CartView } from "@/lib/types";
import styles from "./cart.module.css";

type Notice = { tone: "error" | "success" | "warning"; title: string; text?: string; undo?: CartLine } | null;

export function CartContents({ initial }: { initial: CartView }) {
  const router = useRouter();
  const [cart, setCart] = useState<CartView>(initial);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [notice, setNotice] = useState<Notice>(initial.issues.length ? { tone: "warning", title: "Your cart was updated.", text: initial.issues.join(" ") } : null);

  async function mutate(lineId: number, run: () => Promise<CartView>, onOk?: (next: CartView) => void) {
    if (busyId !== null) return;
    setBusyId(lineId);
    try {
      const next = await run();
      setCart(next);
      onOk?.(next);
      router.refresh();
    } catch (e) {
      setNotice({
        tone: "error",
        title: "We couldn't update your cart.",
        text: e instanceof ApiRequestError ? e.message : "Your cart hasn't been updated. Please try again.",
      });
      if (e instanceof ApiRequestError && e.status === 404) {
        // Line vanished server-side — resync.
        api<CartView>("/api/cart").then(setCart).catch(() => {});
      }
    } finally {
      setBusyId(null);
    }
  }

  const changeQty = (line: CartLine, quantity: number) =>
    mutate(line.id, () => api<CartView>(`/api/cart/items/${line.id}`, { method: "PATCH", body: { quantity } }), () => setNotice(null));

  const remove = (line: CartLine) =>
    mutate(line.id, () => api<CartView>(`/api/cart/items/${line.id}`, { method: "DELETE" }), () =>
      setNotice({ tone: "success", title: `Removed ${line.name} from your cart.`, undo: line }),
    );

  const undo = (line: CartLine) =>
    mutate(-1, () => api<CartView>("/api/cart/items", { method: "POST", body: { productId: line.productId, quantity: line.quantity, config: line.config } }), () =>
      setNotice(null),
    );

  if (cart.lines.length === 0) {
    return (
      <div className="container" style={{ paddingBlock: 48 }}>
        {notice && (
          <div className={styles.toast}>
            <Alert
              tone={notice.tone}
              title={notice.title}
              onDismiss={() => setNotice(null)}
              actions={
                notice.undo ? (
                  <Button variant="text" compact onClick={() => undo(notice.undo!)} loading={busyId === -1} loadingText="Restoring…">
                    Undo
                  </Button>
                ) : undefined
              }
            >
              {notice.text}
            </Alert>
          </div>
        )}
        <EmptyState
          icon="shopping_bag"
          title="Your cart is waiting for something special."
          actions={<Button href="/shop">Explore the Collection</Button>}
        >
          Explore our handcrafted leather goods and find a piece that feels like yours.
        </EmptyState>
      </div>
    );
  }

  return (
    <>
      <div className={styles.main}>
        <div className={`container ${styles.grid}`}>
          <div>
            {notice && (
              <div className={styles.toast}>
                <Alert
                  tone={notice.tone}
                  title={notice.title}
                  card={notice.tone === "error"}
                  onDismiss={() => setNotice(null)}
                  actions={
                    notice.undo ? (
                      <Button variant="text" compact onClick={() => undo(notice.undo!)} loading={busyId === -1} loadingText="Restoring…">
                        Undo
                      </Button>
                    ) : undefined
                  }
                >
                  {notice.text}
                </Alert>
              </div>
            )}
            <ul className={styles.lines} aria-label="Items in your cart">
              {cart.lines.map((line) => (
                <li key={line.id} className={`${styles.line} ${busyId === line.id ? styles.lineBusy : ""}`} aria-busy={busyId === line.id || undefined}>
                  <Link href={`/product/${line.productId}`} className={styles.thumb} tabIndex={-1} aria-hidden="true">
                    <Image src={line.image.src} alt="" fill sizes="120px" />
                  </Link>
                  <div className={styles.lineBody}>
                    <div className={styles.lineHead}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {line.config.personalisation && <Badge>Personalised</Badge>}
                        <h2 className={styles.lineName}>
                          <Link href={`/product/${line.productId}`}>{line.name}</Link>
                        </h2>
                        <p className={styles.unit}>Unit price: {formatPrice(line.unitPriceCents)}</p>
                      </div>
                      <p className={styles.lineTotal} aria-label={`Line total ${formatPrice(line.lineTotalCents)}`}>
                        {formatPrice(line.lineTotalCents)}
                      </p>
                    </div>
                    {line.config.personalisation && (
                      <div className={styles.config}>
                        <span>
                          Personalised configuration saved<span className="desktop-only"> (details pending business option schema)</span>
                        </span>
                        <Link href={`/product/${line.productId}/personalise`} className={styles.configLink} aria-label={`Edit configuration for ${line.name}`}>
                          Edit<span className="desktop-only"> configuration</span>
                        </Link>
                      </div>
                    )}
                    <div className={styles.controls}>
                      <QuantityStepper
                        value={line.quantity}
                        onChange={(q) => changeQty(line, q)}
                        itemName={line.name}
                        busy={busyId === line.id}
                        disabled={busyId !== null && busyId !== line.id}
                      />
                      <button
                        type="button"
                        className={styles.remove}
                        onClick={() => remove(line)}
                        disabled={busyId !== null}
                        aria-label={`Remove ${line.name} from cart`}
                      >
                        <Icon name="delete" size={18} />
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <aside className={styles.summary} aria-labelledby="summary-title">
            <h2 id="summary-title" className={styles.summaryTitle}>
              Order summary
            </h2>
            <dl className={styles.rows}>
              <div className={styles.row}>
                <dt>Merchandise subtotal</dt>
                <dd>{formatPrice(cart.subtotalCents)}</dd>
              </div>
              <div className={`${styles.row} ${styles.muted}`}>
                <dt>Shipping</dt>
                <dd>Calculated at checkout.</dd>
              </div>
              <div className={`${styles.row} ${styles.muted}`}>
                <dt>Taxes</dt>
                <dd>Calculated at checkout.</dd>
              </div>
              <div className={`${styles.row} ${styles.totalRow}`}>
                <dt>Subtotal before shipping and taxes</dt>
                <dd>{formatPrice(cart.subtotalCents)}</dd>
              </div>
            </dl>
            <div className={styles.actions}>
              <div className={styles.summaryCheckout}>
                <Button href="/checkout" fullWidth>
                  Proceed to checkout
                </Button>
              </div>
              <Button href="/shop" variant="secondary" fullWidth>
                Continue shopping
              </Button>
            </div>
            <div className={styles.note}>
              <p className={styles.noteTitle}>Bespoke requests</p>
              <p>
                Looking for a custom-made piece?{" "}
                <Link href="/custom-orders" className={styles.noteLink}>
                  Request a custom order
                </Link>
                .
              </p>
            </div>
          </aside>
        </div>
      </div>

      <div className="sticky-purchase mobile-only" role="region" aria-label="Checkout">
        <div>
          <p style={{ fontSize: 12, lineHeight: "17px", color: "var(--color-neutral-700)" }}>Subtotal</p>
          <p className="t-price" style={{ color: "var(--color-brand-espresso)" }}>
            {formatPrice(cart.subtotalCents)}
          </p>
        </div>
        <Button href="/checkout" compact>
          Proceed to checkout
        </Button>
      </div>
      <div className="sticky-spacer mobile-only" aria-hidden="true" />
    </>
  );
}
