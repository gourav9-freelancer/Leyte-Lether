import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductUnavailable } from "@/components/product/ProductUnavailable";
import { AddToCart } from "@/components/product/AddToCart";
import { Breadcrumb } from "@/components/product/Breadcrumb";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGallery } from "@/components/product/ProductGallery";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { CATEGORIES } from "@/data/catalog";
import { formatPrice } from "@/lib/format";
import { slugSchema } from "@/lib/validation";
import { getProduct, listProducts } from "@/server/products";
import styles from "../product.module.css";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = slugSchema.safeParse(slug).success ? getProduct(slug) : null;
  if (!product) return { title: "Product not found" };
  if (!product.active) return { title: `${product.name} — unavailable`, robots: { index: false } };
  return {
    title: product.name,
    description: `${product.name} — handcrafted leather goods from Leyte Leather, Sudbury, Ontario. ${formatPrice(product.priceCents)}.`,
  };
}

/*
 * Product detail. Not designed in Figma (implementation gap) — composed from the
 * approved Customiser layout (breadcrumb bar, 552px gallery + panel, step cards)
 * and shows ONLY verified product information (README §12).
 */
export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  if (!slugSchema.safeParse(slug).success) notFound();
  const product = getProduct(slug);
  if (!product) notFound();
  if (!product.active) return <ProductUnavailable name={product.name} />;
  const category = CATEGORIES.find((c) => c.id === product.category);
  const related = listProducts().filter((p) => p.category === product.category && p.slug !== product.slug);

  return (
    <>
      <div className={styles.crumbBar}>
        <div className={`container ${styles.crumbInner}`}>
          <Breadcrumb
            items={[
              { href: "/", label: "Home" },
              { href: "/shop", label: "Shop" },
              { label: product.name },
            ]}
          />
        </div>
      </div>

      <section className={styles.workspace} aria-labelledby="product-title">
        <div className={`container ${styles.grid}`}>
          <div className={styles.galleryCol}>
            <ProductGallery images={product.gallery} productName={product.name} />
          </div>
          <div className={styles.panel}>
            <div className={styles.titleBlock}>
              {product.personalisable && <Badge>Personalisation available</Badge>}
              <h1 id="product-title" className={`t-h1 ${styles.title}`}>
                {product.name}
              </h1>
              <p className={styles.price}>{formatPrice(product.priceCents)}</p>
              <p className={`t-body ${styles.lead}`}>Handcrafted leather goods, built one piece at a time in Sudbury, Ontario.</p>
            </div>

            <ul className={styles.facts} aria-label="About this piece">
              <li className={styles.fact}>
                <Icon name="location_on" size={20} />
                <span>Handcrafted in Sudbury, Ontario</span>
              </li>
              {category && (
                <li className={styles.fact}>
                  <Icon name="grid_view" size={20} />
                  <span>
                    Part of the <a href={`/shop?category=${category.id}`} style={{ color: "var(--color-brand-saddle)", textDecoration: "underline", textUnderlineOffset: 3 }}>{category.name}</a> collection
                  </span>
                </li>
              )}
              {product.personalisable && (
                <li className={styles.fact}>
                  <Icon name="edit_note" size={20} />
                  <span>Available with personalisation</span>
                </li>
              )}
            </ul>

            <Alert tone="info" title="Product details pending confirmation">
              Materials, dimensions and care details for this piece have not yet been supplied by Leyte Leather. Only confirmed information is shown.
            </Alert>

            <div className={styles.step}>
              <div className={styles.stepHead}>
                <h2 className={styles.stepTitle}>Add to cart</h2>
                <span className={styles.stepStatus}>{formatPrice(product.priceCents)} each</span>
              </div>
              <AddToCart productId={product.slug} productName={product.name} stickyMobile={{ priceLabel: formatPrice(product.priceCents) }} />
              {product.personalisable && (
                <div className={styles.customAlt}>
                  <span>Want this piece personalised?</span>
                  <Button href={`/product/${product.slug}/personalise`} variant="secondary">
                    Personalise this piece
                  </Button>
                </div>
              )}
            </div>

            <div className={styles.customAlt}>
              <span>Looking for something outside standard catalogue options?</span>
              <Button href="/custom-orders" variant="secondary">
                Request a fully custom piece
              </Button>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className={styles.related} aria-labelledby="related-title">
          <div className="container">
            <p className="t-eyebrow">{category?.name}</p>
            <h2 id="related-title" className="t-h2" style={{ color: "var(--color-brand-espresso)", marginTop: 8 }}>
              More from this collection
            </h2>
            <ul className={styles.relatedGrid}>
              {related.map((p) => (
                <li key={p.slug}>
                  <ProductCard slug={p.slug} name={p.name} priceCents={p.priceCents} image={p.cardImage} personalisationBadge={p.personalisable} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <div className="sticky-spacer mobile-only" aria-hidden="true" />
    </>
  );
}
