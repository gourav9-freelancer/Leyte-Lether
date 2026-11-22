import type { Metadata } from "next";
import { ABOUT_PROCESS_STEPS, CustomOrderProcess } from "@/components/sections/CustomOrderProcess";
import { currentCustomer } from "@/server/auth";
import { CustomOrderForm } from "./CustomOrderForm";
import styles from "./custom.module.css";

export const metadata: Metadata = {
  title: "Custom orders",
  description: "Request a bespoke leather piece from Leyte Leather. Share your idea, measurements and reference images for a quotation by email.",
};

/*
 * Custom Orders — referenced throughout the approved designs but not designed as a
 * page (implementation gap). Built from the approved dark custom-orders feature
 * section and shared form components, following README §11 "Custom orders".
 */
export default async function CustomOrdersPage() {
  const customer = await currentCustomer();
  const name = [customer?.first_name, customer?.last_name].filter(Boolean).join(" ");
  return (
    <>
      <section className={styles.hero} aria-labelledby="custom-title">
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroText}>
            <p className="t-eyebrow" style={{ color: "var(--color-brand-brass)" }}>
              Bespoke commissions
            </p>
            <h1 id="custom-title" className="t-h1" style={{ color: "var(--color-brand-white)" }}>
              Your idea. Your specifications.
            </h1>
            <p className="t-lead" style={{ color: "var(--color-brand-parchment)" }}>
              Looking for something beyond the existing collection? Share your idea, measurements and reference images, and the team will review
              your request and email a quotation.
            </p>
          </div>
          <div className={styles.heroPanel}>
            <CustomOrderProcess title="Custom-order process" steps={ABOUT_PROCESS_STEPS} />
          </div>
        </div>
      </section>
      <section className={styles.main} aria-labelledby="request-title">
        <div className="container">
          <h2 id="request-title" className="t-h2" style={{ color: "var(--color-brand-espresso)", marginBottom: 24, textAlign: "center" }}>
            Request a custom piece
          </h2>
          <CustomOrderForm defaults={{ name, email: customer?.email ?? "" }} />
        </div>
      </section>
    </>
  );
}
