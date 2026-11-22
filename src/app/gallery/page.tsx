import type { Metadata } from "next";
import { CtaBand } from "@/components/sections/CtaBand";
import { Actions, Col, MediaFrame, Section, SectionHeading, Split } from "@/components/sections/Section";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/format";
import { listProducts } from "@/server/products";
import { GalleryGrid, type GalleryItem } from "./GalleryGrid";
import styles from "./gallery.module.css";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Handcrafted leather goods, thoughtful details and the character of pieces made one at a time.",
};

/** Gallery order follows the approved frame (1:2412). */
const ORDER = [
  "classic-leather-bifold-wallet",
  "personalized-leather-camera-strap",
  "classic-full-grain-leather-belt",
  "personalized-leather-guitar-strap",
  "handmade-leather-watch-strap",
  "premium-leather-dog-harness",
  "handcrafted-leather-axe-sheath",
  "leather-car-key-fob-cover",
];

const img = (src: string, alt: string) => ({ src, alt, width: 1536, height: 1024 });

export default function GalleryPage() {
  const products = listProducts();
  const items: GalleryItem[] = [
    ...ORDER.map((s) => products.find((p) => p.slug === s)).filter((p) => p !== undefined),
    ...products.filter((p) => !ORDER.includes(p.slug)),
  ].map((p) => ({ slug: p.slug, name: p.name, priceLabel: formatPrice(p.priceCents), category: p.category, image: p.gallery[0] ?? p.cardImage }));

  return (
    <>
      <section className={styles.hero} aria-labelledby="gallery-title">
        <div className={`container ${styles.heroGrid}`}>
          <MediaFrame image={img("/images/editorial/category-personalised.jpg", "Leather camera strap, guitar strap and watch strap arranged together")} onDark large className={styles.heroMedia} sizes="(min-width: 900px) 652px, 100vw" priority />
          <div className={styles.heroText}>
            <p className="t-eyebrow" style={{ color: "var(--color-brand-brass)" }}>
              The Leyte Leather collection
            </p>
            <h1 id="gallery-title" className={styles.heroTitle}>
              Made to be seen. Made to be kept.
            </h1>
            <p className="t-lead" style={{ color: "var(--color-brand-parchment)" }}>
              Explore handcrafted leather goods, thoughtful details and the character of pieces made one at a time.
            </p>
            <Actions>
              <Button href="/shop" variant="light">
                Explore the collection
              </Button>
              <Button href="/custom-orders" variant="ghostOnDark">
                Request a custom piece
              </Button>
            </Actions>
          </div>
        </div>
      </section>

      <section aria-labelledby="gallery-intro">
        <div className={`container ${styles.intro}`}>
          <div className={styles.introText}>
            <h2 id="gallery-intro" className="t-h1" style={{ color: "var(--color-brand-espresso)" }}>
              Every piece has its own character.
            </h2>
            <p className="t-lead" style={{ color: "var(--color-neutral-700)" }}>
              From everyday essentials to personalised accessories, discover the leather goods that make up the Leyte Leather collection.
            </p>
          </div>
          <GalleryGrid items={items} />
        </div>
      </section>

      <Section tone="espresso" labelledBy="upclose-title">
        <div className="container">
          <Split>
            <Col span={5}>
              <SectionHeading
                id="upclose-title"
                eyebrow="Up close"
                title="The beauty is in the details."
                lead="Good leather goods are appreciated up close. The texture, the finish and the thoughtful details all contribute to the character of a piece."
                loose
              />
            </Col>
            <Col span={7}>
              <MediaFrame image={img("/images/editorial/material-stitching.jpg", "Close-up of hand stitching along a finished leather edge")} onDark large className={styles.heroMedia} sizes="(min-width: 900px) 652px, 100vw" />
            </Col>
          </Split>
        </div>
      </Section>

      <Section tone="parchment" labelledBy="gallery-custom-title">
        <div className="container">
          <Split gap40>
            <Col span={6} className="desktop-only">
              {/* Mobile frame 1:2807 has no image in this section. */}
              <MediaFrame image={img("/images/editorial/craft-burnishing.jpg", "Hands finishing the edge of a leather piece")} large className={styles.heroMedia} sizes="556px" />
            </Col>
            <Col span={6}>
              <SectionHeading
                id="gallery-custom-title"
                eyebrow="Custom orders"
                title="Have something different in mind?"
                lead="Looking for something personal? Tell us what you have in mind and share your requirements."
                loose
              />
              <div className={styles.customCta}>
                <Button href="/custom-orders" fullWidth>
                  Request a custom piece
                </Button>
              </div>
            </Col>
          </Split>
        </div>
      </Section>

      <CtaBand
        tone="cream"
        title="Find a piece that feels like yours."
        primary={{ href: "/shop", label: "Shop the collection" }}
        secondary={{ href: "/custom-orders", label: "Request a custom piece" }}
      />
    </>
  );
}
