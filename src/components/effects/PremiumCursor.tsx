"use client";

import { useEffect, useRef } from "react";
import styles from "./PremiumCursor.module.css";

const INTERACTIVE = "a, button, [role='button'], summary, label, select, [data-cursor]";
const TEXT_ENTRY = "input:not([type='checkbox']):not([type='radio']):not([type='submit']):not([type='button']), textarea, [contenteditable='true']";

/**
 * Brass dot + trailing ring that replaces the system cursor on fine-pointer
 * devices. The ring grows over interactive elements and shows "View" over
 * product cards. Text fields keep the native caret for usability.
 */
export function PremiumCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    root.classList.add("has-premium-cursor");

    const target = { x: -100, y: -100 };
    const pos = { x: -100, y: -100 };
    let raf = 0;
    let visible = false;

    const setMode = (el: Element | null) => {
      const r = ring.current;
      const d = dot.current;
      if (!r || !d) return;
      const text = el?.closest(TEXT_ENTRY);
      const view = el?.closest("[data-cursor='view']");
      const hot = el?.closest(INTERACTIVE);
      r.dataset.mode = text ? "text" : view ? "view" : hot ? "hover" : "default";
      d.dataset.mode = r.dataset.mode;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) {
        visible = true;
        pos.x = target.x;
        pos.y = target.y;
        ring.current?.classList.add(styles.visible);
        dot.current?.classList.add(styles.visible);
      }
      if (dot.current) dot.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
      setMode(e.target as Element);
    };
    const onLeave = () => {
      visible = false;
      ring.current?.classList.remove(styles.visible);
      dot.current?.classList.remove(styles.visible);
    };
    const onDown = () => ring.current?.classList.add(styles.pressed);
    const onUp = () => ring.current?.classList.remove(styles.pressed);

    const tick = () => {
      const k = reduce ? 1 : 0.18;
      pos.x += (target.x - pos.x) * k;
      pos.y += (target.y - pos.y) * k;
      if (ring.current) ring.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      root.classList.remove("has-premium-cursor");
    };
  }, []);

  return (
    <>
      <div ref={ring} className={styles.ring} aria-hidden data-mode="default">
        <span className={styles.label}>View</span>
      </div>
      <div ref={dot} className={styles.dot} aria-hidden data-mode="default" />
    </>
  );
}
