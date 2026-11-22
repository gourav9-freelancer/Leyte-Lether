"use client";

import "./globals.css";
import { useEffect } from "react";

/**
 * Last-resort boundary for failures in the root layout itself (header/footer
 * cannot render). Self-contained: no app components that might also fail.
 */
export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app] root layout error", error.digest ?? "");
  }, [error]);
  return (
    <html lang="en-CA">
      <body>
        <main style={{ maxWidth: 620, margin: "0 auto", padding: "96px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          <p className="t-eyebrow">Leyte Leather</p>
          <h1 className="t-h2" style={{ color: "var(--color-brand-espresso)" }}>
            We couldn&apos;t load the site.
          </h1>
          <p className="t-body" style={{ color: "var(--color-neutral-700)" }}>
            Something unexpected happened on our side. Please try again in a moment.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={reset}
              style={{ minHeight: 48, padding: "0 24px", borderRadius: 8, border: 0, background: "var(--color-brand-espresso)", color: "var(--color-brand-white)", fontWeight: 600 }}
            >
              Try Again
            </button>
            {/* Plain anchor: a full reload is the most reliable recovery here. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" style={{ minHeight: 48, padding: "0 24px", borderRadius: 8, border: "1px solid var(--color-neutral-300)", display: "inline-flex", alignItems: "center", fontWeight: 600 }}>
              Return to Home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
