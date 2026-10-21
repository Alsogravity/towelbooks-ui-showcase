# Asset provenance

All shipped brand, landing-image, and font bytes were copied unchanged from the source snapshot in SOURCE.md. `asset-manifest.json` records each original path and SHA-256 checksum. No production user avatars, banners, catalog-cover uploads, or third-party book covers were exported.

The retained brand set is `mark.svg`, `wordmark.svg`, and `wordmark-white.svg`; Google and Instagram service logos are not shipped. The landing illustrations and photos/illustrations already present in the project's landing asset folder retain their original project provenance. Their inclusion here does not imply that this showcase grants rights to reuse them.

Book covers are rendered from fictional titles with the extracted `TypographicCatalogWorkCover` component. They make no external requests and contain no copied cover artwork.

Self-hosted fonts: Inter, Source Serif 4, JetBrains Mono, Gloria Hallelujah, Cormorant Garamond, Bricolage Grotesque, and Excalifont. Original font notices are retained beside the WOFF2 files; complete OFL texts and copyright notices are in `public/assets/fonts/licenses/`. Excalifont's license declaration and text are taken from its upstream source metadata; the other font licenses are taken from the upstream project or Google Fonts' corresponding OFL file.

Dependency license notices, including Lucide's ISC text, ship with the public build under `/third-party/dependencies.txt`. They are generated from installed packages during the build. The showcase's rights-reserved notice does not override any third-party license.

Screenshots in `docs/screenshots` are generated from the fictional showcase by the browser validation suite. No real account or production data appears in them.
