# Leyte Leather --- Global Design System

**Version:** 1.0\
**Purpose:** Single source of truth for designing and building every
page and component of the Leyte Leather website in Google Stitch and
subsequent implementation.

------------------------------------------------------------------------

## 1. Brand foundation

### Brand

**Leyte Leather** is a handcrafted leather-goods brand presenting
products made one piece at a time in Sudbury, Ontario, Canada. Its
catalogue includes wallets, belts, camera straps, watch straps, guitar
straps, dog harnesses, axe sheaths and car key-fob covers. The business
also accepts bespoke custom-order requests.

### Brand positioning

**Modern artisan craftsmanship.** The experience should feel like
entering a considered leather workshop with the confidence and
convenience of a premium contemporary online store.

### Brand attributes

-   **Craft-led:** material, construction, detail and human skill are
    central.
-   **Warm:** natural, tactile, welcoming and grounded.
-   **Honest:** clear product details, accurate options, transparent
    pricing and realistic claims.
-   **Durable:** timeless rather than trend-driven.
-   **Personal:** customisation and made-to-order work feel
    approachable.
-   **Refined:** premium through restraint, not visual luxury clichés.

### Experience principles

1.  Let the leather and the product photography do the selling.
2.  Make craftsmanship tangible through close-up imagery and specific
    product information.
3.  Keep shopping clear, calm and frictionless.
4.  Make custom work feel like a guided conversation, not a complicated
    application.
5.  Use a consistent design language across every page, state and
    breakpoint.
6.  Never invent product specifications, materials, guarantees, delivery
    promises, reviews or business claims. Show only verified content
    supplied by the business.

### Brand voice

Use clear, confident, warm and practical language. Prefer short
sentences and specific descriptions. Avoid exaggerated claims such as
"the world's best," "unbreakable," or "lifetime quality" unless the
business can substantiate them.

------------------------------------------------------------------------

## 2. Visual direction

### Design concept: Contemporary Leather Atelier

A warm, editorial storefront combining: - Natural parchment and warm
ivory surfaces. - Deep espresso typography and navigation. - Saddle and
cognac leather accents. - Muted antique brass for small highlights. -
Rich, authentic product photography. - Generous whitespace and
disciplined layouts.

The site should feel **premium, tactile and approachable**, not rustic,
western, industrial, or like a generic Shopify template.

### Visual balance

Use light surfaces as the primary shopping environment. Introduce dark
espresso sections selectively for high-impact moments such as the hero,
craftsmanship story, custom-order callout or footer. Do not make every
section dark.

Recommended visual distribution: - 65--75% warm light surfaces. -
15--25% dark espresso surfaces. - 5--10% leather and brass accents.

These are directional proportions, not rigid page quotas.

### Avoid

-   Bright orange, saturated yellow, neon colours or generic tech blues.
-   Excessive gradients, glassmorphism, glowing effects or heavy blur.
-   Fake leather textures behind text or across large page backgrounds.
-   Decorative western fonts, cowboy motifs, distressed effects or fake
    stitching borders.
-   Too many pill-shaped cards and buttons.
-   Dense layouts, excessive borders, repeated shadows or unnecessary
    badges.
-   Stock imagery that does not represent the actual products or
    workshop.

------------------------------------------------------------------------

## 3. Colour system

Use the following tokens consistently. Do not invent one-off colours in
individual screens.

### Core brand palette

  -----------------------------------------------------------------------
  Token                   Hex                     Role
  ----------------------- ----------------------- -----------------------
  `brand.espresso`        `#2B1D17`               Primary brand dark,
                                                  headings on light
                                                  surfaces, dark sections

  `brand.dark`            `#1D1511`               Deepest backgrounds,
                                                  footer and
                                                  high-contrast areas

  `brand.saddle`          `#8A5136`               Primary brand accent,
                                                  links and selected
                                                  emphasis

  `brand.cognac`          `#B87345`               Secondary leather
                                                  accent, restrained
                                                  highlights

  `brand.brass`           `#A88752`               Small premium details,
                                                  icons and decorative
                                                  accents

  `brand.cream`           `#F7F2EA`               Main page background

  `brand.parchment`       `#EEE5D8`               Secondary warm surface

  `brand.white`           `#FFFCF8`               Cards, drawers and
                                                  elevated light surfaces
  -----------------------------------------------------------------------

