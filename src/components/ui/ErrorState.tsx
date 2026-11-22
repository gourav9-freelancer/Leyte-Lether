import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import styles from "./ErrorState.module.css";

/**
 * Error & recovery card — Figma Global System States, Part C ("Calm, actionable
 * recovery"): status pill, display title, plain-language message, recovery actions.
 * Variants used: general, network offline, server, product unavailable,
 * session expired, order history.
 */
export function ErrorState({
  pill,
  icon = "error",
  title,
  children,
  actions,
  headingLevel = "h1",
  tone = "error",
}: {
  pill: string;
  icon?: IconName;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
  headingLevel?: "h1" | "h2";
  tone?: "error" | "warning";
}) {
  const H = headingLevel;
  return (
    <div className={styles.card} role={tone === "error" ? "alert" : "status"}>
      <span className={`${styles.pill} ${tone === "warning" ? styles.pillWarning : ""}`}>
        <Icon name={icon} size={14} />
        {pill}
      </span>
      <H className={styles.title}>{title}</H>
      {children && <div className={styles.text}>{children}</div>}
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}

export function ErrorPage(props: Parameters<typeof ErrorState>[0]) {
  return (
    <section className={styles.page}>
      <div className="container">
        <ErrorState {...props} />
      </div>
    </section>
  );
}
