# Third-party notices

The project source and original artwork are rights reserved. Third-party dependencies and fonts retain their separate licenses. The extracted `@towelbooks/schemas` package retains its original MIT license declaration in its package metadata.

- Runtime dependency license texts are bundled in [`third-party/dependencies.txt`](apps/showcase/public/third-party/dependencies.txt). Regenerate them with `pnpm notices:generate` after dependency changes; the build also regenerates this file.
- Font notices and complete font license texts are bundled in [`assets/fonts`](apps/showcase/public/assets/fonts). See `LICENSES.md` and `licenses/*.txt` there.
- Lucide icons are supplied by `lucide-react` under ISC; custom TowelBooks glyphs are original project artwork.
- All catalog titles, authors, profile identities, rooms, text, and demo activity in `apps/showcase/src/demo/fixtures.ts` are fictional. Cover art uses the original typographic placeholder renderer. No third-party book-cover bytes or production user media are included.
- Brand and landing art come from the source repository snapshot recorded in SOURCE.md. Their original project rights are preserved; extraction does not grant additional reuse rights.

`pnpm licenses list --prod --json` provides the installed production dependency inventory. Build tools remain governed by the license files distributed in their packages.
