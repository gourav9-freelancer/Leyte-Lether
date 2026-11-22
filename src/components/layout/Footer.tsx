import Link from "next/link";
import styles from "./Footer.module.css";

/**
 * Global footer. Only verified links are shown (no social or policy links until
 * the business supplies them — README §8).
 * Mobile merges Account + About into one column, as in the approved mobile frames.
 */
export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.brand}>
            <p className={styles.logo}>Leyte Leather</p>
            <p className={styles.desc}>Handcrafted leather goods made one piece at a time in Sudbury, Ontario, Canada.</p>
          </div>
          <div className={styles.columns}>
            <nav className={`${styles.col} ${styles.colShop}`} aria-labelledby="footer-shop">
              <h2 id="footer-shop" className={styles.heading}>
                Shop
              </h2>
              <ul className={styles.list}>
                <li>
                  <Link className={styles.link} href="/shop">
                    All products
                  </Link>
                </li>
                <li>
                  <Link className={styles.link} href="/custom-orders">
                    Custom orders
                  </Link>
                </li>
                <li>
                  <Link className={styles.link} href="/gallery">
                    Gallery
                  </Link>
                </li>
              </ul>
            </nav>
            <nav className={`${styles.col} ${styles.colAccount}`} aria-labelledby="footer-account">
              <h2 id="footer-account" className={styles.heading}>
                <span className={styles.accountHeadingDesktop}>Account</span>
                <span className={styles.accountHeadingMobile}>Account &amp; About</span>
              </h2>
              <ul className={styles.list}>
                <li>
                  <Link className={styles.link} href="/account">
                    My account
                  </Link>
                </li>
                <li>
                  <Link className={styles.link} href="/account/orders">
                    Order history
                  </Link>
                </li>
                <li>
                  <Link className={styles.link} href="/login">
                    Sign in
                  </Link>
                </li>
                <li className={styles.mobileOnly}>
                  <Link className={styles.link} href="/about">
                    Our story
                  </Link>
                </li>
              </ul>
            </nav>
            <nav className={`${styles.col} ${styles.colAbout} ${styles.desktopOnlyCol}`} aria-labelledby="footer-about">
              <h2 id="footer-about" className={styles.heading}>
                About
              </h2>
              <ul className={styles.list}>
                <li>
                  <Link className={styles.link} href="/about">
                    Our story
                  </Link>
                </li>
                <li>
                  <Link className={styles.link} href="/cart">
                    Shopping cart
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
