import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { CtaBand } from "@/components/sections/CtaBand";
import { CustomOrderProcess, HOME_PROCESS_STEPS } from "@/components/sections/CustomOrderProcess";
import { Actions, Col, MediaFrame, Section, SectionHeading, Split } from "@/components/sections/Section";
import { ValueStrip } from "@/components/sections/ValueStrip";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { catalogEntry } from "@/data/catalog";
import { listProducts } from "@/server/products";
import styles from "./home.module.css";

const HERO = { src: "/images/editorial/hero-collection.jpg", alt: "Handcrafted leather wallet, belt and key fob cover on a workshop bench", width: 1672, height: 941 };
const CRAFT_A = { src: "/images/editorial/bag-detail.jpg", alt: "Close-up of stitched leather and a brass buckle", width: 1536, height: 1024 };
const CRAFT_B = { src: "/images/editorial/clasp-detail.jpg", alt: "Close-up of a leather strap clasp and finished edges", width: 1536, height: 1024 };
const STORY = { src: "/images/editorial/workshop-story.jpg", alt: "Leather goods laid out on a workbench in the Leyte Leather workshop", width: 1536, height: 1024 };

const CATEGORY_CARDS = [
  {
    id: "essentials",
    title: "Everyday Essentials",
    desc: "Wallets, belts, and car key-fob covers.",
    mobileDesc: "Wallets, belts, and key-fob covers",
    link: "View essentials",
    image: { src: "/images/products/key-fob-set.jpg", alt: "Leather wallet, belt and key fob cover" },
  },
  {
    id: "personalised",
    title: "Personalised Gear",
    desc: "Camera straps, guitar straps, and watch straps.",
    mobileDesc: "Camera, guitar, and watch straps",
    link: "View accessories",
    image: { src: "/images/editorial/category-personalised.jpg", alt: "Leather camera strap, guitar strap and watch strap" },
  },
  {
    id: "outdoor",
    title: "Lifestyle and Outdoor",
    mobileTitle: "Lifestyle & Outdoor",
    desc: "Dog harnesses and handcrafted axe sheaths.",
    mobileDesc: "Dog harnesses and axe sheaths",
    link: "View outdoor goods",
    image: { src: "/images/editorial/category-outdoor.jpg", alt: "Leather dog harness and axe sheath outdoors" },
  },
];

