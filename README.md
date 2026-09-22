# Groovefolio website

The public product website for Groovefolio, an Android-first, local-first vinyl companion. Production: https://groovefolio.app/.

## Release redesign — September 2026

Warm ivory, ink, sage, and orange; real September app screenshots; four selectable feature panels; dedicated NFC section; local-storage explanation; FAQs; screenshot enlargement. Small-screen navigation and feature controls do not require swipe gestures. Without JavaScript, all feature sections and ordinary image links remain available.

The site is **pre-release**, not a download page yet. NFC is a current app feature; Discogs is optional; Discover uses the user's own shelf and listening history. No streaming integration, AI recommendation engine, cloud sync, or automatic backup is claimed.

## Preview and checks

No build step or runtime dependencies. Node dependencies are development tools only. From this directory:

```sh
python -m http.server 8080
node tools/check-site.mjs
node --check script.js
```

Browser checks (CI also runs these and attaches screenshots):

```sh
npm ci
npx playwright install chromium
npm run test:browser
```

Open http://localhost:8080. Test at 320, 390, 768, and 1440 pixels wide. Check all four feature buttons, screenshot open/close (including Escape and focus return), mobile navigation, FAQ expansion, and browser zoom. Also test with JavaScript disabled and reduced motion enabled.

## Files

- `index.html`: page structure, product copy, metadata, and release status.
- `styles.css`: all desktop/mobile styling, including reduced-motion rules. Replaces the old separate `mobile.css` overrides.
- `script.js`: feature selection, navigation, and native screenshot dialog.
- `assets/screenshots/release/`: optimized copies of the September 22 screenshots, including Settings. Original uploads are not published.
- `assets/branding/`, `assets/social/`: existing branding and social preview assets.
- `tools/check-site.mjs`: dependency-free local asset, anchor, metadata, and screenshot-budget checks.
- `.github/workflows/check.yml`: read-only PR validation; it does not deploy.
- `.github/workflows/pages.yml`: existing production deployment, triggered by main.

## Before public app release

1. Provide the real Play Store listing URL for `app.groovefolio`. Replace coming-soon copy in navigation, release section, FAQ, and metadata together. Do not use a fake or placeholder download link.
2. Confirm a support email and publish the reviewed privacy policy. Replace the explicit footer placeholders and update app Settings. Do not claim the placeholders are a policy.
3. Retake Settings after those links are live, and update screenshots if UI changes.
4. Confirm NFC and Discogs behavior on the shipping build; recheck website claims against it.
5. Review mobile layout and social previews before merging.

## Deployment

GitHub Pages remains the host. Only a merge/push to `main` publishes the redesign. Feature branches do not deploy. Keep the custom domain configured as `groovefolio.app` in repository Pages settings.

## Attribution

Screenshots are supplied by the app owner. Discogs attribution remains in the footer. Album artwork shown inside the app screenshots is not a Groovefolio endorsement by the artists or labels.
