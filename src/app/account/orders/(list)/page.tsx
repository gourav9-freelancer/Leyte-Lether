import type { Metadata } from "next";
import { AccountShell } from "@/components/account/AccountShell";
import { listOrdersForCustomer } from "@/server/orders";
import { requireCustomer } from "@/server/require-auth";
import { OrderList } from "../OrderList";

export const metadata: Metadata = { title: "Order history", robots: { index: false } };

export default async function OrdersPage() {
  const c = await requireCustomer("/account/orders");
  const orders = listOrdersForCustomer(c.id);
  return (
    <AccountShell eyebrow="My account" title="Your Orders" lead="View your purchases, check order updates and revisit the details of your Leyte Leather orders.">
      <OrderList orders={orders} />
    </AccountShell>
  );
}
