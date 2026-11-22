import type { ProductImage } from "@/data/catalog";
import type { ProductConfig } from "./validation";

export interface CartLine {
  id: number;
  productId: string;
  name: string;
  image: ProductImage;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
  config: ProductConfig;
  personalisable: boolean;
}

export interface CartView {
  lines: CartLine[];
  itemCount: number;
  subtotalCents: number;
  currency: "CAD";
  /** Server-side notices, e.g. an unavailable item was removed. */
  issues: string[];
}

export type OrderStatus = "pending_payment" | "paid" | "payment_failed" | "cancelled";

export interface OrderSummary {
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  itemCount: number;
  subtotalCents: number;
  totalCents: number | null;
  firstItemName: string;
  firstItemImage: ProductImage | null;
  firstItemQuantity: number;
  firstItemPersonalised: boolean;
  lineCount: number;
  paidAt: string | null;
}

export interface OrderDetail extends OrderSummary {
  email: string;
  firstName: string;
  lastName: string;
  shippingCents: number | null;
  taxCents: number | null;
  paymentProvider: string;
  items: {
    productId: string;
    name: string;
    unitPriceCents: number;
    quantity: number;
    lineTotalCents: number;
    config: ProductConfig;
    image: ProductImage | null;
  }[];
}
