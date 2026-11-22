import { Button } from "@/components/ui/Button";
import { ErrorPage } from "@/components/ui/ErrorState";

/**
 * Product Unavailable — Figma Global System States, Part C. Shown when a catalogue
 * product has been hidden by the business. No reason (sold out, discontinued…) is
 * stated because none is recorded.
 */
export function ProductUnavailable({ name }: { name: string }) {
  return (
    <ErrorPage
      pill="Product unavailable"
      icon="inventory_2"
      tone="warning"
      title="This piece isn't available right now."
      actions={
        <>
          <Button href="/shop">Explore the Collection</Button>
          <Button href="/custom-orders" variant="secondary">
            Request a custom piece
          </Button>
        </>
      }
    >
      {name} is not currently available to order. Explore the rest of the collection, or tell us what you have in mind.
    </ErrorPage>
  );
}
