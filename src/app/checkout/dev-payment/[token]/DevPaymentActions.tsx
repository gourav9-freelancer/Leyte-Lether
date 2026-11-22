"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { api, ApiRequestError } from "@/lib/client/api";

export function DevPaymentActions({ token }: { token: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"success" | "failure" | null>(null);
  const [error, setError] = useState<string | null>(null);
  async function go(outcome: "success" | "failure") {
    setBusy(outcome);
    setError(null);
    try {
      await api("/api/payments/dev-simulate", { method: "POST", body: { token, outcome } });
      router.replace(`/checkout/confirmation/${token}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : "Simulation failed.");
      setBusy(null);
    }
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {error && <Alert tone="error" title="Simulation failed.">{error}</Alert>}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Button onClick={() => go("success")} loading={busy === "success"} loadingText="Simulating…" disabled={busy !== null}>
          Simulate successful payment
        </Button>
        <Button variant="secondary" onClick={() => go("failure")} loading={busy === "failure"} loadingText="Simulating…" disabled={busy !== null}>
          Simulate failed payment
        </Button>
      </div>
    </div>
  );
}
