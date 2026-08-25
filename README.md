# Groovefolio Site

Public marketing/showcase site for **Groovefolio**, a local-first Android app for vinyl collectors.

**Live site:** `https://groovefolio.app/`

The website repository is intentionally separate from the Flutter application repository. This repository contains only the public product site and web-optimized marketing assets.

## Current product story

The current Android development build shown on the site includes:

- local-first collection management
- artwork, genres, release metadata, and side-grouped tracklists
- manual play logging with full-album/side selection and editable date/time
- current-year and all-time listening stats
- Discogs OAuth, exact-release search/autofill, connected collection import, and barcode lookup
- first-run onboarding
- Collection swipe actions for Edit/Delete
- local taste-profile and explainable Discover recommendations

NFC device read/write/auto-log flows and deeper listening stories such as Album Wrapped remain future work.

## Website structure

```text
.
├── .github/workflows/pages.yml
├── .nojekyll
├── assets/
│   ├── branding/
│   ├── screenshots/
│   └── social/
├── index.html
├── styles.css
├── script.js
├── robots.txt
└── sitemap.xml
```

## Branding

Website branding is derived from the approved master assets in the Groovefolio Flutter repository. Only web-sized derivatives are deployed here; the authoritative high-resolution masters remain with the app.

Primary colors:

- Warm paper: `#F7F4F0`
- Ink: `#171513`
- Groovefolio orange: `#D4622A`

## Screenshots

The site uses clean screenshots from the current Android development build. They are converted to high-quality WebP and include intrinsic dimensions to prevent layout shift.

## Domain and deployment

The GitHub Pages custom domain is configured as:

`groovefolio.app`

The repository uses the GitHub Actions Pages workflow in `.github/workflows/pages.yml`. Pushes to `main` deploy automatically.

The custom domain is configured in **Repository Settings → Pages**. A repository `CNAME` file is not required for this Actions-based deployment.

## Local preview

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Discogs notice

Groovefolio is not affiliated with Discogs. Discogs is a trademark of Zink Media, LLC.


## Visual direction

The current homepage uses the real Collection screen in the hero, a restrained physical-vinyl visual language, alternating warm-paper/dark sections, and mobile-native swipe galleries. The homepage deliberately avoids adding more sections when existing product screens can tell the story.
