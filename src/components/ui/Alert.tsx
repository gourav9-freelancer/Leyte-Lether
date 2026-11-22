import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import styles from "./Alert.module.css";

export type AlertTone = "info" | "success" | "warning" | "error";

const ICONS: Record<AlertTone, IconName> = {
  info: "info",
  success: "check_circle",
  warning: "warning",
  error: "error",
};

interface AlertProps {
  tone: AlertTone;
  title?: string;
  children?: ReactNode;
  actions?: ReactNode;
  /** White card surface with tone-coloured icon/title (Figma inline error cards). */
  card?: boolean;
  onDismiss?: () => void;
  className?: string;
  id?: string;
}

/** Errors are announced assertively; other tones politely. */
export function Alert({ tone, title, children, actions, card, onDismiss, className, id }: AlertProps) {
  return (
    <div
      id={id}
      className={[styles.alert, styles[tone], card ? styles.card : "", className ?? ""].join(" ")}
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
    >
      <Icon name={ICONS[tone]} size={20} className={styles.icon} />
      <div className={styles.body}>
        {title && <p className={styles.title}>{title}</p>}
        {children && <div>{children}</div>}
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      {onDismiss && (
        <button type="button" className={styles.dismiss} onClick={onDismiss} aria-label="Dismiss message">
          <Icon name="close" size={18} />
        </button>
      )}
    </div>
  );
}