### Neutral palette

  Token           Hex         Role
  --------------- ----------- --------------------------
  `neutral.950`   `#211A16`   Main text
  `neutral.800`   `#40352E`   Secondary headings
  `neutral.700`   `#5C5048`   Body copy
  `neutral.600`   `#756960`   Secondary text
  `neutral.500`   `#91877E`   Muted text, placeholders
  `neutral.300`   `#D8CEC2`   Borders and dividers
  `neutral.200`   `#E7DED3`   Subtle borders
  `neutral.100`   `#F1EBE3`   Muted surface
  `neutral.50`    `#FAF7F2`   Softest neutral surface

### Semantic colours

  -----------------------------------------------------------------------
  Token                   Hex                     Usage
  ----------------------- ----------------------- -----------------------
  `semantic.success`      `#356447`               Successful actions and
                                                  confirmations

  `semantic.success-bg`   `#EAF2EC`               Success message
                                                  background

  `semantic.warning`      `#94621F`               Caution and pending
                                                  states

  `semantic.warning-bg`   `#F8F0E2`               Warning background

  `semantic.error`        `#A33E32`               Errors and destructive
                                                  actions

  `semantic.error-bg`     `#F8EAE7`               Error background

  `semantic.info`         `#4F6470`               Informational messages

  `semantic.info-bg`      `#EAF0F2`               Informational
                                                  background
  -----------------------------------------------------------------------

### Colour application rules

-   Main page background: `brand.cream`.
-   Product cards and form surfaces: `brand.white`.
-   Primary text: `neutral.950`.
-   Body text: `neutral.700`.
-   Primary buttons: `brand.espresso` with `brand.white` text.
-   Secondary buttons: transparent or `brand.white`, with
    `brand.espresso` text and `neutral.300` border.
-   Links and selected controls: `brand.saddle`.
-   Brass is an accent only; never use it for long text or large fills.
-   Dark sections: `brand.espresso` or `brand.dark`, with warm-white
    text.
-   Use `brand.parchment` for subtle section changes rather than adding
    arbitrary grey backgrounds.

### Contrast and accessibility

-   Meet WCAG 2.2 AA contrast: 4.5:1 for normal text and 3:1 for large
    text and meaningful UI graphics.
-   Never use colour alone to communicate errors, selection,
    availability or status.
-   Verify every foreground/background pairing before implementation. If
    a colour pairing fails contrast, use a darker text or lighter
    surface rather than reducing legibility.

------------------------------------------------------------------------

## 4. Typography

### Font families

Use two complementary families:

**Display and editorial headings:** `Cormorant Garamond`\
- Use for hero headlines, major section headings and selected editorial
statements. - Prefer weights 500 and 600. - Use sentence case; avoid
all-caps display headings.

**UI and body:** `DM Sans`\
- Use for body copy, navigation, product names, prices, forms, buttons,
labels and utility text. - Use weights 400, 500, 600 and 700.

Fallbacks: - Display: `Georgia, "Times New Roman", serif`. - UI:
`Arial, Helvetica, sans-serif`.

Load fonts from a reliable font provider or self-host them. Avoid
introducing additional font families.

