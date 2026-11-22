"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorPage } from "@/components/ui/ErrorState";

/**
 * Application error boundary — Figma Global System States, Part C.
 * Distinguishes "Network Offline" from "General Error"; never shows internals.
 */
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    console.error("[app] render error", error.digest ?? "");
    setOffline(navigator.onLine === false);
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, [error]);

  return offline ? (
    <ErrorPage
      pill="Network offline"
      icon="wifi_off"
      title="Check your connection."
      actions={
        <>
          <Button onClick={reset}>Try Again</Button>
          <Button href="/" variant="secondary">
            Return to Home
          </Button>
        </>
      }
    >
      Your device appears to be offline. Reconnect and try again — nothing you entered has been submitted.
    </ErrorPage>
  ) : (
    <ErrorPage
      pill="Something went wrong"
      title="We couldn't complete that."
      actions={
        <>
          <Button onClick={reset}>Try Again</Button>
          <Button href="/" variant="secondary">
            Return to Home
          </Button>
        </>
      }
    >
      Something unexpected happened. Please try again in a moment.
    </ErrorPage>
  );
}
