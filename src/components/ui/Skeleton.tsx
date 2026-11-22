import styles from "./Skeleton.module.css";

export function SkeletonBlock({ className }: { className?: string }) {
  return <span className={`${styles.block} ${className ?? ""}`} aria-hidden="true" />;
}

/** Shop catalogue skeleton — reserves the 4:5 card image ratio. */
export function ProductGridSkeleton({ count = 8, label = "Loading products" }: { count?: number; label?: string }) {
  return (
    <div role="status" aria-live="polite">
      <span className="visually-hidden">{label}</span>
      <div className={styles.grid} aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className={styles.card}>
            <SkeletonBlock className={styles.image} />
            <SkeletonBlock className={`${styles.line} ${styles.medium}`} />
            <SkeletonBlock className={`${styles.line} ${styles.short}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Cart row / order history row skeleton. */
export function RowSkeleton({ count = 2, label = "Loading", withThumb = true }: { count?: number; label?: string; withThumb?: boolean }) {
  return (
    <div role="status" aria-live="polite" style={{ display: "grid", gap: 16 }}>
      <span className="visually-hidden">{label}</span>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={styles.row} aria-hidden="true">
          {withThumb && <SkeletonBlock className={styles.thumb} />}
          <div className={styles.stack}>
            <SkeletonBlock className={`${styles.line} ${styles.medium}`} />
            <SkeletonBlock className={`${styles.line} ${styles.short}`} />
          </div>
          {!withThumb && <SkeletonBlock className={styles.pill} />}
        </div>
      ))}
    </div>
  );
}