### Type scale

  -----------------------------------------------------------------------
  Style       Font         Desktop size /   Mobile size /          Weight
                              line height     line height 
  ----------- ----------- --------------- --------------- ---------------
  Display XL  Cormorant         64 / 1.02       44 / 1.05             500
              Garamond                                    

  Display L   Cormorant         56 / 1.05       40 / 1.08             500
              Garamond                                    

  H1          Cormorant         48 / 1.08        36 / 1.1             600
              Garamond                                    

  H2          Cormorant         40 / 1.12       32 / 1.15             600
              Garamond                                    

  H3          Cormorant         32 / 1.15        27 / 1.2             600
              Garamond                                    

  H4          DM Sans            22 / 1.3        20 / 1.3             600

  Body L      DM Sans           18 / 1.65        17 / 1.6             400

  Body        DM Sans            16 / 1.6        16 / 1.6             400

  Body S      DM Sans            14 / 1.5        14 / 1.5             400

  Label       DM Sans            12 / 1.4        12 / 1.4             600

  Button      DM Sans            14 / 1.2        14 / 1.2             600

  Price       DM Sans            16 / 1.3        16 / 1.3             600
  -----------------------------------------------------------------------

Sizes are in CSS pixels. Use fluid sizing only within these ranges; do
not create a new type scale per page.

### Typography rules

-   Use Cormorant Garamond sparingly for expressive, brand-defining
    moments.
-   Use DM Sans for all functional and transactional information.
-   Body text should remain easy to scan, with a comfortable line length
    of approximately 55--75 characters.
-   Use sentence case for navigation, buttons and labels.
-   Use uppercase only for short eyebrow labels, with restrained letter
    spacing.
-   Do not use thin font weights for small text.
-   Prices must be easy to find and visually subordinate only to the
    product name or primary product action.

------------------------------------------------------------------------

## 5. Layout and grid

### Breakpoints

Use these responsive breakpoints consistently:

  Name                         Width
  -------------- -------------------
  Mobile                   0--639 px
  Tablet                 640--899 px
  Desktop               900--1199 px
  Wide desktop     1200 px and above

### Container widths

-   Main content max width: `1280px`.
-   Wide editorial / hero max width: `1360px`.
-   Reading content max width: `720px`.
-   Form content max width: `760px`.
-   Product detail content max width: `1280px`.
-   Centre content horizontally and maintain consistent side gutters.

### Page gutters

-   Mobile: 20px.
-   Tablet: 32px.
-   Desktop: 48px.
-   Wide desktop: 64px, capped by the container width.

### Grid

-   Product catalogue: 4 columns on wide desktop, 3 on standard desktop,
    2 on tablet, 2 on mobile where product imagery remains legible; use
    1 column only when the viewport or content requires it.
-   Product detail: 2-column layout on desktop (gallery and purchase
    panel); stacked on mobile.
-   Editorial sections: use a balanced 2-column layout when imagery and
    copy are paired.
-   Forms: single-column on mobile; use two columns only for short,
    related fields where it improves completion.

### Spacing scale

Use a 4px base unit. Only use values from this scale unless a documented
layout need requires otherwise.

  Token          Value
  ------------ -------
  `space.1`        4px
  `space.2`        8px
  `space.3`       12px
  `space.4`       16px
  `space.5`       20px
  `space.6`       24px
  `space.8`       32px
  `space.10`      40px
  `space.12`      48px
  `space.16`      64px
  `space.20`      80px
  `space.24`      96px
  `space.30`     120px

Use 16px as the standard internal spacing between related UI elements.
Use larger spacing to establish section hierarchy, not extra borders.

------------------------------------------------------------------------

## 6. Shape, borders and elevation

### Radius tokens

  Token             Value Usage
  --------------- ------- ----------------------------------
  `radius.sm`         4px Small controls, tags
  `radius.md`         8px Inputs, buttons, compact cards
  `radius.lg`        12px Product cards, panels
  `radius.xl`        16px Larger feature panels
  `radius.2xl`       20px Large editorial image containers
  `radius.pill`     999px Small status chips only

Use restrained, slightly rounded geometry. Do not make every card or
button pill-shaped.

### Border tokens

-   Default: `1px solid #E7DED3`.
-   Strong: `1px solid #D8CEC2`.
-   Focus: `2px solid #8A5136`, with a visible offset where appropriate.
-   Dividers: `1px solid #E7DED3`.

