# Static deployment

The repository is ready for a separate Cloudflare Pages project. It does not reuse the original product's DNS, AWS, media storage, credentials, or deployment workflows.

Connect `Alsogravity/towelbooks-ui-showcase` to a new Pages project with:

- Production branch: `main`
- Root directory: repository root
- Install: `pnpm install --frozen-lockfile`
- Build command: `pnpm build`
- Output directory: `apps/showcase/dist`
- Node version: 24; pnpm version: 10.30.1 (also pinned in package.json)

No application environment variables or API keys are required. Leave automatic analytics injection disabled. Keep the GitHub integration scoped to this repository.

Do not add a top-level `404.html`: Pages uses `index.html` as the SPA fallback, allowing direct links and reloads under `/demo`. Static `_headers` applies CSP and other browser headers; it is copied from public into the build output. No Pages Functions are required.

After deployment, verify direct links, both locales, light/dark themes, mobile navigation, reading edit/reset, zero application service requests, and the response security headers. Set the actual demo URL as the GitHub repository website and add it to README only after verification.

Local production verification uses `node scripts/serve.mjs` after a build. That server applies the bundled headers and SPA fallback so browser tests exercise CSP rather than only the Vite development environment.

References: [React on Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/), [SPA serving behavior](https://developers.cloudflare.com/pages/configuration/serving-pages/), [static response headers](https://developers.cloudflare.com/pages/configuration/headers/).
