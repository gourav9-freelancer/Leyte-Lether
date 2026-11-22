"use client";

import { useEffect } from "react";
import { AccountShell } from "@/components/account/AccountShell";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";

/** Order History Error — Figma Global System States, Part C. Keeps the account layout. */
export default function OrdersError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[account] order history failed", error.digest ?? "");
  }, [error]);
  return (
    <AccountShell eyebrow="My account" title="Your Orders" lead="View your purchases, check order updates and revisit the details of your Leyte Leather orders.">
      <ErrorState
        headingLevel="h2"
        pill="Order history unavailable"
        title="We couldn't load your orders."
        actions={
          <>
            <Button onClick={reset}>Try Again</Button>
            <Button href="/account" variant="secondary">
              Back to Account Overview
            </Button>
          </>
        }
      >
        Your orders are safe — we just couldn&apos;t display them right now. Please try again in a moment.
      </ErrorState>
    </AccountShell>
  );
}
