import type { Metadata } from "next";
import { getCart } from "@/server/cart";
import { CartContents } from "./CartContents";
import styles from "./cart.module.css";

export const metadata: Metadata = { title: "Shopping cart", robots: { index: false } };

export default async function CartPage() {
  // The cart page is where unavailable items are removed — with a visible notice.
  const cart = await getCart({ prune: true });
  const n = cart.itemCount;
  return (
    <>
      <section className={styles.intro} aria-labelledby="cart-title">
        <div className={`container ${styles.introInner}`}>
          <div className={styles.introText}>
            <p className="t-eyebrow">Your selections</p>
            <h1 id="cart-title" className={`t-h1 ${styles.title}`}>
              A few good choices.
            </h1>
            <p className={`t-body ${styles.lead}`}>Review your handcrafted leather goods before continuing.</p>
          </div>
          {n > 0 && (
            <p className={styles.itemCount}>
              {n} {n === 1 ? "item" : "items"} in your cart
            </p>
          )}
        </div>
      </section>
      <CartContents initial={cart} />
    </>
  );
}
