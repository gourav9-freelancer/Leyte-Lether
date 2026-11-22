"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon, type IconName } from "@/components/ui/Icon";
import { formatDate, formatPrice, ORDER_STATUS_LABEL } from "@/lib/format";
import type { OrderStatus, OrderSummary } from "@/lib/types";
import shopStyles from "@/app/shop/shop.module.css";
import styles from "./orders.module.css";

const TABS: { id: "all" | OrderStatus; label: string }[] = [
  { id: "all", label: "All orders" },
  { id: "paid", label: "Paid" },
  { id: "pending_payment", label: "Awaiting payment" },
  { id: "payment_failed", label: "Payment failed" },
];

export const STATUS_TONE: Record<OrderStatus, "success" | "warning" | "error" | "default"> = {
  paid: "success",
  pending_payment: "warning",
  payment_failed: "error",
  cancelled: "default",
};

const STATUS_ICON: Record<OrderStatus, IconName> = {
  paid: "check_circle",
  pending_payment: "refresh",
  payment_failed: "error",
  cancelled: "close",
};

/** Status badge with icon (Figma 1:3783) — text + icon, never colour alone. */
export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge tone={STATUS_TONE[status]}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <Icon name={STATUS_ICON[status]} size={14} />
        {ORDER_STATUS_LABEL[status]}
      </span>
    </Badge>
  );
}

/** Factual status sentence derived from stored order data only. */
function statusSentence(o: OrderSummary): string {
  switch (o.status) {
    case "paid":
      return o.paidAt ? `Payment confirmed on ${formatDate(o.paidAt)}.` : "Payment confirmed.";
    case "pending_payment":
      return "Awaiting confirmation from the payment provider.";
    case "payment_failed":
      return "Payment was not completed. You have not been charged.";
    default:
      return "This order was cancelled.";
  }
}

export function OrderList({ orders }: { orders: OrderSummary[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const query = q.trim().toLowerCase();
    return orders.filter(
      (o) => (tab === "all" || o.status === tab) && (!query || o.orderNumber.toLowerCase().includes(query) || o.firstItemName.toLowerCase().includes(query)),
    );
  }, [orders, tab, q]);

  if (orders.length === 0) {
    return (
      <EmptyState
        icon="receipt_long"
        title="No orders yet."
        actions={
          <>
            <Button href="/shop">Explore the Collection</Button>
            <Button href="/custom-orders" variant="secondary">
              Explore Custom Orders
            </Button>
          </>
        }
      >
        When you place an order, you&apos;ll be able to find its details and updates here.
      </EmptyState>
    );
  }

  return (
    <>
      <div className={styles.filters}>
        <div className={styles.tabs} role="group" aria-label="Filter orders by status">
          {TABS.map((t) => (
            <button key={t.id} type="button" className={styles.tab} aria-pressed={tab === t.id} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <div className={shopStyles.search}>
          <label htmlFor="order-search" className="visually-hidden">
            Search by order number or product name
          </label>
          <Icon name="search" size={20} className={shopStyles.searchIcon} />
          <input
            id="order-search"
            type="search"
            className={shopStyles.searchInput}
            placeholder="Search by order number or product name"
            value={q}
            maxLength={80}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>
      <p className="visually-hidden" aria-live="polite">
        {shown.length} {shown.length === 1 ? "order" : "orders"} shown
      </p>
      {shown.length === 0 ? (
        <EmptyState icon="search" title="No matching orders." actions={<Button variant="secondary" onClick={() => { setQ(""); setTab("all"); }}>Show all orders</Button>}>
          Try another order number or product name.
        </EmptyState>
      ) : (
        <ul className={styles.list}>
          {shown.map((o) => (
            <li key={o.orderNumber} className={styles.order}>
              <div className={styles.orderHead}>
                <div>
                  <h2 className={styles.orderNumber}>Order #{o.orderNumber}</h2>
                  <p className={styles.orderDate}>Placed {formatDate(o.createdAt)}</p>
                </div>
                <StatusBadge status={o.status} />
              </div>
              <div className={styles.orderBody}>
                <div className={styles.item}>
                  {o.firstItemImage && (
                    <div className={styles.thumb}>
                      <Image src={o.firstItemImage.src} alt="" fill sizes="64px" />
                    </div>
                  )}
                  <div className={styles.itemLines}>
                    <p className={styles.itemName}>{o.firstItemName}</p>
                    <p className={styles.itemMeta}>Qty {o.firstItemQuantity}</p>
                    <p className={styles.itemMeta}>
                      {o.lineCount > 1
                        ? `+ ${o.lineCount - 1} more ${o.lineCount - 1 === 1 ? "item" : "items"}`
                        : o.firstItemPersonalised
                          ? "Personalised (details pending)"
                          : `${o.itemCount} ${o.itemCount === 1 ? "item" : "items"} in this order`}
                    </p>
                  </div>
                </div>
                <div className={styles.total}>
                  <p className={styles.totalLabel}>{o.totalCents !== null ? "Total" : "Subtotal"}</p>
                  <p className={styles.totalValue}>{formatPrice(o.totalCents ?? o.subtotalCents)}</p>
                </div>
              </div>
              <div className={styles.orderFoot}>
                <p className={styles.footNote}>{statusSentence(o)}</p>
                <Button
                  href={`/account/orders/${encodeURIComponent(o.orderNumber)}`}
                  variant="secondary"
                  compact
                  className={styles.footButton}
                  aria-label={`View order details for ${o.orderNumber}`}
                >
                  View order details
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
