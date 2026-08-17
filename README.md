# GTA VI-inspired Vanilla HTML/CSS/JS Study

Open `index.html` directly or serve the folder with any static web server.

## Current story-section behavior

- Hero section is unchanged.
- Story heading uses a dedicated condensed display face and locked four-line composition.
- `#storySequence` is a sticky multi-stage scroll scene.
- Stage 1: the two story visual cards rise into position.
- Stage 2: the Vice City story text card rises from the bottom and fully covers the visual cards.
- Stage 3: People & Places rises from below and covers the text card.
- Stage 4: Media & Artwork rises from below and covers People & Places.
- Scroll transforms are driven with `requestAnimationFrame` and respect `prefers-reduced-motion`.

## Files

- `index.html` — structure
- `styles.css` — layout, responsive styling, story stack
- `script.js` — scroll animation, menu, modal, interactions
- `assets/` — local poster artwork used by the demo

This is a fan-made front-end study. Replace third-party artwork and branding before production/commercial use.

## Product page

A dedicated `product.html` page is included for **Collectible Box — ₹9,999**.

Homepage commerce CTAs now route to `product.html`. The product page includes a responsive gallery, quantity selector, add-to-cart drawer, Buy Now interaction, product details, What's Inside cards, specifications, FAQ, and mobile navigation.
