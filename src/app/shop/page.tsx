import type { Metadata } from "next";
import { Section } from "@/components/sections/Section";
import { Button } from "@/components/ui/Button";
import { parseFilters, type ShopProduct } from "@/lib/shop";
import { listProducts } from "@/server/products";
import { ShopCatalogue } from "./ShopCatalogue";
import styles from "./shop.module.css";

export const metadata: Metadata = {
  title: "Shop",
  description: "Explore handcrafted leather goods for everyday life, personal expression and everything in between.",
};

/** Default "Featured" order follows the approved Shop frame (1:1283). */
const FEATURED = [
  "leather-car-key-fob-cover",
  "personalized-leather-camera-strap",
  "handmade-leather-watch-strap",
  "premium-leather-dog-harness",
  "handcrafted-leather-axe-sheath",
  "personalized-leather-guitar-strap",
  "classic-leather-bifold-wallet",
  "classic-full-grain-leather-belt",
];

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const initial = parseFilters(await searchParams);
  const products: ShopProduct[] = listProducts().map((p) => ({
    slug: p.slug,
    name: p.name,
    priceCents: p.priceCents,
    category: p.category,
    personalisable: p.personalisable,
    image: p.cardImage,
    featuredRank: FEATURED.indexOf(p.slug) === -1 ? 100 + p.sortOrder : FEATURED.indexOf(p.slug),
  }));

  return (
    <>
      <section className={styles.hero} aria-labelledby="shop-title">
        <div className={`container ${styles.heroText}`}>
          <p className="t-eyebrow" style={{ color: "var(--color-brand-brass)" }}>
            The Leyte Leather collection
          </p>
          <h1 id="shop-title" className={`t-h1 ${styles.heroTitle}`}>
            Find something made for you.
          </h1>
          <p className={`t-lead ${styles.heroLead}`}>
            Explore handcrafted leather goods for everyday life, personal expression and everything in between.
          </p>
        </div>
      </section>

      <section className={styles.discovery} aria-label="Products">
        <ShopCatalogue products={products} initial={initial} />
      </section>

      <Section tone="parchment" borderTop spacing="medium" labelledBy="different-title">
        <div className="container-reading" style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center", textAlign: "center" }}>
          <h2 id="different-title" className="t-h1" style={{ color: "var(--color-brand-espresso)" }}>
            Looking for something different?
          </h2>
          <p className="t-lead" style={{ color: "var(--color-neutral-800)" }}>
            Leyte Leather welcomes custom-order requests. Share your idea, measurements and reference images, and we&apos;ll email a quotation.
          </p>
          <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <Button href="/custom-orders" variant="secondary" className="shop-cta">
              Request a custom piece
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
