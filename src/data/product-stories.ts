/*
 * Hover-card editorial copy for product cards.
 *
 * Every statement here restates something the business already approved on the
 * site (homepage + about copy): full-grain leather chosen for natural grain,
 * built one piece at a time in Sudbury, clean stitching, finished edges and
 * hardware selection, and personalisation on the camera and guitar straps.
 * Do NOT add dimensions, care, lead times or other unconfirmed facts (README §12).
 */
import type { CategoryId } from "./catalog";

export interface ProductStory {
  tagline: string;
  story: string;
  quality: string[];
}

export const CATEGORY_LABEL: Record<CategoryId, string> = {
  essentials: "Everyday Essentials",
  personalised: "Personalised Gear",
  outdoor: "Lifestyle & Outdoor",
};

/** The workshop process every piece follows (approved craftsmanship copy). */
export const CRAFT_PROCESS = ["Select the hide", "Cut & stitch", "Finish the edges"] as const;

const STORIES: Record<string, ProductStory> = {
  "classic-leather-bifold-wallet": {
    tagline: "The everyday essential.",
    story: "A classic bifold built one piece at a time in our Sudbury workshop, with clean stitching and finished edges.",
    quality: ["Full-grain leather", "Clean stitching", "Finished edges"],
  },
  "classic-full-grain-leather-belt": {
    tagline: "Built around the buckle.",
    story: "Full-grain leather chosen for its natural grain, paired with carefully selected hardware and finished by hand.",
    quality: ["Full-grain leather", "Selected hardware", "Finished edges"],
  },
  "personalized-leather-camera-strap": {
    tagline: "Unmistakably yours.",
    story: "A camera strap made to carry every day — and available with personalisation so the piece is yours alone.",
    quality: ["Personalisation available", "Full-grain leather", "Clean stitching"],
  },
  "personalized-leather-guitar-strap": {
    tagline: "Made for the stage and the studio.",
    story: "Cut and stitched one piece at a time, and offered with personalisation for a strap that is unmistakably yours.",
    quality: ["Personalisation available", "Full-grain leather", "Finished edges"],
  },
  "leather-car-key-fob-cover": {
    tagline: "Small piece, same care.",
    story: "A key-fob cover given the same attention as every larger piece: natural grain, clean stitching, finished edges.",
    quality: ["Full-grain leather", "Clean stitching", "Handcrafted in Sudbury"],
  },
  "handmade-leather-watch-strap": {
    tagline: "Character on the wrist.",
    story: "A handmade watch strap with stitched edges, selected hardware and the tactile finish of full-grain leather.",
    quality: ["Full-grain leather", "Stitched edges", "Selected hardware"],
  },
  "premium-leather-dog-harness": {
    tagline: "For the walk ahead.",
    story: "A leather harness for everyday outings, built one piece at a time with attention to stitching and hardware.",
    quality: ["Full-grain leather", "Selected hardware", "Handcrafted in Sudbury"],
  },
  "handcrafted-leather-axe-sheath": {
    tagline: "Made for the outdoors.",
    story: "A handcrafted sheath shaped and stitched in our workshop, with finished edges built for life outside.",
    quality: ["Full-grain leather", "Clean stitching", "Finished edges"],
  },
};

const FALLBACK: ProductStory = {
  tagline: "Made by hand.",
  story: "Built one piece at a time in our Sudbury workshop, with attention to grain, stitching, finished edges and hardware.",
  quality: ["Full-grain leather", "Clean stitching", "Handcrafted in Sudbury"],
};

export function productStory(slug: string): ProductStory {
  return STORIES[slug] ?? FALLBACK;
}
