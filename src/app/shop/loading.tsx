import { ProductGridSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <>
      <div style={{ background: "var(--color-brand-espresso)", height: 249 }} aria-hidden="true" />
      <div className="container" style={{ padding: "48px var(--gutter)" }}>
        <ProductGridSkeleton count={8} label="Loading products" />
      </div>
    </>
  );
}
