import styles from "./AnnouncementBar.module.css";

/** Verified brand statements only (README §8). Static — no rotating messages. */
export function AnnouncementBar() {
  return (
    <div className={styles.bar}>
      <p className={styles.list}>
        <span className={styles.item}>Handcrafted in Sudbury, ON</span>
        <span className={`${styles.item} ${styles.dot} ${styles.desktopOnly}`} aria-hidden="true">
          ·
        </span>
        <span className={`${styles.item} ${styles.desktopOnly}`}>Full-grain leather</span>
        <span className={`${styles.item} ${styles.dot}`} aria-hidden="true">
          ·
        </span>
        <span className={styles.item}>Custom orders welcome</span>
      </p>
    </div>
  );
}
