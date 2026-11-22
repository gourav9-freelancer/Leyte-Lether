import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AccountShell, accountStyles as s } from "@/components/account/AccountShell";
import { formatDate, formatPrice } from "@/lib/format";
import { getOrderForCustomer } from "@/server/orders";
import { requireCustomer } from "@/server/require-auth";
import { StatusBadge } from "../OrderList";
import styles from "../orders.module.css";

export const metadata: Metadata = { title: "Order details", robots: { index: false } };

/** Ownership is enforced in the query (customer_id = signed-in customer): other customers' orders 404. */
export default async function OrderDetailPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const c = await requireCustomer(`/account/orders/${encodeURIComponent(orderNumber)}`);
  if (!/^LL-\d{1,10}$/.test(orderNumber)) notFound();
  const order = getOrderForCustomer(c.id, orderNumber);
  if (!order) notFound();

  return (
    <AccountShell eyebrow="My account / Order history" title={`Order #${order.orderNumber}`} lead={`Placed ${formatDate(order.createdAt)}.`}>
      <Link href="/account/orders" className={s.textLink}>
        ← Back to order history
      </Link>
      <div className={s.panel}>
        <div className={s.panelHead}>
          <h2 className={s.panelTitle}>Items</h2>
          <StatusBadge status={order.status} />
        </div>
        <ul className={styles.list}>
          {order.items.map((i) => (
            <li key={`${i.productId}-${JSON.stringify(i.config)}`} className={styles.orderBody}>
              <div className={styles.item}>
                {i.image && (
                  <div className={styles.thumb}>
                    <Image src={i.image.src} alt="" fill sizes="64px" />
                  </div>
                )}
                <div>
                  <p className={styles.itemName}>{i.name}</p>
                  <p className={styles.itemMeta}>
                    Qty {i.quantity} × {formatPrice(i.unitPriceCents)}
                    {i.config.personalisation ? " · Personalised (details pending)" : ""}
                  </p>
                </div>
              </div>
              <p className={styles.totalValue}>{formatPrice(i.lineTotalCents)}</p>
            </li>
          ))}
        </ul>
        <dl className={s.details} style={{ borderTop: "var(--border-subtle)", paddingTop: 20 }}>
          <div>
            <dt className={s.detailLabel}>Merchandise subtotal</dt>
            <dd className={s.detailValue}>{formatPrice(order.subtotalCents)}</dd>
          </div>
          {order.shippingCents !== null && (
            <div>
              <dt className={s.detailLabel}>Shipping</dt>
              <dd className={s.detailValue}>{formatPrice(order.shippingCents)}</dd>
            </div>
          )}
          {order.taxCents !== null && (
            <div>
              <dt className={s.detailLabel}>Taxes</dt>
              <dd className={s.detailValue}>{formatPrice(order.taxCents)}</dd>
            </div>
          )}
          <div>
            <dt className={s.detailLabel}>Total</dt>
            <dd className={s.detailValue}>{order.totalCents !== null ? formatPrice(order.totalCents) : "Not yet paid"}</dd>
          </div>
          <div>
            <dt className={s.detailLabel}>Contact</dt>
            <dd className={s.detailValue}>
              {order.firstName} {order.lastName}
              <br />
              {order.email}
            </dd>
          </div>
        </dl>
      </div>
    </AccountShell>
  );
}
