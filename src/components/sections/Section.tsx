import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import type { ProductImage } from "@/data/catalog";
import styles from "./Section.module.css";

export type Tone = "cream" | "parchment" | "espresso" | "dark" | "white";

interface SectionProps {
  tone?: Tone;
  children: ReactNode;
  className?: string;
  borderTop?: boolean;
  borderBottom?: boolean;
  /** "tight" = value strips (40/64px), "medium" = 80px CTA bands. */
  spacing?: "default" | "tight" | "medium";
  labelledBy?: string;
  id?: string;
}

export function Section({ tone = "cream", children, className, borderTop, borderBottom, spacing = "default", labelledBy, id }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={[
        styles.section,
        styles[tone],
        borderTop ? styles.borderTop : "",
        borderBottom ? styles.borderBottom : "",
        spacing === "tight" ? styles.tight : "",
        spacing === "medium" ? styles.medium : "",
        tone === "espresso" || tone === "dark" ? styles.onDark : "",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </section>
  );
}

interface HeadingProps {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  as?: "h1" | "h2";
  /** Typographic style: Figma section headings use the H1 scale (48/52 → 36/40). */
  size?: "display" | "h1" | "h2";
  loose?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function SectionHeading({ id, eyebrow, title, lead, as = "h2", size = "h1", loose, className, style }: HeadingProps) {
  const H = as;
  const titleClass = size === "display" ? "t-display-xl" : size === "h2" ? "t-h2" : "t-h1";
  return (
    <div className={[styles.heading, loose ? styles.headingLoose : "", className ?? ""].join(" ")} style={style}>
      {eyebrow && <p className="t-eyebrow">{eyebrow}</p>}
      <H id={id} className={`${titleClass} ${styles.headingTitle}`}>
        {title}
      </H>
      {lead && <div className={`t-lead ${styles.headingLead}`}>{lead}</div>}
    </div>
  );
}

export function Split({ children, gap40, alignStart, className }: { children: ReactNode; gap40?: boolean; alignStart?: boolean; className?: string }) {
  return (
    <div className={[styles.split, gap40 ? styles.splitGap40 : "", alignStart ? styles.alignStart : "", className ?? ""].join(" ")}>
      {children}
    </div>
  );
}

export function Col({ span, children, className, order }: { span: 5 | 6 | 7; children: ReactNode; className?: string; order?: number }) {
  return (
    <div className={[styles[`span${span}`], className ?? ""].join(" ")} style={order !== undefined ? { order } : undefined}>
      {children}
    </div>
  );
}

interface MediaProps {
  image: ProductImage;
  /** CSS height or aspect for the frame (mobile → desktop handled by className). */
  className?: string;
  onDark?: boolean;
  large?: boolean;
  sizes: string;
  priority?: boolean;
}

export function MediaFrame({ image, className, onDark, large, sizes, priority }: MediaProps) {
  return (
    <div className={[styles.media, onDark ? styles.mediaOnDark : "", large ? styles.mediaLarge : "", className ?? ""].join(" ")}>
      <Image src={image.src} alt={image.alt} fill sizes={sizes} priority={priority} />
    </div>
  );
}

export function Actions({ children, center }: { children: ReactNode; center?: boolean }) {
  return <div className={[styles.actions, center ? styles.actionsCenter : ""].join(" ")}>{children}</div>;
}
