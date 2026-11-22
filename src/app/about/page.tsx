import type { Metadata } from "next";
import { ProductCard } from "@/components/product/ProductCard";
import { CtaBand } from "@/components/sections/CtaBand";
import { ABOUT_PROCESS_STEPS, CustomOrderProcess } from "@/components/sections/CustomOrderProcess";
import { Col, MediaFrame, Section, SectionHeading, Split } from "@/components/sections/Section";
import { ValueStrip } from "@/components/sections/ValueStrip";
import { Button } from "@/components/ui/Button";
import { listProducts } from "@/server/products";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About",
  description: "The story behind Leyte Leather — handcrafted leather goods, built one piece at a time in Sudbury, Ontario.",
};

const img = (src: string, alt: string) => ({ src, alt, width: 1672, height: 941 });

/** Card images as placed in the approved About frame (1:790). */
const ABOUT_CARD_IMAGES: Record<string, { src: string; alt: string }> = {
  "classic-leather-bifold-wallet": { src: "/images/products/bifold-wallet.jpg", alt: "Classic leather bifold wallet shown closed and open" },
};

const ABOUT_ORDER = [
  "classic-leather-bifold-wallet",
  "classic-full-grain-leather-belt",
  "personalized-leather-camera-strap",
  "personalized-leather-guitar-strap",
  "handmade-leather-watch-strap",
  "premium-leather-dog-harness",
  "handcrafted-leather-axe-sheath",
  "leather-car-key-fob-cover",
];

