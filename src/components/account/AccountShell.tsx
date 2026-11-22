import type { ReactNode } from "react";
import { AccountNav } from "./AccountNav";
import styles from "./account.module.css";

export function AccountShell({ eyebrow, title, lead, children }: { eyebrow: string; title: string; lead: string; children: ReactNode }) {
  return (
    <section className={styles.section} aria-labelledby="account-title">
      <div className="container">
        <div className={styles.intro}>
          <p className="t-eyebrow">{eyebrow}</p>
          <h1 id="account-title" className={`t-h1 ${styles.title}`}>
            {title}
          </h1>
          <p className={`t-body ${styles.lead}`}>{lead}</p>
        </div>
        <div className={styles.grid}>
          <AccountNav />
          <div className={styles.content}>{children}</div>
        </div>
      </div>
    </section>
  );
}
export { styles as accountStyles };
