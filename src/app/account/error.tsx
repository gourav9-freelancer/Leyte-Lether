"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorPage } from "@/components/ui/ErrorState";

/** Account-area error boundary (overview, personal information, security, order detail). */
export default function AccountError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[account] render error", error.digest ?? "");
  }, [error]);
  return (
    <ErrorPage
      pill="Something went wrong"
      title="We couldn't load your account."
      actions={
        <>
          <Button onClick={reset}>Try Again</Button>
          <Button href="/" variant="secondary">
            Return to Home
          </Button>
        </>
      }
    >
      Your details are safe — we just couldn&apos;t display this page right now. Please try again in a moment.
    </ErrorPage>
  );
}
