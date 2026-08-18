# Groovefolio Site V3

This is the visibly-expanded product-site version.

## New in V3

- sticky product scrollytelling:
  - Collection
  - play logging
  - real Discogs search screenshot
  - Stats
  - planned NFC workflow
- animated phone screen changes while scrolling
- future Shelf Coverage / collection-utilization concept
- animated shelf fill + percentage counter
- orange page scroll-progress indicator
- stronger section motion
- NFC wave animation
- animated in-phone stats
- fixes the earlier hero orbit selector mismatch (`.orbit.one` / `.orbit.two`)
- preserves reduced-motion accessibility
- no app-repository links
- still plain HTML/CSS/vanilla JS

The Shelf Coverage and NFC sections are explicitly labeled as future/planned concepts so the public site does not imply those workflows are already shipped.

## Apply

You can replace the current site with this full folder, or copy the three changed files:

- `index.html`
- `styles.css`
- `script.js`

Then preview:

```powershell
python -m http.server 8080
```

Push to `main` to redeploy through the existing Pages workflow.
