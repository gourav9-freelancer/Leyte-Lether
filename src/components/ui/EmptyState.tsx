import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  icon: IconName;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
  centered?: boolean;
  headingLevel?: "h2" | "h3";
}

export function EmptyState({ icon, title, children, actions, centered, headingLevel = "h2" }: EmptyStateProps) {
  const H = headingLevel;
  return (
    <div className={[styles.empty, centered ? styles.center : ""].join(" ")}>
      <Icon name={icon} size={28} className={styles.icon} />
      <H className={styles.title}>{title}</H>
      {children && <div className={styles.text}>{children}</div>}
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}
