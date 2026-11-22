/**
 * Single price format used site-wide (README §12: choose one CAD format).
 * The approved Figma uses "CAD $60.00".
 */
export function formatPrice(cents: number): string {
  const dollars = (cents / 100).toLocaleString("en-CA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `CAD $${dollars}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Toronto",
  });
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending_payment: "Awaiting payment",
  paid: "Paid",
  payment_failed: "Payment failed",
  cancelled: "Cancelled",
};
