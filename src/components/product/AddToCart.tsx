"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { api, ApiRequestError } from "@/lib/client/api";
import type { ProductConfig } from "@/lib/validation";
import type { CartView } from "@/lib/types";

interface AddToCartProps {
  productId: string;
  productName: string;
  config?: ProductConfig;
  label?: string;
  loadingText?: string;
  /** Render a sticky purchase bar on mobile (Figma customiser 7. STICKY MOBILE PURCHASE BAR). */
  stickyMobile?: { priceLabel: string };
}

type Status = { kind: "idle" } | { kind: "success" } | { kind: "error"; message: string };

export function AddToCart({ productId, productName, config = {}, label = "Add to cart", loadingText = "Adding…", stickyMobile }: AddToCartProps) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function add() {
    if (busy) return; // duplicate-submission guard
    setBusy(true);
    setStatus({ kind: "idle" });
    try {
      await api<CartView>("/api/cart/items", { method: "POST", body: { productId, quantity: qty, config } });
      setStatus({ kind: "success" });
      router.refresh(); // updates the header cart count from the server
    } catch (e) {
      setStatus({ kind: "error", message: e instanceof ApiRequestError ? e.message : "We couldn't update your cart. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
        <QuantityStepper value={qty} onChange={setQty} itemName={productName} disabled={busy} />
        <Button onClick={add} loading={busy} loadingText={loadingText} fullWidth wrap className="add-to-cart">
          <Icon name="shopping_bag" size={18} />
          {label}
        </Button>
      </div>
      {status.kind === "success" && (
        <Alert
          tone="success"
          title="Added to your cart."
          onDismiss={() => setStatus({ kind: "idle" })}
          actions={
            <>
              <Link href="/cart" style={{ fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3, color: "var(--color-brand-saddle)" }}>
                View cart
              </Link>
              <Link href="/shop" style={{ fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3, color: "var(--color-brand-saddle)" }}>
                Continue shopping
              </Link>
            </>
          }
        >
          {qty} × {productName}
        </Alert>
      )}
      {status.kind === "error" && (
        <Alert tone="error" title="We couldn't update your cart." card>
          {status.message}
        </Alert>
      )}
      {stickyMobile && (
        <div className="sticky-purchase mobile-only" role="region" aria-label="Purchase">
          <div>
            <p style={{ fontSize: 12, lineHeight: "17px", color: "var(--color-neutral-700)" }}>Total</p>
            <p className="t-price" style={{ color: "var(--color-brand-espresso)" }}>
              {stickyMobile.priceLabel}
            </p>
          </div>
          <Button onClick={add} loading={busy} loadingText={loadingText} compact wrap>
            {label}
          </Button>
        </div>
      )}
    </div>
  );
}
