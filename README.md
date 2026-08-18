# Groovefolio Site

Marketing/showcase site for Groovefolio, a local-first vinyl collection and listening-history Android app.

## Purpose

This repository contains the public Groovefolio product website. It is intentionally separate from the Flutter application repository so the app itself can remain private later without affecting the public GitHub Pages site.

The website is a product showcase, not a web version of Groovefolio.

## Included

- Responsive static landing page
- Groovefolio-styled SVG mark and wordmark
- Real Groovefolio development screenshots
- Collection, album detail, play logging, stats, Discogs search, and Discogs collection-import showcases
- Sticky “How it works” product story
- Discogs import workflow sequence
- Listening-focused product differentiator section
- Future Shelf Coverage analytics concept
- Local-first product explanation
- Product roadmap
- Google Play “Coming Soon” CTA
- Mobile navigation and reduced-motion support
- GitHub Pages deployment workflow
- No framework or build step required

## Tech

- HTML
- CSS
- Vanilla JavaScript
- GitHub Actions Pages deployment
- `.nojekyll`

## V4 assets

Current V4 screenshot assets include:

- `assets/screenshots/collection-most-played.jpg`
- `assets/screenshots/album-details.jpg`
- `assets/screenshots/log-play.jpg`
- `assets/screenshots/stats-overview.jpg`
- `assets/screenshots/stats-listening.jpg`
- `assets/screenshots/discogs-search-current.jpg`
- `assets/screenshots/discogs-import-review.jpg`
- `assets/screenshots/discogs-importing.jpg`
- `assets/screenshots/discogs-import-complete.jpg`

The current captures come from a development build. `styles-v4.css` masks only the small Flutter DEBUG ribbon in the screenshots. Replace these images with clean profile/release-build captures when final marketing screenshots are available; the layout does not need to change.

## Branding

- Warm paper: `#F7F4F0`
- Ink: `#171513`
- Groovefolio orange: `#D4622A`

The site currently uses the existing site SVG interpretation of the Groovefolio mark. Replace the site SVG/favicon with the exact master assets from the Android app when those exports are copied into this repository.

## Deployment

Push changes to `main`. The existing GitHub Actions Pages workflow deploys the site automatically.

Live site:

`https://hunter-goller.github.io/Groovefolio-Site/`

## Local preview

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Notes

Groovefolio is not affiliated with Discogs. Discogs is a trademark of Zink Media, LLC.
