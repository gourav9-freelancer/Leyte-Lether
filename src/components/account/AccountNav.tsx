"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { api } from "@/lib/client/api";
import styles from "./account.module.css";

const ITEMS: { href: string; label: string; icon: IconName }[] = [
  { href: "/account", label: "Account Overview", icon: "person" },
  { href: "/account/personal-information", label: "Personal Information", icon: "badge" },
  { href: "/account/orders", label: "Order History", icon: "receipt_long" },
  { href: "/account/security", label: "Account Security", icon: "lock" },
];

/** Exactly one section is active, derived from the current route. */
function activeHref(pathname: string) {
  const match = ITEMS.filter((i) => (i.href === "/account" ? pathname === "/account" : pathname === i.href || pathname.startsWith(`${i.href}/`)));
  return match[0]?.href ?? null;
}

export function AccountNav() {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const active = activeHref(pathname);
  const rowRef = useRef<HTMLDivElement>(null);

  // Keep the active section fully visible in the horizontally scrolling mobile row
  // (scrolls only the row — never the page).
  useEffect(() => {
    const row = rowRef.current;
    const link = row?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!row || !link || row.scrollWidth <= row.clientWidth) return;
    row.scrollLeft = Math.max(0, link.offsetLeft - row.offsetLeft - (row.clientWidth - link.offsetWidth) / 2);
  }, [active]);

  async function signOut() {
    setSigningOut(true);
    try {
      await api("/api/auth/logout", { method: "POST", body: {} });
    } finally {
      router.replace("/login?notice=signed-out");
      router.refresh();
    }
  }

  return (
    <nav className={styles.nav} aria-label="Account navigation">
      {/* Mobile (Figma 3:172): one horizontally scrolling row; desktop: vertical sidebar. */}
      <div className={styles.navLinks} ref={rowRef}>
        {ITEMS.map((i) => (
          <Link
            key={i.href}
            href={i.href}
            className={styles.navLink}
            aria-current={active === i.href ? "page" : undefined}
          >
            <Icon name={i.icon} size={20} />
            {i.label}
          </Link>
        ))}
      </div>
      <div className={styles.navDivider} role="separator" />
      <button type="button" className={`${styles.navLink} ${styles.signOut}`} onClick={signOut} disabled={signingOut} aria-busy={signingOut || undefined}>
        {signingOut ? <Spinner size="sm" /> : <Icon name="logout" size={20} />}
        {signingOut ? "Signing out…" : "Sign Out"}
      </button>
    </nav>
  );
}
