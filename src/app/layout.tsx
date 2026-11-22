import type { Metadata, Viewport } from "next";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "./globals.css";
import { PremiumCursor } from "@/components/effects/PremiumCursor";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { currentCustomer } from "@/server/auth";
import { getCart } from "@/server/cart";

export const metadata: Metadata = {
  title: {
    default: "Leyte Leather — Handcrafted leather goods from Sudbury, Ontario",
    template: "%s — Leyte Leather",
  },
  description: "Handcrafted leather goods, built one piece at a time in Sudbury, Ontario. Custom orders welcome.",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#2B1D17",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [customer, cart] = await Promise.all([currentCustomer(), getCart()]);
  return (
    // suppressHydrationWarning: browser extensions (e.g. ColorZilla's cz-shortcut-listen,
    // Grammarly) add attributes to <html>/<body> before React loads. It only ignores
    // attribute differences on these two tags — mismatches in children are still reported.
    <html lang="en-CA" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <AnnouncementBar />
        <Header
          cartCount={cart.itemCount}
          account={customer ? { firstName: customer.first_name ?? "", lastName: customer.last_name ?? "", email: customer.email } : null}
        />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <PremiumCursor />
      </body>
    </html>
  );
}
