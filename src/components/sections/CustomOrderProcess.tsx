import styles from "./CustomOrderProcess.module.css";

/**
 * The verified five-step custom-order process. Mobile shows "1. Step" text,
 * desktop shows brass "01" numerals with dividers — as in the approved frames.
 */
export function CustomOrderProcess({ title, steps, dark }: { title: string; steps: string[]; dark?: boolean }) {
  return (
    <div className={[styles.panel, dark ? styles.panelDark : ""].join(" ")}>
      <h3 className={`${styles.title} ${styles.titleMobileHidden}`}>{title}</h3>
      <ol className={styles.list} aria-label={title}>
        {steps.map((step, i) => (
          <li key={step} className={styles.item}>
            <span className={styles.num} aria-hidden="true">
              <span className={styles.numDot}>{i + 1}.</span>
              <span className={styles.numPad}>{String(i + 1).padStart(2, "0")}</span>
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export const HOME_PROCESS_STEPS = [
  "Share your idea",
  "Provide measurements and specifications",
  "Upload reference images",
  "Receive a quotation by email",
  "Accept the quote and secure your production spot with a deposit",
];

export const ABOUT_PROCESS_STEPS = [
  "Share your idea.",
  "Provide measurements and specifications.",
  "Upload up to five reference images.",
  "Receive a quotation by email.",
  "Accept the quotation and secure a place in the production queue with a deposit.",
];
