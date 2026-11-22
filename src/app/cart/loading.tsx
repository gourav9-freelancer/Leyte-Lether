import { RowSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="container" style={{ padding: "64px var(--gutter)" }}>
      <RowSkeleton count={2} label="Loading your cart" />
    </div>
  );
}
