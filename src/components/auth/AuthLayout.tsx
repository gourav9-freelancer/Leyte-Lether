import type { ReactNode } from "react";
import styles from "./auth.module.css";

export function AuthLayout({ eyebrow, title, lead, children }: { eyebrow: string; title: string; lead: string; children: ReactNode }) {
  return (
    <section className={styles.wrap} aria-labelledby="auth-title">
      <div className="container">
        <div className={styles.inner}>
          <div className={styles.intro}>
            <p className="t-eyebrow">{eyebrow}</p>
            <h1 id="auth-title" className={`t-h1 ${styles.title}`}>
              {title}
            </h1>
            <p className={`t-body ${styles.lead}`}>{lead}</p>
          </div>
          <div className={styles.card}>{children}</div>
        </div>
      </div>
    </section>
  );
}
export { styles as authStyles };
