# Groovefolio Site

Public marketing/showcase site for **Groovefolio**, a local-first Android app for vinyl collectors.

Live site: `https://hunter-goller.github.io/Groovefolio-Site/`

This repository is intentionally separate from the Flutter application repository. It contains only the public product website and marketing assets.

## What is here

- Static HTML landing page
- One canonical stylesheet: `styles.css`
- One canonical JavaScript file: `script.js`
- Official Groovefolio branding copied from the app's approved branding assets
- Real development screenshots for Collection, Album Details, play logging, stats, Discogs search, and Discogs collection import
- Responsive desktop/mobile layouts
- Reduced-motion accessibility support
- GitHub Pages deployment through GitHub Actions
- `.nojekyll`

## Structure

```text
.
├── .github/workflows/pages.yml
├── .nojekyll
├── index.html
├── styles.css
├── script.js
└── assets/
    ├── branding/
    └── screenshots/
```

## Branding

The site uses the approved Groovefolio raster artwork from the Flutter app repository rather than the older hand-built website SVG approximations.

Primary brand colors:

- Warm paper: `#F7F4F0`
- Ink: `#171513`
- Groovefolio orange: `#D4622A`

## Screenshots

The current public screenshots come from a development build. The stylesheet masks the small Flutter DEBUG corner ribbon in the website frames. Replace the images with clean profile/release captures later; the layout does not need to change.

## Local preview

From the repository root:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Deployment

Push to `main`. The existing GitHub Actions workflow deploys the repository to GitHub Pages.

## Discogs notice

Groovefolio is not affiliated with Discogs. Discogs is a trademark of Zink Media, LLC.
