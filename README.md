# Groovefolio website

The public product website for Groovefolio, an Android-first, local-first vinyl collection and listening history app. Production: https://groovefolio.app/.

## "Listening room" redesign — November 2026

Dark, editorial, music-first. The palette is near-black, charcoal and warm off-white, taken from the app's own surfaces, with the brand orange `#D4622A` used sparingly. The homepage reads like a record's running order:

| Track | Section | Content |
| --- | --- | --- |
| Side A | Hero | What Groovefolio is, release status, real Collection screenshot |
| A1 | The shelf | Collection, plus the four ways to add records (by hand, Discogs search, barcode, import) |
| A2 | The spin | Logging plays, plus the NFC tap-to-log set piece and its limits |
| B1 | The memory | Stats |
| B2 | Rediscover | Discover and "Why this record?" |
| B3 | Yours | Local-first storage, no account, no ads, the honest no-backup caveat |
| Run-out | Release | "Coming soon to Android" and the FAQ |

No web fonts are requested; the type is a serif display stack plus system UI. The vinyl record and the NFC demo are drawn in CSS. Motion only animates transform and opacity, pauses when off screen, and is disabled under `prefers-reduced-motion`. Without JavaScript, all content and navigation stay available.

### Copy rules (verified against the app and backend)

Every claim on the site has been checked against `Groovefolio` (Flutter) and `Groovefolio-Backend`. Keep these true:

- **Release:** the site is pre-release, with no store link until the real Play listing exists.
- **Discogs features:** search/autofill, barcode lookup and import always say they need **internet and a connected Discogs account** (WEB-10).
- **NFC tags:** tap-to-log needs a writable NDEF tag, NFC on, an unlocked Android phone and the app installed. Each tap logs a full album. Undo is in-app only.
- **Tags:** there is no tag store (WEB-16). Users bring compatible tags they already own.
- **Discover:** recommends only records the user owns, calculated on the device.
- **Storage and privacy:** no account, sync or cloud backup. No ads and no developer-run analytics. ML Kit's Google diagnostics are disclosed.

`tools/check-site.mjs` enforces the most important of these.

## Preview and checks

There are no runtime dependencies. Node packages are development tools only.

```sh
python -m http.server 8080   # then open http://localhost:8080
npm run check                 # static checks: metadata, CSP, links, 14px minimum, claims, assets
npm run build                 # assembles _site/ and the sitemap
npm ci && npx playwright install chromium
npm run test:browser          # builds, then browser checks at 320–1440px, no-JS, a11y/contrast
```

## Deployment

- `.github/workflows/check.yml` runs on every pull request.
- `.github/workflows/pages.yml` runs on pushes to `main`. It calls the same checks first, and only deploys if they pass (WEB-03).
- `tools/build-site.mjs` copies an explicit allowlist of website files into `_site/` and writes `sitemap.xml` with `lastmod` from git (WEB-13). It refuses to publish anything else, so READMEs, tools, `package.json`, `brand/` sources and app code are never published (WEB-04/05).
- Actions are pinned to commit SHAs (WEB-06).
- GitHub Pages remains the host, with the custom domain configured as `groovefolio.app` in repository Pages settings. Only a merge to `main` publishes changes.

### Security headers (WEB-07)

GitHub Pages cannot send custom headers, so every page carries a `Content-Security-Policy` meta tag (`'self'` only, no inline script or style) and a `strict-origin-when-cross-origin` referrer policy.

`frame-ancestors`, HSTS and `X-Content-Type-Options` can only be sent as real response headers, for example from a Cloudflare transform rule. That is an infrastructure decision outside this repo.

## Files

- **Pages:** `index.html`, `privacy/index.html`, `support/index.html`, `404.html`. Every page uses root-absolute asset paths, so the 404 page works at any depth (WEB-08).
- **`styles.css`:** one shared stylesheet. Colour tokens and their contrast ratios are documented at the top.
- **`script.js`:** mobile menu, screenshot dialog, scroll reveal, and pausing the record and NFC animations while they're off screen.
- **`support/support.js`:** the copy-email button.
- **`assets/screenshots/release/`:** real app screenshots, the only ones published.
- **`brand/`:** source brand files, kept in the repo but not published.

## Before public app release

1. Add the real Play Store listing URL for `app.groovefolio`. Replace "Coming soon" in the header, hero, run-out and FAQ together, and update the check in `tools/check-site.mjs`.
2. Confirm the Discogs backend (`api.groovefolio.app`) is on production hosting before launch, or revisit the Shelf copy.
3. Recapture these screenshots:
   - Stats with several months of data (the current one is cropped to hide a truncated tile)
   - the barcode scanner
   - NFC help & tags
4. If the Tag Store link ships, update the NFC copy, the FAQ and the privacy policy together.
5. Generate a new social card in the dark style. The current `groovefolio-social.png` predates the redesign.

## Attribution

Screenshots are supplied by the app owner. Discogs attribution remains in the footer. Album artwork in screenshots belongs to its respective owners.
