"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import galleryStyles from "@/components/product/ProductGallery.module.css";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { CATEGORIES, type CategoryId } from "@/data/catalog";
import shopStyles from "@/app/shop/shop.module.css";
import styles from "./gallery.module.css";

export interface GalleryItem {
  slug: string;
  name: string;
  priceLabel: string;
  category: CategoryId;
  image: { src: string; alt: string };
}

/** Editorial rhythm from the approved frame: 7/5, 4/4/4, 5/7, 12 (repeats). */
const PATTERN: { span: string; shape: "wide" | "tall" | "full"; stack?: boolean }[] = [
  { span: styles.span7, shape: "wide" },
  { span: styles.span5, shape: "tall" },
  { span: styles.span4, shape: "tall", stack: true },
  { span: styles.span4, shape: "tall", stack: true },
  { span: styles.span4, shape: "tall", stack: true },
  { span: styles.span5, shape: "tall" },
  { span: styles.span7, shape: "wide" },
  { span: styles.span12, shape: "full" },
];

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [filter, setFilter] = useState<CategoryId | "all">("all");
  const [open, setOpen] = useState<number | null>(null);
  const shown = useMemo(() => items.filter((i) => filter === "all" || i.category === filter), [items, filter]);
  const current = open !== null ? shown[open] : null;
  const go = (d: number) => setOpen((i) => (i === null ? i : (i + d + shown.length) % shown.length));

  return (
    <>
      <div className={styles.filters} role="group" aria-label="Gallery category filters">
        {[{ id: "all" as const, name: "All" }, ...CATEGORIES].map((c) => (
          <button key={c.id} type="button" className={shopStyles.tab} aria-pressed={filter === c.id} onClick={() => setFilter(c.id)}>
            {c.name}
          </button>
        ))}
      </div>
      <p className="visually-hidden" aria-live="polite">
        Showing {shown.length} pieces
      </p>
      {shown.length === 0 ? (
        <EmptyState icon="image" title="No images in this collection yet." actions={<button type="button" className={shopStyles.tab} onClick={() => setFilter("all")}>View All</button>}>
          Explore the full gallery to discover available pieces.
        </EmptyState>
      ) : (
        <ul className={styles.grid} style={{ marginTop: 32 }}>
          {shown.map((item, i) => {
            const p = PATTERN[i % PATTERN.length];
            return (
              <li key={item.slug} className={`${styles.tile} ${p.span}`}>
                <button
                  type="button"
                  className={`${styles.media} ${p.shape === "wide" ? styles.wide : p.shape === "full" ? styles.full : ""}`}
                  onClick={() => setOpen(i)}
                  aria-label={`View ${item.name} in gallery viewer`}
                >
                  <Image src={item.image.src} alt={item.image.alt} fill sizes={p.shape === "full" ? "(min-width: 900px) 1152px, 100vw" : "(min-width: 900px) 660px, 100vw"} />
                </button>
                <div className={`${styles.caption} ${p.stack ? styles.captionStack : ""}`}>
                  <div>
                    <p className={styles.name}>{item.name}</p>
                    <p className={styles.price}>{item.priceLabel}</p>
                  </div>
                  <Link href={`/product/${item.slug}`} className={styles.viewLink}>
                    View product <Icon name="arrow_forward" size={16} />
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog.Root open={current !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className={galleryStyles.overlay} />
          {current && (
            <Dialog.Content
              className={galleryStyles.lightbox}
              aria-describedby={undefined}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") go(1);
                if (e.key === "ArrowLeft") go(-1);
              }}
            >
              <div className={galleryStyles.lightboxHead}>
                <Dialog.Title className={galleryStyles.lightboxTitle}>
                  {current.name} — {open! + 1} of {shown.length}
                </Dialog.Title>
                <Dialog.Close className={galleryStyles.control} aria-label="Close gallery viewer">
                  <Icon name="close" size={22} />
                </Dialog.Close>
              </div>
              <div className={galleryStyles.lightboxImage}>
                <Image src={current.image.src} alt={current.image.alt} fill sizes="100vw" />
              </div>
              <div className={galleryStyles.lightboxNav}>
                <button type="button" className={galleryStyles.control} onClick={() => go(-1)} aria-label="Previous image">
                  <Icon name="chevron_left" size={22} />
                </button>
                <Link href={`/product/${current.slug}`} className={galleryStyles.control} style={{ width: "auto", padding: "0 16px", fontWeight: 600, fontSize: 14 }}>
                  View product
                </Link>
                <button type="button" className={galleryStyles.control} onClick={() => go(1)} aria-label="Next image">
                  <Icon name="chevron_right" size={22} />
                </button>
              </div>
            </Dialog.Content>
          )}
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