Avoid dark borders around every card. Prefer whitespace and subtle
surface contrast.

### Shadows

-   `shadow.sm`: `0 1px 3px rgba(43, 29, 23, 0.06)`.
-   `shadow.md`: `0 6px 20px rgba(43, 29, 23, 0.08)`.
-   `shadow.lg`: `0 14px 36px rgba(43, 29, 23, 0.12)`.

Use shadows sparingly for dropdowns, drawers and overlays. Product cards
should primarily rely on image quality, spacing and subtle borders.

------------------------------------------------------------------------

## 7. Imagery and art direction

Photography is one of the most important parts of this brand system.

### Product photography

-   Use actual product photographs supplied by Leyte Leather wherever
    available.
-   Show the complete product clearly against a quiet, neutral
    background.
-   Include detail images showing grain, edges, stitching, hardware,
    closures and finish.
-   Keep image treatment consistent across catalogue cards.
-   Use a consistent crop ratio within each product grid.
-   Do not stretch, distort, recolour or artificially modify product
    images.
-   Do not replace actual products with AI-generated approximations.

### Lifestyle and workshop photography

Use authentic imagery of: - Leather being cut, shaped and stitched. -
Hands working with leather tools. - Close-up material and construction
details. - Finished goods in realistic everyday settings. - The maker's
workshop, when real photographs are available.

### Image treatment

-   Warm, natural lighting.
-   True-to-life leather colours.
-   Subtle contrast and restrained editing.
-   Natural shadows and tactile detail.
-   Neutral cream, wood, stone or workshop backgrounds.
-   Avoid oversaturated orange/brown filters.

### Image ratios

-   Catalogue cards: 4:5.
-   Product gallery: 4:5 or 1:1, consistent within a gallery.
-   Hero editorial photography: 3:2 or 16:9 depending on composition.
-   Detail thumbnails: 1:1.
-   Gallery masonry: may vary only if the actual photographs support it.

### Missing imagery

If a real image is unavailable, use a neutral branded placeholder and
label it appropriately in the content workflow. Never fabricate a
product photograph or imply that a generated image depicts the actual
item.

------------------------------------------------------------------------

## 8. Core component system

Every page must use the same shared components and token values.

### Announcement bar

-   Background: `brand.espresso`.
-   Text: `brand.cream`.
-   Compact height and readable text.
-   Communicate only verified information, such as handcrafted in
    Sudbury, full-grain leather or custom orders welcome.
-   Avoid rotating messages that distract from shopping.

### Header and navigation

-   Warm light background.
-   Brand wordmark at left.
-   Main navigation: Shop, Custom Orders, Gallery, About.
-   Account and cart utilities on the right.
-   Sticky header may be used if it does not consume excessive vertical
    space.
-   Mobile: compact header with accessible menu and clearly visible
    cart.
-   Active navigation uses a restrained saddle accent or underline.
-   Keep header geometry identical across all pages.

### Buttons

**Primary** - Background: `brand.espresso`. - Text: `brand.white`. -
Radius: `radius.md`. - Height: 48px standard; 44px compact. - Hover:
slightly lighter espresso or saddle, with smooth transition.

**Secondary** - Background: transparent or `brand.white`. - Text:
`brand.espresso`. - Border: `neutral.300`. - Hover: `brand.parchment`.

**Text button** - No filled background. - Use `brand.saddle` or
`brand.espresso`. - Underline or subtle arrow only where it improves
clarity.

All buttons need hover, focus-visible, pressed, disabled and loading
states. Use clear action labels such as "Add to cart," "View product"
and "Request a custom piece."

### Product cards

-   White / warm-white surface.
-   Product image first, with consistent 4:5 ratio.
-   Product name in DM Sans 500 or 600.
-   Price clearly visible.
-   Optional short descriptor only when it adds real information.
-   Keep product card heights and text alignment consistent.
-   Hover may gently reveal a secondary action or apply a subtle image
    zoom.
