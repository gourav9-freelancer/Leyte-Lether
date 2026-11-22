import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import styles from "./states.module.css";

/** 404 — Figma Global System States, Part B. */
export default function NotFound() {
  return (
    <section className={styles.notFound} aria-labelledby="nf-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.text}>
          <p className="t-eyebrow">Page not found</p>
          <h1 id="nf-title" className="t-h1" style={{ color: "var(--color-brand-espresso)" }}>
            Looks like this piece is missing.
          </h1>
          <p className="t-body" style={{ color: "var(--color-neutral-700)" }}>
            The page you&apos;re looking for may have moved, or the address may be incorrect. Let&apos;s help you find your way back.
          </p>
          <div className={styles.actions}>
            <Button href="/">Back to Home</Button>
            <Button href="/shop" variant="secondary">
              Explore the Collection
            </Button>
            <Link href="/custom-orders" className={styles.link}>
              Custom Orders
            </Link>
          </div>
        </div>
        <div className={styles.visual} aria-hidden="true">
          <Image src="/images/editorial/material-texture.jpg" alt="" fill sizes="(min-width: 900px) 592px, 100vw" />
          <span className={styles.code}>404</span>
        </div>
      </div>
    </section>
  );
}
