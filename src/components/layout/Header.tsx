"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { api } from "@/lib/client/api";
import styles from "./Header.module.css";

const NAV = [
  { href: "/shop", label: "Shop", match: ["/shop", "/product"] },
  { href: "/custom-orders", label: "Custom Orders", match: ["/custom-orders"] },
  { href: "/gallery", label: "Gallery", match: ["/gallery"] },
  { href: "/about", label: "About", match: ["/about"] },
];

function isActive(pathname: string, match: string[]) {
  return match.some((m) => pathname === m || pathname.startsWith(`${m}/`));
}

export interface HeaderAccount {
  firstName: string;
  lastName: string;
  email: string;
}

interface HeaderProps {
  cartCount: number;
  /** The signed-in customer, or null when signed out. */
  account: HeaderAccount | null;
}

const ACCOUNT_LINKS: { href: string; label: string; icon: IconName }[] = [
  { href: "/account", label: "Account overview", icon: "person" },
  { href: "/account/orders", label: "Order history", icon: "receipt_long" },
  { href: "/account/personal-information", label: "Personal information", icon: "badge" },
  { href: "/account/security", label: "Account security", icon: "lock" },
];

function initials(a: HeaderAccount): string {
  const i = `${a.firstName.trim()[0] ?? ""}${a.lastName.trim()[0] ?? ""}`;
  return (i || a.email[0] || "?").toUpperCase();
}

function useSignOut() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  async function signOut() {
    setSigningOut(true);
    try {
      await api("/api/auth/logout", { method: "POST", body: {} });
    } finally {
      router.replace("/login?notice=signed-out");
      router.refresh();
      setSigningOut(false);
    }
  }
  return { signOut, signingOut };
}

