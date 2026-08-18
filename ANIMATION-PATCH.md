# Groovefolio Site — Animation Polish

Changed files only:

- `styles.css`
- `script.js`

Adds:

- slow hero vinyl rotation
- subtle scroll parallax between the record and folio
- animated waveform
- scroll-reveal transitions
- feature-card hover lift
- animated Stats bars
- 3D phone screenshot tilt on desktop pointer movement
- rotating Local-first vinyl while visible
- roadmap reveal/hover motion
- sticky-header polish
- logo and CTA hover details
- full `prefers-reduced-motion` handling

No framework or animation dependency was added.

## Apply

Overlay these two files onto the existing `Groovefolio-Site` repo.

Then preview locally:

```powershell
python -m http.server 8080
```

and open `http://localhost:8080`.

When satisfied, commit and push to `main`; the existing GitHub Pages workflow will deploy it.
