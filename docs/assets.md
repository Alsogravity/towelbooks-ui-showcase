# Asset provenance

Original public assets were copied unchanged from the source snapshot in SOURCE.md. `asset-manifest.json` records their original paths and SHA-256 checksums. No production user avatars, user banners, catalog-cover uploads, or remotely downloaded book covers were exported.

The extracted asset folders include the original brand variants, service logos, decorative book-cover artwork, banner presets, landing illustrations, and fonts. These files preserve the original project's composition. Their presence does not grant additional reuse rights or imply an active external-service integration.

Fictional catalog records have no remote cover URLs. The original typographic cover component supplies placeholders without external requests. Source decorative artwork remains in its original public asset paths.

Self-hosted fonts include Inter, Source Serif 4, JetBrains Mono, Gloria Hallelujah, Cormorant Garamond, Bricolage Grotesque, and Excalifont. Original notices are retained; complete license texts are included under `public/assets/fonts/licenses/`.

Runtime dependency notices, including Lucide's ISC text, ship at `/third-party/dependencies.txt` and are regenerated from the lockfile during build. The schemas package retains its original MIT metadata. The showcase rights-reserved notice does not override third-party or separately declared licenses.

Screenshots in `docs/screenshots` show the original frontend with fictional demo records. They contain no real account or production data.
