import { Button } from "@/components/ui/Button";
import { Actions, Section } from "./Section";

/** Final conversion band (Figma 1:340 / 1:905 — parchment, centred, 720px). */
export function CtaBand({
  title,
  lead,
  primary,
  secondary,
  tone = "parchment",
}: {
  tone?: "parchment" | "cream";
  title: string;
  lead?: string;
  primary: { href: string; label: string };
  secondary: { href: string; label: string };
}) {
  return (
    <Section tone={tone} borderTop spacing="medium" labelledBy="cta-title">
      <div className="container-reading" style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center", textAlign: "center" }}>
        <h2 id="cta-title" className="t-h1" style={{ color: "var(--color-brand-espresso)" }}>
          {title}
        </h2>
        {lead && (
          <p className="t-lead" style={{ color: "var(--color-neutral-800)" }}>
            {lead}
          </p>
        )}
        <div style={{ width: "100%" }}>
          <Actions center>
            <Button href={primary.href}>{primary.label}</Button>
            <Button href={secondary.href} variant="secondary">
              {secondary.label}
            </Button>
          </Actions>
        </div>
      </div>
    </Section>
  );
}
