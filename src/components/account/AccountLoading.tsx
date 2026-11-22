import { SkeletonBlock } from "@/components/ui/Skeleton";
import styles from "./account.module.css";

/**
 * Account page loading (Figma Loading States §C "Account Overview" / "Order History"
 * skeletons): keeps the account layout stable with neutral blocks — no fake data.
 */
export function AccountLoading({ label, rows = 2 }: { label: string; rows?: number }) {
  return (
    <section className={styles.section} aria-busy="true">
      <div className="container" role="status" aria-live="polite">
        <span className="visually-hidden">{label}</span>
        <div className={styles.intro} aria-hidden="true">
          <SkeletonBlock className={styles.skelEyebrow} />
          <SkeletonBlock className={styles.skelTitle} />
          <SkeletonBlock className={styles.skelLine} />
        </div>
        <div className={styles.grid} aria-hidden="true">
          <div className={styles.nav}>
            {Array.from({ length: 4 }, (_, i) => (
              <SkeletonBlock key={i} className={styles.skelNav} />
            ))}
          </div>
          <div className={styles.content}>
            {Array.from({ length: rows }, (_, i) => (
              <div key={i} className={styles.panel}>
                <SkeletonBlock className={styles.skelLine} />
                <SkeletonBlock className={styles.skelShort} />
                <SkeletonBlock className={styles.skelShort} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
