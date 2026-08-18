# Groovefolio Site

Marketing/showcase site for [Groovefolio](https://github.com/hunter-goller/Groovefolio), a local-first vinyl collection and listening-history app.

## Included

- Responsive static landing page
- Groovefolio-styled SVG mark and wordmark
- Real development screenshots for Discogs search/autofill
- Feature, local-first, roadmap, and GitHub CTA sections
- Mobile navigation
- GitHub Pages deployment workflow
- No framework or build step required

## Publish on GitHub Pages

1. Copy these files into the root of `hunter-goller/Groovefolio-Site`.
2. Commit and push to `main`.
3. In GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, select **GitHub Actions** as the source.
5. The included `pages.yml` workflow will deploy after pushes to `main`.

The project site should then be available at:

`https://hunter-goller.github.io/Groovefolio-Site/`

## Screenshots

Current screenshots:

- `assets/screenshots/discogs-search.jpg`
- `assets/screenshots/discogs-autofill.jpg`

Later we can replace/add Collection, Album Detail, Stats, play logging, and other final screenshots without changing the overall layout.

## Branding

- Warm paper: `#F7F4F0`
- Ink: `#171513`
- Groovefolio orange: `#D4622A`

The included SVG mark is a site-ready interpretation of the current Groovefolio record/folio direction. When the final exported master logo is ready, it can replace these SVGs directly.

## Local preview

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Notes

Groovefolio is not affiliated with Discogs. The footer includes a basic Discogs trademark/affiliation disclaimer.
