# Groovefolio Site

Public marketing/showcase site for **Groovefolio**, a local-first Android app for vinyl collectors.

**Live site:** `https://groovefolio.app/`

This repository is intentionally separate from the Flutter app repository. It contains only the public website and web-optimized product assets.

## 2026 redesign

The homepage was rebuilt from scratch around the real Groovefolio Android screens rather than incrementally patching the previous layout.

Design goals:

- no sticky-scroll sections that create large empty gaps
- one consistent phone-frame system for every app screenshot
- stronger desktop composition without sacrificing mobile
- fewer repetitive screenshots
- clearer separation between current features and future roadmap items
- restrained orange, warm paper, dark listening sections, and vinyl-inspired physical details
- static HTML/CSS/vanilla JS with progressive enhancement and reduced-motion support

## Current product story shown on the site

- local-first collection management
- artwork, genres, release metadata, and side-grouped tracklists
- manual full-album / Side A / Side B play logging with editable date and time
- current-year and all-time listening stats
- Discogs exact-release search/autofill, barcode lookup, connected collection import, and tracklists
- first-run onboarding
- Collection swipe actions for Edit/Delete
- local taste-profile and explainable Discover recommendations

Future items are clearly labeled in the roadmap, including NFC device flows and deeper yearly/shelf analytics.

## Structure

```text
.
├── .github/workflows/pages.yml
├── .nojekyll
├── assets/
│   ├── branding/
│   ├── screenshots/
│   └── social/
├── index.html
├── 404.html
├── styles.css
├── script.js
├── robots.txt
└── sitemap.xml
```

## Local preview

```bash
python -m http.server 8080
```

Open `http://localhost:8080`.

## Domain / deployment

GitHub Pages custom domain: `groovefolio.app`

Pushes to `main` deploy through `.github/workflows/pages.yml`.

## Discogs notice

Groovefolio is not affiliated with Discogs. Discogs is a trademark of Zink Media, LLC.
