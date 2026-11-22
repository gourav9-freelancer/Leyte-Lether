"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SelectField } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { CATEGORIES } from "@/data/catalog";
import { activeFilterCount, applyFilters, filtersToQuery, SORT_OPTIONS, type ShopFilters, type ShopProduct, type SortId } from "@/lib/shop";
import styles from "./shop.module.css";

interface Props {
  products: ShopProduct[];
  initial: ShopFilters;
}

export function ShopCatalogue({ products, initial }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState<ShopFilters>(initial);
  const [query, setQuery] = useState(initial.q);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState<ShopFilters>(initial);
  const [, startTransition] = useTransition();
  const lastSynced = useRef(filtersToQuery(initial));

  // Keep the URL in sync so filters persist when returning from a product page.
  useEffect(() => {
    const qs = filtersToQuery(filters);
    if (qs === lastSynced.current) return;
    lastSynced.current = qs;
    startTransition(() => router.replace(`${pathname}${qs}`, { scroll: false }));
  }, [filters, pathname, router]);

  // Adopt URL changes that came from elsewhere (e.g. header "Shop" link, category links).
  const initialQs = filtersToQuery(initial);
  useEffect(() => {
    if (initialQs === lastSynced.current) return;
    lastSynced.current = initialQs;
    setFilters(initial);
    setQuery(initial.q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQs]);

  // Debounce search input.
  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => (f.q === query ? f : { ...f, q: query })), 250);
    return () => clearTimeout(t);
  }, [query]);

  const results = useMemo(() => applyFilters([...products], filters), [products, filters]);
  const counts = useMemo(() => {
    const base = { ...filters, category: "all" as const };
    const within = applyFilters([...products], base);
    return {
      all: within.length,
      ...Object.fromEntries(CATEGORIES.map((c) => [c.id, within.filter((p) => p.category === c.id).length])),
    } as Record<string, number>;
  }, [products, filters]);
  const nActive = activeFilterCount(filters);
  const update = (patch: Partial<ShopFilters>) => setFilters((f) => ({ ...f, ...patch }));
  const clearAll = () => {
    setQuery("");
    setFilters({ q: "", category: "all", personalisable: false, sort: filters.sort });
  };

  const tabs = [{ id: "all" as const, name: "All products" }, ...CATEGORIES.map((c) => ({ id: c.id, name: c.name }))];

  return (
    <div className={`container ${styles.catalogue}`}>
      <div className={styles.tabs} role="group" aria-label="Product categories">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={styles.tab}
            aria-pressed={filters.category === t.id}
            onClick={() => update({ category: t.id })}
          >
            {t.name}
            <span className={`${styles.tabCount} ${styles.tabCountDesktop}`}>{counts[t.id] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.search} role="search">
            <label htmlFor="shop-search" className="visually-hidden">
              Search products
            </label>
            <Icon name="search" size={20} className={styles.searchIcon} />
            <input
              id="shop-search"
              type="search"
              className={styles.searchInput}
              placeholder="Search the collection"
              value={query}
              maxLength={80}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
            {query && (
              <button type="button" className={styles.clearSearch} onClick={() => setQuery("")} aria-label="Clear search">
                <Icon name="close" size={18} />
              </button>
            )}
          </div>
          <div className={styles.filterRow}>
            <Dialog.Root
              open={sheetOpen}
              onOpenChange={(o) => {
                if (o) setDraft(filters);
                setSheetOpen(o);
              }}
            >
              <Dialog.Trigger className={styles.filterButton}>
                <Icon name="tune" size={18} />
                Filters
                {nActive > 0 && (
                  <span className={styles.filterBadge} aria-label={`${nActive} active`}>
                    {nActive}
                  </span>
                )}
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className={styles.overlay} />
                <Dialog.Content className={styles.sheet} aria-describedby={undefined}>
                  <div className={styles.sheetHead}>
                    <Dialog.Title className={styles.sheetTitle}>Filter products</Dialog.Title>
                    <Dialog.Close className={styles.iconButton} aria-label="Close filters">
                      <Icon name="close" size={22} />
                    </Dialog.Close>
                  </div>
                  <div className={styles.sheetBody}>
                    <fieldset className={styles.fieldset}>
                      <legend className={styles.legend}>Category</legend>
                      {tabs.map((t) => (
                        <label key={t.id} className={styles.option}>
                          <input
                            type="radio"
                            name="category"
                            checked={draft.category === t.id}
                            onChange={() => setDraft((d) => ({ ...d, category: t.id }))}
                          />
                          {t.name}
                          <span className={styles.optionCount}>{counts[t.id] ?? 0}</span>
                        </label>
                      ))}
                    </fieldset>
                    <fieldset className={styles.fieldset}>
                      <legend className={styles.legend}>Options</legend>
                      <label className={styles.option}>
                        <input
                          type="checkbox"
                          checked={draft.personalisable}
                          onChange={(e) => setDraft((d) => ({ ...d, personalisable: e.target.checked }))}
                        />
                        Personalisation available
                      </label>
                    </fieldset>
                  </div>
                  <div className={styles.sheetFoot}>
                    <Button variant="secondary" onClick={() => setDraft({ ...draft, category: "all", personalisable: false })}>
                      Clear filters
                    </Button>
                    <Button
                      onClick={() => {
                        setFilters((f) => ({ ...f, category: draft.category, personalisable: draft.personalisable }));
                        setSheetOpen(false);
                      }}
                    >
                      Show results
                    </Button>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
            <div className={`${styles.sortWrap} ${styles.mobileSort}`}>
              <div className={styles.sortSelect}>
                <SelectField label="Sort products" hideLabel value={filters.sort} onChange={(e) => update({ sort: e.target.value as SortId })}>
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </SelectField>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.toolbarRight}>
          <p className={styles.count} aria-live="polite">
            Showing {results.length} {results.length === 1 ? "product" : "products"}
          </p>
          <div className="desktop-only">
           <div className={styles.sortWrap}>
            <span className={styles.sortLabel} aria-hidden="true">
              Sort by
            </span>
            <div className={styles.sortSelect}>
              <SelectField label="Sort products" hideLabel value={filters.sort} onChange={(e) => update({ sort: e.target.value as SortId })}>
                {SORT_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </SelectField>
            </div>
           </div>
          </div>
        </div>
      </div>

      {(nActive > 0 || filters.q) && (
        <div className={styles.activeChips} aria-label="Active filters">
          {filters.q && (
            <button type="button" className={styles.chip} onClick={() => setQuery("")} aria-label={`Remove search “${filters.q}”`}>
              “{filters.q}” <Icon name="close" size={14} />
            </button>
          )}
          {filters.category !== "all" && (
            <button type="button" className={styles.chip} onClick={() => update({ category: "all" })} aria-label="Remove category filter">
              {CATEGORIES.find((c) => c.id === filters.category)?.name} <Icon name="close" size={14} />
            </button>
          )}
          {filters.personalisable && (
            <button type="button" className={styles.chip} onClick={() => update({ personalisable: false })} aria-label="Remove personalisation filter">
              Personalisation available <Icon name="close" size={14} />
            </button>
          )}
          <Button variant="text" compact onClick={clearAll}>
            Clear all
          </Button>
        </div>
      )}

      {results.length > 0 ? (
        <ul className={styles.grid}>
          {results.map((p, i) => (
            <li key={p.slug}>
              <ProductCard
                slug={p.slug}
                name={p.name}
                priceCents={p.priceCents}
                image={p.image}
                personalisationBadge={p.personalisable}
                priority={i < 4}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.noResults}>
          <EmptyState
            icon="search"
            title="No products found."
            actions={
              <Button variant="secondary" onClick={clearAll}>
                View all products
              </Button>
            }
          >
            Try another search or explore the complete collection.
          </EmptyState>
        </div>
      )}
    </div>
  );
}
