import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductUnavailable } from "@/components/product/ProductUnavailable";
import { AddToCart } from "@/components/product/AddToCart";
import { Breadcrumb } from "@/components/product/Breadcrumb";
import { ProductGallery } from "@/components/product/ProductGallery";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { formatPrice } from "@/lib/format";
import { slugSchema } from "@/lib/validation";
import { getProduct, listProducts } from "@/server/products";
import styles from "../../product.module.css";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = slugSchema.safeParse(slug).success ? getProduct(slug) : null;
  return { title: p ? `Personalise — ${p.name}` : "Product not found" };
}

/*
 * Product Customiser — Figma 1:1632 (desktop) / 1:1876 (mobile).
 * Option groups are shown exactly as designed: "pending business confirmation".
 * No colours, thread, hardware, sizing, character limits or fees are invented;
 * the configuration schema (productConfigSchema) only accepts confirmed fields.
 */
export default async function PersonalisePage({ params }: Props) {
  const { slug } = await params;
  if (!slugSchema.safeParse(slug).success) notFound();
  const product = getProduct(slug);
  if (!product || !product.personalisable) notFound();
  if (!product.active) return <ProductUnavailable name={product.name} />;
  const personalisable = listProducts().filter((p) => p.personalisable);

  return (
    <>
      <div className={styles.crumbBar}>
        <div className={`container ${styles.crumbInner}`}>
          <Breadcrumb
            items={[
              { href: "/", label: "Home" },
              { href: "/shop", label: "Shop" },
              { href: `/product/${product.slug}`, label: product.name },
              { label: "Personalise" },
            ]}
          />
          <Link href={`/product/${product.slug}`} className={`${styles.backLink} desktop-only`}>
            <Icon name="arrow_back" size={16} />
            Back to product detail
          </Link>
        </div>
      </div>

      <div className={`${styles.switcher} desktop-only`}>
        <div className={`container ${styles.switcherInner}`}>
          <p className={styles.switcherLabel}>Catalogue personalisation framework</p>
          <nav className={styles.switcherGroup} aria-label="Select personalisable product">
            {personalisable.map((p) => (
              <Link
                key={p.slug}
                href={`/product/${p.slug}/personalise`}
                className={styles.switch}
                aria-current={p.slug === product.slug ? "page" : undefined}
              >
                {p.name} ({formatPrice(p.priceCents)})
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <section className={styles.workspace} aria-labelledby="product-title">
        <div className={`container ${styles.grid}`}>
          <div className={styles.galleryCol} style={{ order: 0 }}>
            <div className="mobile-only" style={{ marginBottom: 24 }}>
              <Badge>Personalised Catalogue Piece</Badge>
              <p className="t-h1" style={{ color: "var(--color-brand-espresso)", marginTop: 12 }} aria-hidden="true">
                {product.name}
              </p>
              <p className={styles.price} style={{ marginTop: 8 }}>
                {formatPrice(product.priceCents)}
              </p>
              <p className="t-body-s" style={{ color: "var(--color-neutral-700)", marginTop: 8 }}>
                Make it personal. Choose from the available options to create a piece that feels like yours.
              </p>
            </div>
            <ProductGallery images={product.gallery} productName={product.name} />
          </div>

          <div className={styles.panel}>
            <div className={`${styles.titleBlock} desktop-only`}>
              <Badge>Personalised Catalogue Piece</Badge>
              <h1 id="product-title" className={`t-h1 ${styles.title}`}>
                {product.name}
              </h1>
              <p className={styles.price}>{formatPrice(product.priceCents)}</p>
              <p className={`t-body ${styles.lead}`}>Make it personal. Choose from the available options to create a piece that feels like yours.</p>
            </div>
            <h1 className="visually-hidden mobile-only">Personalise {product.name}</h1>

            <Alert tone="info" title="Pending business configuration">
              Specific leather colours, stitching thread colours, hardware finishes, and personalisation text rules have not yet been supplied by
              Leyte Leather. Only confirmed options will become selectable here.
            </Alert>

            <section className={styles.step} aria-labelledby="step-1">
              <div className={styles.stepHead}>
                <h2 id="step-1" className={styles.stepTitle}>
                  Step 01 — Material, stitching &amp; hardware
                </h2>
                <span className={styles.stepStatus}>Pending confirmation</span>
              </div>
              <p className={`${styles.stepText} mobile-only`}>Material, stitching, and hardware options are pending confirmation.</p>
              <div className={`${styles.optionGrid} desktop-only`}>
                {[
                  ["Material options", "Leather colour & finish choices pending confirmation."],
                  ["Stitching options", "Thread colour choices pending confirmation."],
                  ["Hardware options", "Buckle & attachment finishes pending confirmation."],
                  ["Product-specific sizing", "Strap length variations pending confirmation."],
                ].map(([t, d]) => (
                  <div key={t} className={styles.optionCard} aria-disabled="true">
                    <p className={styles.optionTitle}>{t}</p>
                    <p className={styles.optionText}>{d}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.step} aria-labelledby="step-2">
              <div className={styles.stepHead}>
                <h2 id="step-2" className={styles.stepTitle}>
                  Step 02 — Personalisation
                </h2>
                <span className={styles.stepStatus}>Pending confirmation</span>
              </div>
              <p className={`${styles.stepText} mobile-only`}>Personalisation fields and character limits are pending confirmation.</p>
              <p className={`${styles.stepText} desktop-only`}>
                Personalisation fields (such as initials, name, or character limits) will appear here once confirmed by Leyte Leather. No
                unconfirmed fees or character limits are applied.
              </p>
            </section>

            <section className={styles.step} aria-labelledby="step-3">
              <div className={styles.stepHead}>
                <h2 id="step-3" className={styles.stepTitle}>
                  Step 03 — Your configuration
                </h2>
                <span className={styles.stepStatus}>Transparent pricing</span>
              </div>
              <dl className={styles.summary}>
                <div className={styles.summaryRow}>
                  <dt>Product</dt>
                  <dd>{product.name}</dd>
                </div>
                <div className={styles.summaryRow}>
                  <dt>Base product price</dt>
                  <dd>{formatPrice(product.priceCents)}</dd>
                </div>
                <div className={styles.summaryRow}>
                  <dt>Personalisation &amp; additional options</dt>
                  <dd>Pending confirmation</dd>
                </div>
                <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                  <dt>Total</dt>
                  <dd>{formatPrice(product.priceCents)}</dd>
                </div>
              </dl>
            </section>

            <AddToCart
              productId={product.slug}
              productName={product.name}
              config={{ personalisation: "pending" }}
              label="Add personalised product to cart"
              stickyMobile={{ priceLabel: formatPrice(product.priceCents) }}
            />

            <div className={styles.customAlt}>
              <span>Looking for something outside standard catalogue options?</span>
              <Button href="/custom-orders" variant="secondary">
                Request a fully custom piece
              </Button>
            </div>
          </div>
        </div>
      </section>
      <div className="sticky-spacer mobile-only" aria-hidden="true" />
    </>
  );
}
