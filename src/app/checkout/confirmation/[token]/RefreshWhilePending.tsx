"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { LoadingBlock } from "@/components/ui/Spinner";

/** Polls (bounded) while the payment provider confirms; never shows success on its own. */
export function RefreshWhilePending() {
  const router = useRouter();
  const [tries, setTries] = useState(0);
  const max = 10;
  useEffect(() => {
    if (tries >= max) return;
    const t = setTimeout(() => {
      router.refresh();
      setTries((n) => n + 1);
    }, 3000);
    return () => clearTimeout(t);
  }, [tries, router]);
  if (tries >= max) {
    return (
      <Alert tone="info" title="Still waiting for confirmation." actions={<Button variant="secondary" compact onClick={() => setTries(0)}>Check again</Button>}>
        Your payment provider hasn&apos;t confirmed this order yet. You won&apos;t be charged twice — check again in a moment.
      </Alert>
    );
  }
  return <LoadingBlock label="Waiting for the payment provider to confirm your order." />;
}
