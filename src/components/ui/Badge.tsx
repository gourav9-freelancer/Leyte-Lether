import type { ReactNode } from "react";

/** Factual label (README §8): parchment background, espresso text, small radius. */
export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "success" | "warning" | "error" | "info" }) {
  const palette: Record<string, { bg: string; fg: string }> = {
    default: { bg: "var(--color-brand-parchment)", fg: "var(--color-brand-espresso)" },
    success: { bg: "var(--color-success-bg)", fg: "var(--color-success)" },
    warning: { bg: "var(--color-warning-bg)", fg: "var(--color-warning)" },
    error: { bg: "var(--color-error-bg)", fg: "var(--color-error)" },
    info: { bg: "var(--color-info-bg)", fg: "var(--color-info)" },
  };
  const c = palette[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        alignSelf: "flex-start",
        padding: "4px 12px",
        borderRadius: "var(--radius-sm)",
        background: c.bg,
        color: c.fg,
        fontSize: 12,
        lineHeight: "17px",
        fontWeight: 600,
        letterSpacing: "0.4px",
        maxWidth: "100%",
      }}
    >
      {children}
    </span>
  );
}
