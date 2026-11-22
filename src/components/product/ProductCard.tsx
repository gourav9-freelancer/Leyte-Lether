import Image from "next/image";
import Link from "next/link";
import { catalogEntry, type ProductImage } from "@/data/catalog";
import { CATEGORY_LABEL, CRAFT_PROCESS, productStory } from "@/data/product-stories";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/format";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  slug: string;
  name: string;
  priceCents?: number;
  image: ProductImage;
  /** Show "Personalisation available" only for verified personalisable products. */
  personalisationBadge?: boolean;
  /** About page "collection" variant: name only, no price (as designed). */
  hidePrice?: boolean;
  priority?: boolean;
  sizes?: string;
  headingLevel?: "h2" | "h3" | "h4";
}

/**
 * Product card with a "preview" hover state: the card lifts and scales, the photo
 * slowly zooms and cross-fades to a second shot, and an editorial panel (story,
 * quality, workshop process) rises over the image. Hover effects only apply on
 * devices with a fine pointer; keyboard focus reveals the same panel.
 */
export function ProductCard({
  slug,
  name,
  priceCents,
  image,
  personalisationBadge,
  hidePrice,
  priority,
  sizes = "(min-width: 1200px) 270px, (min-width: 900px) 30vw, 50vw",
  headingLevel = "h3",
}: ProductCardProps) {
  const H = headingLevel;
  const entry = catalogEntry(slug);
  const story = productStory(slug);
  const alternate = entry?.gallery.find((g) => g.src !== image.src) ?? (entry?.cardImage.src !== image.src ? entry?.cardImage : undefined);

  return (
    <article className={styles.card} data-cursor="view">
      <div className={styles.media}>
        <Image className={styles.primary} src={image.src} alt={image.alt} fill sizes={sizes} priority={priority} />
        {alternate && <Image className={styles.alternate} src={alternate.src} alt="" aria-hidden fill sizes={sizes} />}
        <span className={styles.sheen} aria-hidden />
        <div className={styles.reveal}>
          {entry && <p className={styles.revealEyebrow}>{CATEGORY_LABEL[entry.category]}</p>}
          <p className={styles.revealTagline}>{story.tagline}</p>
          <p className={styles.revealStory}>{story.story}</p>
          <ul className={styles.revealQuality} aria-label="Quality">
            {story.quality.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
          <ol className={styles.revealProcess} aria-label="Workshop process">
            {CRAFT_PROCESS.map((step, i) => (
              <li key={step}>
                <span aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className={`${styles.body} ${hidePrice ? styles.compactBody : ""}`}>
        {personalisationBadge && <Badge>Personalisation available</Badge>}
        <H className={styles.name}>
          <Link href={`/product/${slug}`}>{name}</Link>
        </H>
        <div className={styles.footer}>
          {!hidePrice && priceCents !== undefined && <p className={styles.price}>{formatPrice(priceCents)}</p>}
          <span className={styles.cta} aria-hidden>
            View piece <span className={styles.ctaArrow}>→</span>
          </span>
        </div>
      </div>
    </article>
  );
}