export default function HomePage() {
  const products = listProducts();
  // Approved Figma order: 4 prioritised products, then the remaining 4.
  const featuredOrder = [
    "classic-leather-bifold-wallet",
    "classic-full-grain-leather-belt",
    "personalized-leather-camera-strap",
    "personalized-leather-guitar-strap",
    "leather-car-key-fob-cover",
    "handmade-leather-watch-strap",
    "premium-leather-dog-harness",
    "handcrafted-leather-axe-sheath",
  ];
  const ordered = featuredOrder.map((s) => products.find((p) => p.slug === s)).filter((p) => p !== undefined);
  const extra = products.filter((p) => !featuredOrder.includes(p.slug));
  const all = [...ordered, ...extra];
  const camera = products.find((p) => p.slug === "personalized-leather-camera-strap");
  const guitar = products.find((p) => p.slug === "personalized-leather-guitar-strap");
  const cameraDetail = catalogEntry("personalized-leather-camera-strap")?.gallery[0];

  return (
    <>
      {/* SECTION 03: Hero */}
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroGlow} aria-hidden />
        <div className={styles.heroGrain} aria-hidden />
        <div className={`container-wide ${styles.heroGrid}`}>
          <div className={styles.heroMediaCol}>
            <MediaFrame image={HERO} onDark large className={styles.heroMedia} sizes="(min-width: 900px) 592px, 100vw" priority />
          </div>
          <div className={styles.heroText}>
            <p className={`t-eyebrow ${styles.eyebrowLight} ${styles.heroRule}`}>
              <span className="desktop-only">Sudbury, Ontario · Leather atelier</span>
              <span className="mobile-only">Sudbury, Ontario</span>
            </p>
            <h1 id="hero-title" className={`t-display-xl ${styles.heroTitle}`}>
              <span className={styles.heroLine}>
                <span>Made by hand.</span>
              </span>{" "}
              <span className={styles.heroLine}>
                <span>
                  Made to be <em className={styles.heroAccent}>yours.</em>
                </span>
              </span>
            </h1>
            <p className={`t-lead ${styles.heroLead}`}>Handcrafted leather goods, built one piece at a time in Sudbury, Ontario.</p>
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
        <div className={styles.scrollCue} aria-hidden>
          <span />
          Scroll
        </div>
      </section>

      {/* SECTION 04: Brand value */}
      <Section tone="cream" spacing="tight" borderBottom>
        <div className="container">
          <h2 className="visually-hidden">Why Leyte Leather</h2>
          <ValueStrip
            items={[
              {
                icon: "location_on",
                title: "Handcrafted in Sudbury, Ontario",
                text: "Every wallet, strap, belt, and sheath is made one piece at a time in our Sudbury workshop.",
                mobileText: "Built one piece at a time in our local workshop.",
              },
              {
                icon: "layers",
                title: "Full-grain leather",
                text: "Crafted with full-grain leather chosen for natural character, clean grain, and tactile finish.",
                mobileText: "Selected for natural grain and tactile finish.",
              },
              {
                icon: "edit_note",
                title: "Custom orders welcome",
                text: "Share your idea, measurements, and reference images for a tailored custom-order quote.",
                mobileText: "Personalised pieces and bespoke requests quoted by email.",
              },
            ]}
          />
        </div>
      </Section>

      {/* SECTION 05: Featured collection */}
      <Section tone="cream" labelledBy="featured-title">
        <div className="container">
          <div className={styles.featuredHead}>
            <SectionHeading
              id="featured-title"
              className={styles.featuredHeading}
              eyebrow="Featured collection"
              title="Crafted for everyday life."
              lead="Explore handcrafted leather goods designed for everyday use and personal expression."
            />
            <div className="desktop-only">
              <Button href="/shop" variant="secondary">
                Explore all products
              </Button>
            </div>
          </div>
          <div className={styles.productGrid}>
            {all.slice(0, 4).map((p, i) => (
              <ProductCard key={p.slug} slug={p.slug} name={p.name} priceCents={p.priceCents} image={p.cardImage} priority={i < 2} />
            ))}
          </div>
          {all.length > 4 && (
            <>
              <div className={styles.moreHead}>
                <h3 className={`t-h4 ${styles.moreTitle}`}>More from the workshop</h3>
                <p className={styles.moreCount}>{products.length} pieces in catalogue</p>
              </div>
              <div className={styles.productGrid} style={{ marginTop: "var(--space-4)" }}>
                {all.slice(4).map((p) => (
                  <ProductCard key={p.slug} slug={p.slug} name={p.name} priceCents={p.priceCents} image={p.cardImage} />
                ))}
              </div>
            </>
          )}
          <div className={`mobile-only ${styles.mobileCta}`}>
            <Button href="/shop" variant="secondary" fullWidth>
              Explore all products
            </Button>
          </div>
        </div>
      </Section>

      {/* SECTION 06: Craftsmanship */}
      <Section tone="espresso" labelledBy="craft-title">
        <div className="container">
          <Split>
            <Col span={5}>
              <div className={styles.craftText}>
                <SectionHeading
                  id="craft-title"
                  eyebrow="Craftsmanship"
                  title={
                    <>
                      The beauty is
                      <br />
                      in the details.
                    </>
                  }
                  lead={
                    <>
                      <span className="desktop-only">
                        Every piece at Leyte Leather is built one at a time, giving attention to the natural grain of the hide, clean stitching,
                        finished edges, and hardware selection.
                      </span>
                      <span className="mobile-only">Built one piece at a time, with attention to leather grain, stitching, finished edges, and hardware.</span>
                    </>
                  }
                />
                <div className="desktop-only" style={{ paddingTop: 8 }}>
                  <Button href="/about" variant="light">
                    Discover our approach
                  </Button>
                </div>
              </div>
            </Col>
            <Col span={7}>
              <div className={styles.craftMedia}>
                <MediaFrame image={CRAFT_A} onDark className={styles.craftFrame} sizes="(min-width: 900px) 330px, 100vw" />
                <MediaFrame image={CRAFT_B} onDark className={styles.craftFrame} sizes="(min-width: 900px) 330px, 100vw" />
              </div>
            </Col>
            <div className="mobile-only">
              <Button href="/about" variant="light" fullWidth>
                Discover our approach
              </Button>
            </div>
          </Split>
        </div>
      </Section>

      {/* SECTION 07: Category discovery */}
      <Section tone="cream" labelledBy="category-title">
        <div className="container">
          <div style={{ maxWidth: 576 }}>
            <p className="t-eyebrow desktop-only" style={{ marginBottom: 12 }}>
              Browse by category
            </p>
            <h2 id="category-title" className={styles.categoryHeading}>
              Explore the
              <br />
              workshop catalogue.
            </h2>
          </div>
          <ul className={styles.categoryGrid}>
            {CATEGORY_CARDS.map((c) => (
              <li key={c.id} className={styles.categoryCard}>
                <div className={styles.categoryMedia}>
                  <Image src={c.image.src} alt="" fill sizes="368px" />
                </div>
                <div className={styles.categoryBody}>
                  <div className={styles.categoryText}>
                    <h3 className={`t-h4 ${styles.categoryTitle}`}>
                      <span className="desktop-only">{c.title}</span>
                      <span className="mobile-only">{c.mobileTitle ?? c.title}</span>
                    </h3>
                    <p className={styles.categoryDesc}>
                      <span className="desktop-only">{c.desc}</span>
                      <span className="mobile-only">{c.mobileDesc}</span>
                    </p>
                  </div>
                  <Link href={`/shop?category=${c.id}`} aria-label={`${c.link}: ${c.title}`}>
                    <span className={styles.categoryLink}>
                      {c.link}
                      <Icon name="arrow_forward" size={18} />
                    </span>
                    <Icon name="arrow_forward" size={20} className={`${styles.categoryArrow} ${styles.categoryArrowMobile}`} />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* SECTION 08: Personalisation story */}
      <Section tone="parchment" labelledBy="personal-title">
        <div className="container">
          <Split gap40>
            <Col span={5}>
              <div className={styles.personalText}>
                <SectionHeading
                  id="personal-title"
                  eyebrow="Individuality"
                  title="Make it personal."
                  lead={
                    <span className={styles.personalLead}>
                      <span className="desktop-only">
                        Selected pieces in the Leyte Leather catalogue—including our Personalized Leather Camera Strap and Personalized Leather
                        Guitar Strap—are available with personalisation so your piece is unmistakably yours.
                      </span>
                      <span className="mobile-only">
                        Selected pieces—including our Personalized Leather Camera Strap and Personalized Leather Guitar Strap—offer
                        personalisation.
                      </span>
                    </span>
                  }
                  loose
                />
                <div>
                  <Button href="/shop?category=personalised">Explore personalised products</Button>
                </div>
              </div>
            </Col>
            <Col span={7}>
              <div className={styles.personalCards}>
                {camera && (
                  <ProductCard
                    slug={camera.slug}
                    name={camera.name}
                    priceCents={camera.priceCents}
                    image={cameraDetail ?? camera.cardImage}
                    personalisationBadge
                    sizes="326px"
                  />
                )}
                {guitar && (
                  <ProductCard slug={guitar.slug} name={guitar.name} priceCents={guitar.priceCents} image={guitar.cardImage} personalisationBadge sizes="326px" />
                )}
              </div>
            </Col>
          </Split>
        </div>
      </Section>

      {/* SECTION 09: Custom orders feature */}
      <Section tone="dark" labelledBy="custom-title">
        <div className="container">
          <Split alignStart>
            <Col span={5}>
              <div className={styles.customText}>
                <SectionHeading
                  id="custom-title"
                  eyebrow="Bespoke commissions"
                  title={
                    <>
                      Have something
                      <br />
                      different in mind?
                    </>
                  }
                  lead="Tell us what you have in mind. We'll review your request and email a quote. Once accepted, a deposit secures your spot in the queue."
                />
                <div className="desktop-only" style={{ paddingTop: 8 }}>
                  <Button href="/custom-orders" variant="light">
                    Request a custom piece
                  </Button>
                </div>
              </div>
            </Col>
            <Col span={7}>
              <CustomOrderProcess title="Custom order process" steps={HOME_PROCESS_STEPS} />
            </Col>
            <div className="mobile-only">
              <Button href="/custom-orders" variant="light" fullWidth>
                Request a custom piece
              </Button>
            </div>
          </Split>
        </div>
      </Section>

      {/* SECTION 10: Brand story */}
      <Section tone="cream" labelledBy="story-title">
        <div className="container">
          <Split gap40>
            <Col span={6}>
              <MediaFrame image={STORY} large className={styles.storyMedia} sizes="592px" />
            </Col>
            <Col span={6}>
              <div className={styles.storyText}>
                <SectionHeading
                  id="story-title"
                  eyebrow="About Leyte Leather"
                  title="One piece at a time."
                  loose
                  lead={
                    <span className={styles.leadMuted}>
                      <span className="desktop-only">
                        Based in Sudbury, Ontario, Leyte Leather crafts functional leather goods—from wallets and belts to camera straps, guitar
                        straps, dog harnesses, and axe sheaths—alongside bespoke custom commissions.
                      </span>
                      <span className="mobile-only">Based in Sudbury, Ontario, Leyte Leather crafts functional leather goods alongside bespoke custom commissions.</span>
                    </span>
                  }
                />
                <div>
                  <Button href="/about" variant="secondary">
                    Discover our story
                  </Button>
                </div>
              </div>
            </Col>
          </Split>
        </div>
      </Section>

      {/* SECTION 11: Final conversion */}
      <CtaBand
        title="Find something made for you."
        primary={{ href: "/shop", label: "Explore the collection" }}
        secondary={{ href: "/custom-orders", label: "Request a custom piece" }}
      />
    </>
  );
}
