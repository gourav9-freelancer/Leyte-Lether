import { Icon, type IconName } from "@/components/ui/Icon";
import styles from "./ValueStrip.module.css";

export interface ValueItem {
  icon: IconName;
  title: string;
  text: string;
  /** Optional shorter copy used on mobile (as in the approved mobile frames). */
  mobileText?: string;
}

export function ValueStrip({ items, largeTitles }: { items: ValueItem[]; largeTitles?: boolean }) {
  const H = largeTitles ? "h3" : "p";
  return (
    <div className={styles.grid}>
      {items.map((v) => (
        <div key={v.title} className={styles.item}>
          <div className={styles.titleRow}>
            <Icon name={v.icon} size={20} className={styles.icon} />
            <H className={[styles.title, largeTitles ? styles.titleLarge : ""].join(" ")}>{v.title}</H>
          </div>
          {v.mobileText ? (
            <>
              <p className={`${styles.text} mobile-only`}>{v.mobileText}</p>
              <p className={`${styles.text} desktop-only`}>{v.text}</p>
            </>
          ) : (
            <p className={styles.text}>{v.text}</p>
          )}
        </div>
      ))}
    </div>
  );
}
