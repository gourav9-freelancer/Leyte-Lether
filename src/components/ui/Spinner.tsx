import styles from "./Spinner.module.css";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  onDark?: boolean;
  /** Accessible status text. Omit when a parent already announces the state. */
  label?: string;
  className?: string;
}

export function Spinner({ size = "sm", onDark, label, className }: SpinnerProps) {
  const cls = [styles.spinner, styles[size], onDark ? styles.onDark : "", className ?? ""].join(" ");
  if (!label) return <span className={cls} aria-hidden="true" />;
  return (
    <span role="status" aria-live="polite">
      <span className={cls} aria-hidden="true" />
      <span className="visually-hidden">{label}</span>
    </span>
  );
}

/** Section-level loader (medium) or page-level loader (large) with visible text. */
export function LoadingBlock({ label, size = "md" }: { label: string; size?: "md" | "lg" }) {
  return (
    <div className={styles.block} role="status" aria-live="polite">
      <span className={[styles.spinner, styles[size]].join(" ")} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
