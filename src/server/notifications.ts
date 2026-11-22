import "server-only";
import { formatPrice } from "@/lib/format";
import { orderItems, orderRowById } from "./orders";
import { sendMail } from "./mail";

/*
 * Transactional messages. Content is limited to facts held in the database —
 * no delivery dates, shipping promises or policies are stated (README §12).
 * Failures are logged and never break the payment/order flow.
 */

export async function sendOrderConfirmation(orderId: number): Promise<void> {
  try {
    const order = orderRowById(orderId);
    if (!order || order.status !== "paid") return;
    const lines = orderItems(orderId).map((i) => {
      const personalised = i.config_json.includes("personalisation") ? " (personalised — details pending confirmation)" : "";
      return `- ${i.product_name}${personalised} × ${i.quantity}: ${formatPrice(i.line_total_cents)}`;
    });
    const totals = [
      `Merchandise subtotal: ${formatPrice(order.subtotal_cents)}`,
      order.shipping_cents !== null ? `Shipping: ${formatPrice(order.shipping_cents)}` : null,
      order.tax_cents !== null ? `Taxes: ${formatPrice(order.tax_cents)}` : null,
      order.total_cents !== null ? `Total paid: ${formatPrice(order.total_cents)}` : null,
    ].filter(Boolean);
    await sendMail({
      to: order.email,
      subject: `Your Leyte Leather order ${order.order_number}`,
      text: [
        `Hello ${order.first_name},`,
        "",
        `Thank you for your order. Payment for order ${order.order_number} has been confirmed.`,
        "",
        ...lines,
        "",
        ...totals,
        "",
        "Leyte Leather — handcrafted leather goods made one piece at a time in Sudbury, Ontario.",
      ].join("\n"),
    });
    if (process.env.BUSINESS_NOTIFICATION_EMAIL) {
      await sendMail({
        to: process.env.BUSINESS_NOTIFICATION_EMAIL,
        subject: `New paid order ${order.order_number}`,
        text: [`Order ${order.order_number} has been paid.`, "", ...lines, "", ...totals, "", `Customer: ${order.first_name} ${order.last_name} <${order.email}>`].join("\n"),
      });
    }
  } catch (err) {
    console.error("[notify] order confirmation failed", err instanceof Error ? err.message : "unknown");
  }
}

export async function sendCustomOrderAcknowledgement(to: string, name: string, reference: string, imageCount: number): Promise<void> {
  try {
    await sendMail({
      to,
      subject: `We've received your custom-order request ${reference}`,
      text: [
        `Hello ${name},`,
        "",
        `Thank you for your custom-order request. Your reference is ${reference}${imageCount ? ` (${imageCount} reference image${imageCount === 1 ? "" : "s"} received)` : ""}.`,
        "",
        "What happens next:",
        "1. Leyte Leather reviews your idea, measurements and reference images.",
        "2. You receive a quotation by email.",
        "3. Accept the quotation and secure a place in the production queue with a deposit.",
        "",
        "Leyte Leather — Sudbury, Ontario.",
      ].join("\n"),
    });
  } catch (err) {
    console.error("[notify] custom-order acknowledgement failed", err instanceof Error ? err.message : "unknown");
  }
}
