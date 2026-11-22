"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { useCallback, useState, type KeyboardEvent } from "react";
import type { ProductImage } from "@/data/catalog";
import { Icon } from "@/components/ui/Icon";
import styles from "./ProductGallery.module.css";

/**
 * Accessible product gallery: thumbnails, previous/next controls, keyboard
 * arrows and a zoom lightbox that works with touch and keyboard (README §8).
 */
export function ProductGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const count = images.length;
  const go = useCallback((d: number) => setIndex((i) => (i + d + count) % count), [count]);
  const current = images[index];

  const onKey = (e: KeyboardEvent) => {
    if (count < 2) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
  };

  if (!current) return null;

  return (
    <div className={styles.gallery} role="region" aria-roledescription="carousel" aria-label={`${productName} images`} onKeyDown={onKey}>
      <div className={styles.main}>
        <Image
          src={current.src}
          alt={current.alt}
          fill
          sizes="(min-width: 1200px) 552px, (min-width: 900px) 45vw, 100vw"
          priority
        />
        {count > 1 && (
          <span className={styles.counter} aria-live="polite">
            Image {index + 1} of {count}
          </span>
        )}
        <div className={styles.controls}>
          {count > 1 && (
            <>
              <button type="button" className={styles.control} onClick={() => go(-1)} aria-label="Previous image">
                <Icon name="chevron_left" size={22} />
              </button>
              <button type="button" className={styles.control} onClick={() => go(1)} aria-label="Next image">
                <Icon name="chevron_right" size={22} />
              </button>
            </>
          )}
          <Dialog.Root open={zoom} onOpenChange={setZoom}>
            <Dialog.Trigger className={styles.control} aria-label="Zoom image">
              <Icon name="zoom_in" size={22} />
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className={styles.overlay} />
              <Dialog.Content className={styles.lightbox} onKeyDown={onKey} aria-describedby={undefined}>
                <div className={styles.lightboxHead}>
                  <Dialog.Title className={styles.lightboxTitle}>
                    {productName}
                    {count > 1 ? ` — image ${index + 1} of ${count}` : ""}
                  </Dialog.Title>
                  <Dialog.Close className={styles.control} aria-label="Close zoomed image">
                    <Icon name="close" size={22} />
                  </Dialog.Close>
                </div>
                <div className={styles.lightboxImage}>
                  <Image src={current.src} alt={current.alt} fill sizes="100vw" />
                </div>
                {count > 1 && (
                  <div className={styles.lightboxNav}>
                    <button type="button" className={styles.control} onClick={() => go(-1)} aria-label="Previous image">
                      <Icon name="chevron_left" size={22} />
                    </button>
                    <button type="button" className={styles.control} onClick={() => go(1)} aria-label="Next image">
                      <Icon name="chevron_right" size={22} />
                    </button>
                  </div>
                )}
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
      {count > 1 && (
        <div className={styles.thumbs} role="group" aria-label="Choose image">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              className={styles.thumb}
              onClick={() => setIndex(i)}
              aria-label={`Show image ${i + 1}: ${img.alt}`}
              aria-current={i === index ? "true" : undefined}
            >
              <Image src={img.src} alt="" fill sizes="129px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
