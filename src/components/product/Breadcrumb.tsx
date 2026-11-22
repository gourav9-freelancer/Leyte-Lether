import Link from "next/link";

export interface Crumb {
  href?: string;
  label: string;
}

/** Breadcrumb (Figma 1:1646): Body S, neutral.700, "/" separators, current page in neutral.950. */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="breadcrumb">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${c.label}-${i}`} className={last ? "breadcrumb-current" : undefined}>
              {c.href && !last ? (
                <Link href={c.href} className="crumb-link" title={c.label}>
                  {c.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} title={c.label}>
                  {c.label}
                </span>
              )}
              {!last && <span aria-hidden="true">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
