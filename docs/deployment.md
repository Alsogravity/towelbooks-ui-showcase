# Static deployment

Live site: [towelbooks-ui-showcase.pages.dev](https://towelbooks-ui-showcase.pages.dev).

The showcase has its own Cloudflare Pages project, `towelbooks-ui-showcase`, created with production branch `main`. It uses **Direct Upload**. It does not reuse the original product's DNS, AWS, media storage, secrets, or deployment workflows. No Pages Functions or application environment variables are needed.

GitHub pushes run the showcase CI workflow. They do **not** automatically deploy the website. Publishing is a deliberate, separate operation using operator-authenticated Wrangler:

```sh
pnpm install --frozen-lockfile
pnpm source:check
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm security:audit
pnpm build
pnpm exec playwright install chromium
pnpm test:browser
pnpm dlx wrangler@4.114.0 pages deploy apps/showcase/dist --project-name towelbooks-ui-showcase --branch main
```

Use a clean checkout of the reviewed `main` commit. Wrangler can attach the exact source SHA with its `--commit-hash` option. Never commit credentials or copy a local login token into this repository. The existing operator login was used for initial publication; no deployment secret was added to GitHub.

Cloudflare treats Direct Upload and native Git integration as distinct project types. If automatic publication is wanted later, add an approved, repository-scoped deployment workflow with an appropriately scoped operator-supplied credential, or create a separate Git-integrated Pages project. See [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/).

Do not add a top-level `404.html`: Pages uses `index.html` as the SPA fallback, allowing direct links and reloads under `/demo`. Static `_headers` applies CSP and other browser headers; it is copied from public into the build output. Automatic analytics injection is not configured.

After deploying, run:

```sh
node scripts/verify-live.mjs
```

The live check visits the original routes at desktop and mobile sizes, checks response headers and horizontal overflow after fonts load, and exercises prefilled login/sign-up confirmation, absence of credential storage/cookies, the original collection editor, reset on reload, settings, language, and theme selection. It rejects application service requests and unexpected origins. It types fictional verification text into local state only.

For local production verification, run `node scripts/serve.mjs` after a build. That server applies the bundled headers and SPA fallback so browser tests exercise CSP rather than only Vite's development environment. With that preview running, `node scripts/capture-screenshots.mjs` refreshes the portfolio images in `docs/screenshots`.

References: [React on Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/), [SPA serving behavior](https://developers.cloudflare.com/pages/configuration/serving-pages/), [static response headers](https://developers.cloudflare.com/pages/configuration/headers/), [Wrangler Pages commands](https://developers.cloudflare.com/workers/wrangler/commands/pages/).

To refresh only the original auth screenshots, run `node scripts/capture-screenshots.mjs --auth-only` with the production preview running.