-   Do not invent sale badges, ratings, stock status or product claims.

### Product detail gallery

-   Large primary image with thumbnail navigation.
-   Accessible previous/next controls.
-   Zoom or lightbox only if it works well on touch and keyboard.
-   Preserve the natural product image colour and proportions.
-   Provide meaningful alt text.

### Product purchase panel

-   Product title, price, verified description and available options.
-   Clearly label required and optional selections.
-   Quantity selector with accessible controls.
-   Primary add-to-cart action.
-   Clear validation and cart confirmation.
-   Show shipping, returns and lead-time details only when verified.
-   Do not imply that a standard catalogue item is custom-made unless
    its product information says so.

### Form fields

-   Label always visible above the field.
-   Input height: 48--52px.
-   Background: `brand.white`.
-   Border: `neutral.300`.
-   Radius: `radius.md`.
-   Focus: 2px `brand.saddle` outline or border with visible focus
    indication.
-   Error message directly below the relevant field.
-   Required and optional states clearly identified.
-   Never rely on placeholder text as the only label.

### Selects, checkboxes and radios

-   Match the input height, border and radius system.
-   Provide a minimum 44px interaction area.
-   Selected state: saddle accent with sufficient contrast.
-   Provide visible keyboard focus.
-   Explain unavailable options rather than silently disabling them.

### Cards and content panels

-   Use `brand.white` on `brand.cream` or `brand.parchment`.
-   Border: subtle neutral border.
-   Radius: 12px by default.
-   Avoid excessive nested cards.
-   Use consistent internal padding: 20--24px desktop, 16--20px mobile.

### Badges and tags

-   Use sparingly for factual labels such as "Made to order" or
    "Personalisation available," only where verified.
-   Background: `brand.parchment`.
-   Text: `brand.espresso`.
-   Small radius; avoid bright colours.

### Alerts and feedback

-   Use semantic tokens for success, warning, error and information.
-   Include a text label or icon, not colour alone.
-   Keep messages close to the action that caused them.
-   Provide actionable recovery guidance for errors.

### Footer

-   Espresso background.
-   Warm-white text.
-   Brand description and navigation grouped consistently.
-   Include contact, policy and social links only when verified and
    available.
-   Keep spacing, typography and link hover behaviour consistent across
    pages.

------------------------------------------------------------------------

## 9. Interaction and motion

### Motion principles

Motion should feel quiet, deliberate and tactile. It should support
comprehension, not become decoration.

-   Standard transition: 180--240ms.
-   Ease: `cubic-bezier(0.2, 0, 0, 1)`.
-   Small hover transitions: colour, border, opacity or a 1--2px lift.
-   Product image hover: subtle scale up to 1.02, only when it does not
    cause layout shift.
-   Drawers and dialogs: smooth, short entrance and exit.
-   Avoid parallax, constant animation, bouncing elements and
    scroll-jacking.

Respect `prefers-reduced-motion`. Provide immediate state changes when
reduced motion is enabled.

### Interaction states

Every interactive component must define: - Default. - Hover. -
Focus-visible. - Active / pressed. - Disabled. - Loading, where
applicable. - Success or error feedback, where applicable.

### Accessibility

-   Semantic HTML and logical heading hierarchy.
-   Keyboard-operable navigation, menus, dialogs, galleries and forms.
-   Visible focus indicators.
-   Descriptive accessible names for icon-only controls.
-   Labels associated with every form control.
-   Error messages announced accessibly.
-   Alt text for meaningful images; decorative images use empty alt
    text.
-   Do not communicate meaning through colour alone.
-   Touch targets at least 44 × 44px where practical.
-   Maintain WCAG 2.2 AA contrast.

------------------------------------------------------------------------

## 10. Responsive behaviour

### Mobile-first rules