export default function AboutPage() {
  const products = listProducts();
  const ordered = [
    ...ABOUT_ORDER.map((s) => products.find((p) => p.slug === s)).filter((p) => p !== undefined),
    ...products.filter((p) => !ABOUT_ORDER.includes(p.slug)),
  ];

  return (
    <>
      {/* SECTION 02: About hero */}
      <section className={styles.hero} aria-labelledby="about-title">
        <div className={`container-wide ${styles.heroInner}`}>
          <div className={styles.heroText}>
            <p className="t-eyebrow" style={{ color: "var(--color-brand-brass)" }}>
              The story behind Leyte Leather
            </p>
            <h1 id="about-title" className={`t-display-xl ${styles.heroTitle}`}>
              Made by hand. Made with intention.
            </h1>
            <p className={`t-lead ${styles.heroLead}`}>Handcrafted leather goods, built one piece at a time in Sudbury, Ontario.</p>
          </div>
          <MediaFrame
            image={img("/images/editorial/about-hero-workshop.jpg", "A leatherworker cutting and stitching leather at a workshop bench")}
            onDark
            large
            className={styles.heroMedia}
            sizes="(min-width: 1360px) 1232px, 100vw"
            priority
          />
        </div>
      </section>

      {/* SECTION 03: Our philosophy */}
      <Section tone="cream" labelledBy="philosophy-title">
        <div className="container">
          <Split>
            <Col span={6}>
              <div className={styles.text}>
                <SectionHeading
                  id="philosophy-title"
                  eyebrow="Our philosophy"
                  title={
                    <>
                      Not made in a hurry.
                      <br />
                      Made with care.
                    </>
                  }
                  lead="At Leyte Leather, we focus on handcrafted leather goods, built one piece at a time. Our approach centres on the material, the details and creating pieces that feel personal to the people who use them."
                  loose
                />
              </div>
            </Col>
            <Col span={6}>
              <MediaFrame
                image={img("/images/editorial/philosophy-pouch.jpg", "Close-up of a stitched leather pouch beside waxed thread")}
                large
                className={`${styles.frame} ${styles.frame414}`}
                sizes="(min-width: 900px) 592px, 100vw"
              />
            </Col>
          </Split>
        </div>
      </Section>

      {/* SECTION 04: The material */}
      <Section tone="espresso" labelledBy="material-title">
        <div className="container">
          <Split>
            <Col span={5} className={styles.text}>
              <SectionHeading
                id="material-title"
                eyebrow="The material"
                title={
                  <>
                    Let the leather
                    <br />
                    speak for itself.
                  </>
                }
                lead="Full-grain leather is central to the way Leyte Leather presents its collection. The material, its natural character and the finished details are an important part of every product."
                loose
              />
            </Col>
            <Col span={7} className={styles.desktopFirst}>
              <div className={styles.pair}>
                <MediaFrame
                  image={img("/images/editorial/material-texture.jpg", "Close-up of full-grain leather texture")}
                  onDark
                  className={styles.pairFrame}
                  sizes="(min-width: 900px) 330px, 50vw"
                />
                <MediaFrame
                  image={img("/images/editorial/material-stitching.jpg", "Close-up of hand stitching along a finished leather edge")}
                  onDark
                  className={styles.pairFrame}
                  sizes="(min-width: 900px) 330px, 50vw"
                />
              </div>
            </Col>
          </Split>
        </div>
      </Section>

      {/* SECTION 05: The craft */}
      <Section tone="parchment" labelledBy="craft-title">
        <div className="container">
          <Split>
            <Col span={5} className={styles.text}>
              <SectionHeading
                id="craft-title"
                eyebrow="The craft"
                title="One piece at a time."
                lead={<span style={{ color: "var(--color-neutral-800)" }}>Every piece represents an approach centred on handcrafted leather goods rather than mass-produced accessories.</span>}
                loose
              />
            </Col>
            <Col span={7}>
              <div className={`${styles.pair} ${styles.craftPair}`}>
                <MediaFrame
                  image={img("/images/editorial/craft-layers.jpg", "Leather bag shown with the layers of material used in its construction")}
                  className={`${styles.frame} ${styles.pairShort}`}
                  sizes="(min-width: 900px) 330px, 100vw"
                />
                <div className={styles.craftSecond}>
                  <MediaFrame
                    image={img("/images/editorial/craft-burnishing.jpg", "Hands burnishing the edge of a leather piece")}
                    className={styles.pairShort}
                    sizes="330px"
                  />
                </div>
              </div>
            </Col>
          </Split>
        </div>
      </Section>

      {/* SECTION 06: Made in Sudbury */}
      <Section tone="dark" labelledBy="home-title">
        <div className="container">
          <Split>
            <Col span={6} className={styles.desktopFirst}>
              <MediaFrame
                image={img("/images/editorial/sudbury-workshop.jpg", "Leatherworkers at benches inside a workshop")}
                onDark
                large
                className={`${styles.frame} ${styles.frame414}`}
                sizes="(min-width: 900px) 592px, 100vw"
              />
            </Col>
            <Col span={6} className={styles.text}>
              <SectionHeading
                id="home-title"
                eyebrow="Our home"
                title={
                  <>
                    Handcrafted in
                    <br />
                    Sudbury, Ontario.
                  </>
                }
                lead="Sudbury is home to Leyte Leather. Our brand is built around handcrafted leather goods, made one piece at a time."
                loose
              />
            </Col>
          </Split>
        </div>
      </Section>

      {/* SECTION 07: More than a collection */}
      <Section tone="cream" labelledBy="collection-title">
        <div className="container">
          <div className={styles.collectionHead}>
            <SectionHeading
              id="collection-title"
              className={styles.collectionHeading}
              title="Made for different lives."
              lead={
                <span className="t-body" style={{ display: "block" }}>
                  From everyday essentials to accessories for personal passions, the Leyte Leather collection brings together handcrafted leather
                  goods for different needs.
                </span>
              }
            />
            <div className="desktop-only">
              <Button href="/shop" variant="secondary">
                Explore the collection
              </Button>
            </div>
          </div>
          <div className={styles.grid}>
            {ordered.map((p) => {
              const override = ABOUT_CARD_IMAGES[p.slug];
              return (
                <ProductCard
                  key={p.slug}
                  slug={p.slug}
                  name={p.name}
                  image={override ? { ...p.cardImage, ...override } : p.cardImage}
                  hidePrice
                />
              );
            })}
          </div>
          <div className={`mobile-only ${styles.mobileCta}`}>
            <Button href="/shop" variant="secondary" fullWidth>
              Explore the collection
            </Button>
          </div>
        </div>
      </Section>

      {/* SECTION 08: Personalisation and custom work */}
      <Section tone="espresso" labelledBy="personal-title">
        <div className="container">
          <Split alignStart>
            <Col span={5}>
              <div className={styles.customText}>
                <SectionHeading
                  id="personal-title"
                  eyebrow="Made personal"
                  title={
                    <>
                      Your idea. Your
                      <br />
                      specifications.
                    </>
                  }
                  lead="Looking for something beyond the existing collection? Leyte Leather welcomes custom-order requests. Share your idea, measurements and reference images, and the team will review your request and email a quotation."
                />
                <div className="desktop-only" style={{ paddingTop: 8 }}>
                  <Button href="/custom-orders" variant="light">
                    Start a custom order
                  </Button>
                </div>
              </div>
            </Col>
            <Col span={7}>
              <CustomOrderProcess title="Custom-order process" steps={ABOUT_PROCESS_STEPS} dark />
            </Col>
            <div className="mobile-only">
              <Button href="/custom-orders" variant="light" fullWidth>
                Start a custom order
              </Button>
            </div>
          </Split>
        </div>
      </Section>

      {/* SECTION 09: Brand promise */}
      <Section tone="cream" spacing="tight" borderBottom className="about-values">
        <div className="container">
          <h2 className="visually-hidden">What we stand for</h2>
          <ValueStrip
            largeTitles
            items={[
              { icon: "handyman", title: "Handcrafted", text: "Leather goods presented as handcrafted, one piece at a time." },
              { icon: "layers", title: "Material-focused", text: "Full-grain leather is central to the brand's product positioning." },
              { icon: "edit_note", title: "Personal", text: "Custom orders are welcome, allowing customers to request products based on their specifications." },
            ]}
          />
        </div>
      </Section>

      {/* SECTION 10: Final brand CTA */}
      <CtaBand
        title="Find a piece that's yours."
        lead="Explore the collection or tell us about something you'd like made."
        primary={{ href: "/shop", label: "Shop the collection" }}
        secondary={{ href: "/custom-orders", label: "Request a custom piece" }}
      />
    </>
  );
}
