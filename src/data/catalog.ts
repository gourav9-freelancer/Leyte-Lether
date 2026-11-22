/*
 * Verified catalogue reference (supplied by Leyte Leather / approved Figma copy).
 *
 * Only facts confirmed by the business are recorded here: name, CAD price,
 * category grouping (from the approved homepage category copy) and whether
 * personalisation is offered (approved homepage copy: camera + guitar straps).
 * Do NOT add materials, dimensions, care, lead times, stock or ratings until
 * the business supplies them (README §12).
 *
 * The database is the authority for price and availability at runtime; this
 * file seeds it and supplies image metadata.
 */

export type CategoryId = "essentials" | "personalised" | "outdoor";

export interface ProductImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface CatalogProduct {
  slug: string;
  name: string;
  priceCents: number;
  category: CategoryId;
  personalisable: boolean;
  sortOrder: number;
  /** Image used on catalogue cards (as placed in the approved Figma homepage). */
  cardImage: ProductImage;
  /** Gallery images for the product page — only photographs that show this product. */
  gallery: ProductImage[];
}

export const CATEGORIES: { id: CategoryId; name: string; description: string }[] = [
  { id: "essentials", name: "Everyday Essentials", description: "Wallets, belts, and car key-fob covers." },
  { id: "personalised", name: "Personalised Gear", description: "Camera straps, guitar straps, and watch straps." },
  { id: "outdoor", name: "Lifestyle and Outdoor", description: "Dog harnesses and handcrafted axe sheaths." },
];

const img = (src: string, alt: string, width = 1536, height = 1024): ProductImage => ({
  src,
  alt,
  width,
  height,
});

const IMAGES = {
  walletCard: img("/images/products/bifold-wallet-card.jpg", "Leather bag and accessories photographed on a wooden workbench"),
  wallet: img("/images/products/bifold-wallet.jpg", "Classic leather bifold wallet shown closed and open on a wooden surface"),
  belt: img("/images/products/full-grain-belt.jpg", "Brown full-grain leather belt with a brass buckle, coiled on a table"),
  keyFobSet: img("/images/products/key-fob-set.jpg", "Leather car key fob cover beside a bifold wallet and belt"),
  cameraStraps: img("/images/products/camera-straps.jpg", "Leather camera straps in brown, black and green with a camera"),
  cameraStrapDetail: img("/images/products/camera-strap-detail.jpg", "Brown leather camera strap attached to a camera"),
  guitarStrap: img("/images/products/guitar-strap.jpg", "Brown leather guitar strap resting on an acoustic guitar"),
  watchStrap: img("/images/products/watch-strap.jpg", "Brown leather watch strap with stitched edges and a brass buckle"),
  dogHarness: img("/images/products/dog-harness.jpg", "Dog wearing a green leather harness beside other leather harnesses"),
  axeSheath: img("/images/products/axe-sheath.jpg", "Leather axe sheaths in brown, black and green beside an axe"),
  outdoor: img("/images/editorial/category-outdoor.jpg", "Leather dog harness and axe sheath outdoors"),
};

export const CATALOG: CatalogProduct[] = [
  {
    slug: "classic-leather-bifold-wallet",
    name: "Classic Leather Bifold Wallet",
    priceCents: 6000,
    category: "essentials",
    personalisable: false,
    sortOrder: 1,
    cardImage: IMAGES.walletCard,
    gallery: [IMAGES.wallet, IMAGES.keyFobSet],
  },
  {
    slug: "classic-full-grain-leather-belt",
    name: "Classic Full-Grain Leather Belt",
    priceCents: 6500,
    category: "essentials",
    personalisable: false,
    sortOrder: 2,
    cardImage: IMAGES.belt,
    gallery: [IMAGES.belt, IMAGES.keyFobSet],
  },
  {
    slug: "personalized-leather-camera-strap",
    name: "Personalized Leather Camera Strap",
    priceCents: 7500,
    category: "personalised",
    personalisable: true,
    sortOrder: 3,
    cardImage: IMAGES.cameraStraps,
    gallery: [IMAGES.cameraStrapDetail, IMAGES.cameraStraps],
  },
  {
    slug: "personalized-leather-guitar-strap",
    name: "Personalized Leather Guitar Strap",
    priceCents: 9000,
    category: "personalised",
    personalisable: true,
    sortOrder: 4,
    cardImage: IMAGES.guitarStrap,
    gallery: [IMAGES.guitarStrap],
  },
  {
    slug: "leather-car-key-fob-cover",
    name: "Leather Car Key Fob Cover",
    priceCents: 4000,
    category: "essentials",
    personalisable: false,
    sortOrder: 5,
    cardImage: IMAGES.keyFobSet,
    gallery: [IMAGES.keyFobSet],
  },
  {
    slug: "handmade-leather-watch-strap",
    name: "Handmade Leather Watch Strap",
    priceCents: 5500,
    category: "personalised",
    personalisable: false,
    sortOrder: 6,
    cardImage: IMAGES.watchStrap,
    gallery: [IMAGES.watchStrap],
  },
  {
    slug: "premium-leather-dog-harness",
    name: "Premium Leather Dog Harness",
    priceCents: 8500,
    category: "outdoor",
    personalisable: false,
    sortOrder: 7,
    cardImage: IMAGES.dogHarness,
    gallery: [IMAGES.dogHarness, IMAGES.outdoor],
  },
  {
    slug: "handcrafted-leather-axe-sheath",
    name: "Handcrafted Leather Axe Sheath",
    priceCents: 5500,
    category: "outdoor",
    personalisable: false,
    sortOrder: 8,
    cardImage: IMAGES.axeSheath,
    gallery: [IMAGES.axeSheath, IMAGES.outdoor],
  },
];

export function catalogEntry(slug: string): CatalogProduct | undefined {
  return CATALOG.find((p) => p.slug === slug);
}
