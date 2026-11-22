import type { Metadata } from "next";
import Link from "next/link";
import { AccountShell, accountStyles as s } from "@/components/account/AccountShell";
import { Icon } from "@/components/ui/Icon";
import { requireCustomer } from "@/server/require-auth";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

export default async function AccountOverviewPage() {
  const c = await requireCustomer("/account");
  const name = [c.first_name, c.last_name].filter(Boolean).join(" ");
  return (
    <AccountShell eyebrow="My account" title="Welcome back." lead="Manage your personal details and keep your orders organised.">
      <div className={s.panel}>
        <div className={s.panelHead}>
          <h2 className={s.panelTitle}>Account Overview</h2>
          <Link href="/account/personal-information" className={s.textLink}>
            Edit details
          </Link>
        </div>
        <dl className={s.details}>
          <div>
            <dt className={s.detailLabel}>Customer name</dt>
            <dd className={`${s.detailValue} ${name ? "" : s.muted}`}>{name || "Not yet provided"}</dd>
          </div>
          <div>
            <dt className={s.detailLabel}>Email address</dt>
            <dd className={s.detailValue}>{c.email}</dd>
          </div>
        </dl>
      </div>
      <ul className={s.cards}>
        {[
          { icon: "receipt_long" as const, title: "Order History", text: "View your past purchases and order details.", href: "/account/orders", link: "View Order History" },
          { icon: "badge" as const, title: "Personal Details", text: "Review or update your name and email address.", href: "/account/personal-information", link: "Edit Personal Information" },
          { icon: "lock" as const, title: "Account Security", text: "Update your password or manage your session.", href: "/account/security", link: "Manage Account Security" },
        ].map((x) => (
          <li key={x.href} className={s.card}>
            <Icon name={x.icon} size={22} />
            <h2 className={s.cardTitle}>{x.title}</h2>
            <p className={s.cardText}>{x.text}</p>
            <Link href={x.href} className={s.textLink}>
              {x.link} <Icon name="arrow_forward" size={16} />
            </Link>
          </li>
        ))}
      </ul>
      <div className={s.strip}>
        <span>Looking for a new piece or a bespoke request?</span>
        <span className={s.stripLinks}>
          <Link href="/shop" className={s.textLink}>Shop</Link>
          <Link href="/cart" className={s.textLink}>Cart</Link>
          <Link href="/custom-orders" className={s.textLink}>Custom Orders</Link>
        </span>
      </div>
    </AccountShell>
  );
}