-   Design for narrow screens first, then expand.
-   Keep body text at 16px or above for primary reading.
-   Avoid horizontal overflow.
-   Stack complex columns vertically.
-   Make product images large enough to inspect.
-   Keep add-to-cart and key form actions easy to reach.
-   Use full-width primary actions when appropriate.
-   Use a mobile navigation drawer with clear close behaviour.
-   Keep form labels and validation visible.
-   Do not shrink desktop layouts into mobile; recompose them.

### Tablet

-   Use two-column product grids.
-   Keep editorial layouts balanced.
-   Avoid narrow sidebars beside dense product content.

### Desktop

-   Use the full container and grid system.
-   Preserve generous whitespace.
-   Keep product detail purchase information visible without crowding
    the gallery.

------------------------------------------------------------------------

## 11. Page-level design rules

The global system applies to every page. Page layouts may differ, but
they must not create new visual languages.

### Homepage

-   Lead with a strong brand statement and a real product/workshop
    image.
-   Show the brand's craft and material proposition.
-   Provide a clear route to shop and custom orders.
-   Feature a curated selection of actual catalogue products.
-   Include craftsmanship and brand-story sections.
-   Finish with a clear custom-order or shopping CTA.

### Shop / catalogue

-   Consistent product grid and card system.
-   Clear category filtering.
-   Product count only if accurate.
-   Sorting and filtering must work, not appear decorative.
-   Preserve filters when navigating back from a product where possible.
-   Provide clear empty and no-results states.

### Product detail

-   Prioritise product imagery and purchase clarity.
-   Show accurate product description, options and price.
-   Explain personalisation only when supported by the actual product.
-   Include related products only when genuinely relevant.
-   Do not invent specifications, dimensions, leather grades, care
    instructions or delivery times.

### Custom orders

-   Explain the request and quotation process in plain language.
-   Use a calm, guided form with clear progress and field grouping.
-   Group contact details, item specifications, budget/deadline and
    reference uploads logically.
-   State the maximum of five reference images where applicable.
-   Explain what happens after submission.
-   Show validation, upload progress, success and failure states.
-   Do not promise quote response times unless confirmed by the
    business.

### Gallery

-   Use authentic product and process photographs.
-   Provide a consistent image grid and useful captions where verified.
-   Do not fill gaps with unrelated stock imagery.

### About

-   Tell the actual company story using verified facts.
-   Use authentic workshop and maker imagery when available.
-   Explain the craft and approach without inventing founder history or
    credentials.

### Account, login and cart

-   Reuse the same form, button, alert and layout components.
-   Keep transactional actions clear and predictable.
-   Provide empty, loading, error and success states.
-   Never hide important order totals, shipping costs or validation
    messages.

------------------------------------------------------------------------

## 12. Content and commerce integrity

The design must never create unsupported business claims.

Do not invent: - Product materials beyond the supplied product
specification. - Product dimensions, weight or compatibility. - Handmade
process details not confirmed by the maker. - Warranty, repair or
lifetime guarantees. - Shipping costs, shipping regions or delivery
dates. - Return, exchange or refund conditions. - Customer reviews,
ratings or testimonials. - Inventory, scarcity or "best seller"
status. - Workshop, founder or company history. - Certifications or
sustainability claims.

When information is missing, use a neutral placeholder in the design
specification and flag it for the business to confirm. Do not publish
placeholder copy as fact.

Display CAD currency consistently. Format prices as `CA$40.00` or
`CAD $40.00` according to the final commerce convention; choose one
format and use it everywhere.

------------------------------------------------------------------------

## 13. Design tokens --- implementation reference

Use these as the canonical CSS custom properties. Components should
reference tokens rather than hard-coded values.