/** Signed-in account control: avatar + greeting button with a dropdown menu. */
function AccountMenu({ account, active }: { account: HeaderAccount; active: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const { signOut, signingOut } = useSignOut();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const name = account.firstName.trim() || "there";
  return (
    <div className={styles.accountWrap} ref={wrap}>
      <button
        ref={button}
        type="button"
        className={`${styles.account} ${styles.accountSignedIn} ${active ? styles.accountActive : ""}`}
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
      >
        <span className={styles.avatar} aria-hidden>
          {initials(account)}
        </span>
        <span className={styles.accountText}>
          <span className={styles.accountHello}>Hello,</span>
          <span className={styles.accountName}>{name}</span>
        </span>
        <span className="visually-hidden"> — account menu</span>
        <Icon name="keyboard_arrow_down" size={18} className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} />
      </button>
      <div id={menuId} className={styles.menu} data-open={open} hidden={!open}>
        <div className={styles.menuHead}>
          <span className={styles.avatarLarge} aria-hidden>
            {initials(account)}
          </span>
          <div className={styles.menuWho}>
            <p className={styles.menuName}>
              {[account.firstName, account.lastName].filter(Boolean).join(" ") || "Your account"}
            </p>
            <p className={styles.menuEmail}>{account.email}</p>
          </div>
        </div>
        <ul className={styles.menuList}>
          {ACCOUNT_LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className={styles.menuItem} aria-current={pathname === l.href ? "page" : undefined}>
                <Icon name={l.icon} size={18} />
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <button type="button" className={`${styles.menuItem} ${styles.menuSignOut}`} onClick={signOut} disabled={signingOut}>
          <Icon name="logout" size={18} />
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );
}

export function Header({ cartCount, account }: HeaderProps) {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const signedIn = account !== null;
  const { signOut, signingOut } = useSignOut();
  const accountActive = ["/account", "/login", "/register", "/forgot-password", "/reset-password"].some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const cartActive = pathname === "/cart" || pathname.startsWith("/checkout");

  // Close the drawer on navigation.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger className={styles.menuButton} aria-label="Open navigation menu">
            <Icon name="menu" size={24} />
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className={styles.overlay} />
            <Dialog.Content className={styles.drawer} aria-describedby={undefined}>
              <div className={styles.drawerHead}>
                <Dialog.Title className={styles.drawerTitle}>Leyte Leather</Dialog.Title>
                <Dialog.Close className={styles.menuButton} aria-label="Close navigation menu">
                  <Icon name="close" size={24} />
                </Dialog.Close>
              </div>
              <nav className={styles.drawerNav} aria-label="Mobile navigation">
                <Link href="/" className={styles.drawerLink} aria-current={pathname === "/" ? "page" : undefined}>
                  Home
                </Link>
                {NAV.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={styles.drawerLink}
                    aria-current={isActive(pathname, n.match) ? "page" : undefined}
                  >
                    {n.label}
                    <Icon name="chevron_right" size={20} />
                  </Link>
                ))}
                <div className={styles.drawerDivider} role="separator" />
                {account ? (
                  <>
                    <div className={styles.drawerAccount}>
                      <span className={styles.avatarLarge} aria-hidden>
                        {initials(account)}
                      </span>
                      <div className={styles.menuWho}>
                        <p className={styles.menuName}>Hello, {account.firstName.trim() || "there"}</p>
                        <p className={styles.menuEmail}>{account.email}</p>
                      </div>
                    </div>
                    <Link
                      href="/account"
                      className={`${styles.drawerLink} ${styles.drawerSecondary}`}
                      aria-current={accountActive ? "page" : undefined}
                    >
                      <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                        <Icon name="person" size={20} />
                        My account
                      </span>
                    </Link>
                    <Link href="/account/orders" className={`${styles.drawerLink} ${styles.drawerSecondary}`}>
                      <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                        <Icon name="receipt_long" size={20} />
                        Order history
                      </span>
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className={`${styles.drawerLink} ${styles.drawerSecondary}`}
                    aria-current={accountActive ? "page" : undefined}
                  >
                    <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                      <Icon name="person" size={20} />
                      Sign in
                    </span>
                  </Link>
                )}
                <Link
                  href="/cart"
                  className={`${styles.drawerLink} ${styles.drawerSecondary}`}
                  aria-current={cartActive ? "page" : undefined}
                >
                  <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                    <Icon name="shopping_bag" size={20} />
                    Cart
                  </span>
                  <span className={styles.count}>{cartCount}</span>
                </Link>
                {signedIn && (
                  <button type="button" className={`${styles.drawerLink} ${styles.drawerSecondary} ${styles.drawerSignOut}`} onClick={signOut} disabled={signingOut}>
                    <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                      <Icon name="logout" size={20} />
                      {signingOut ? "Signing out…" : "Sign out"}
                    </span>
                  </button>
                )}
              </nav>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <Link href="/" className={styles.logo} aria-label="Leyte Leather — home">
          Leyte Leather
        </Link>

        <nav className={styles.nav} aria-label="Primary navigation">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={styles.navLink}
              aria-current={isActive(pathname, n.match) ? "page" : undefined}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className={styles.utilities}>
          {account ? (
            <AccountMenu account={account} active={accountActive} />
          ) : (
            <Link href="/login" className={styles.account} aria-current={accountActive ? "page" : undefined}>
              <Icon name="person" size={20} />
              <span>Sign in</span>
            </Link>
          )}
          <Link
            href="/cart"
            className={`${styles.cart} ${cartActive ? styles.cartActive : ""}`}
            aria-current={pathname === "/cart" ? "page" : undefined}
            data-cart-count={cartCount}
          >
            <Icon name="shopping_bag" size={20} />
            {/* Accessible name "Cart 2 items" contains the visible text (WCAG 2.5.3). */}
            <span className={styles.cartLabel}>Cart</span>{" "}
            <span className={styles.count}>{cartCount}</span>
            <span className="visually-hidden"> {cartCount === 1 ? "item" : "items"}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