``` css
:root {
  /* Brand */
  --color-brand-espresso: #2B1D17;
  --color-brand-dark: #1D1511;
  --color-brand-saddle: #8A5136;
  --color-brand-cognac: #B87345;
  --color-brand-brass: #A88752;
  --color-brand-cream: #F7F2EA;
  --color-brand-parchment: #EEE5D8;
  --color-brand-white: #FFFCF8;

  /* Neutral */
  --color-neutral-950: #211A16;
  --color-neutral-800: #40352E;
  --color-neutral-700: #5C5048;
  --color-neutral-600: #756960;
  --color-neutral-500: #91877E;
  --color-neutral-300: #D8CEC2;
  --color-neutral-200: #E7DED3;
  --color-neutral-100: #F1EBE3;
  --color-neutral-50: #FAF7F2;

  /* Semantic */
  --color-success: #356447;
  --color-success-bg: #EAF2EC;
  --color-warning: #94621F;
  --color-warning-bg: #F8F0E2;
  --color-error: #A33E32;
  --color-error-bg: #F8EAE7;
  --color-info: #4F6470;
  --color-info-bg: #EAF0F2;

  /* Typography */
  --font-display: "Cormorant Garamond", Georgia, serif;
  --font-ui: "DM Sans", Arial, sans-serif;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
  --space-30: 120px;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 20px;
  --radius-pill: 999px;

  /* Borders and shadows */
  --border-subtle: 1px solid var(--color-neutral-200);
  --border-default: 1px solid var(--color-neutral-300);
  --shadow-sm: 0 1px 3px rgba(43, 29, 23, 0.06);
  --shadow-md: 0 6px 20px rgba(43, 29, 23, 0.08);
  --shadow-lg: 0 14px 36px rgba(43, 29, 23, 0.12);

  /* Layout */
  --container-main: 1280px;
  --container-wide: 1360px;
  --container-reading: 720px;
  --container-form: 760px;

  /* Motion */
  --motion-fast: 180ms;
  --motion-standard: 220ms;
  --motion-ease: cubic-bezier(0.2, 0, 0, 1);
}
```

------------------------------------------------------------------------

## 14. Mandatory instructions for Google Stitch

Treat this README as the **global design-system source of truth** for
every Leyte Leather screen.

1.  Read and apply this entire design system before generating any
    screen.
2.  Reuse the exact colour, typography, spacing, radius, border, shadow
    and layout tokens.
3.  Maintain the same header, navigation, footer, buttons, product
    cards, form fields and interaction patterns across all pages.
4.  Do not invent a new palette, font family, spacing scale or component
    style for an individual prompt.
5.  Do not redesign shared components differently from screen to screen.
6.  Use the same visual identity on desktop, tablet and mobile, adapting
    layout rather than changing the brand.
7.  Keep the interface premium, warm, editorial, tactile and
    commerce-focused.
8.  Use real supplied product images and verified product information.
    Do not generate fake product photography.
9.  Use dark espresso sections selectively and warm light surfaces for
    comfortable shopping.
10. Prioritise clarity, product imagery, accessibility, trust and
    conversion over decorative effects.
11. When a screen requires a component not specified here, extend the
    system using the existing tokens and principles. Do not introduce
    unrelated visual styles.
12. If a prompt conflicts with this README, preserve the global design
    system unless the user explicitly approves a system-wide change.

### Required output quality for every Stitch screen

-   Production-quality visual hierarchy.
-   Consistent desktop and mobile layouts.
-   Realistic product and content density.
-   Clear primary and secondary actions.
-   Complete default, hover, focus, active, disabled, loading, empty,
    error and success states wherever relevant.
-   Accessible contrast and touch targets.
-   Consistent alignment, spacing and typography.
-   No arbitrary visual experimentation that breaks brand consistency.

------------------------------------------------------------------------

## 15. Design-system change control

This system is global. A change to a core token or shared component must
be treated as a system-wide change.

When proposing a change: 1. Identify the token or component being
changed. 2. Explain why the change improves the brand or usability. 3.
Identify every affected page and component. 4. Apply the change
consistently across the entire website. 5. Update this README so it
remains the single source of truth.

**Final principle:** Every page should look like it belongs to the same
Leyte Leather experience. The products and craftsmanship should be the
visual focus; the design system should make them feel more valuable
without competing for attention.
