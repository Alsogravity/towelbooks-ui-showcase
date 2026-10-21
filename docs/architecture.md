# Original frontend extraction

The source is the original React frontend, not a redesigned approximation. `apps/showcase` preserves the original pages, routes, shell, styles, feature controllers, and translations. The UI, tokens, schemas, and SDK packages are extracted with it. Source manifests and `pnpm source:check` make presentation drift detectable.

Nine integration seams differ from the source snapshot:

| File                                    | Demo adaptation                                                                                                                    |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `app/router.tsx`                        | Mount the original routes beneath `/demo` for product entry; retain guest routes at `/`.                                           |
| `app/guest-auth-routes.tsx`             | Render the original login/register pages in their original auth layouts; retain the existing fallback for other guest auth routes. |
| `features/auth/AuthContext.tsx`         | Supply an in-memory fictional viewer and preserve original locale synchronization.                                                 |
| `lib/sdk.ts`                            | Inject `demoFetch` into the original SDK instead of sending real API requests.                                                     |
| `app/providers.tsx`                     | Omit analytics collection/visitor consent startup and show a brief original-component portfolio toast.                             |
| `lib/documentMetadata.ts`               | Point canonical metadata to the showcase domain.                                                                                   |
| `pages/auth/login/LoginPage.tsx`        | Add the localized demo description through the existing form-description slot.                                                     |
| `pages/auth/login/useLoginPageState.ts` | Prefill the original validated login form and submit through a local demo callback.                                                |
| `pages/auth/register/RegisterPage.tsx`  | Prefill the original validated registration form, add the description, and replace service submission with local confirmation.     |

`demo/auth.ts` centralizes the fictional form defaults, English/Portuguese descriptions, and `enterDemo` callback. Both forms use their original validation schemas and components. Successful validation calls `window.location.replace('/demo')`; the full navigation initializes the `/demo` basename and fixed Peter Parker viewer. No auth endpoint, token, cookie, email, legal acceptance record, or credential persistence is involved. Editing form values does not change the demo identity. The existing SDK transport continues to reject real auth requests.

`demo/fixtures.ts` defines fictional books, rooms, collections, and a reader using the original schemas. `demo/state.ts` owns memory state. Domain handlers update it through the original SDK response contracts, so the original query hooks and mutation forms still drive the UI. Reading-session edits update summaries and continue-reading data; collection edits update the same local records. Reloading restores fixtures.

The transport never delegates to network fetch. Real authentication, credential changes, account deletion, uploads, privacy exports, and administrative operations are rejected locally. Unsupported advanced workflows use the original error/empty presentations. The static host enforces `connect-src 'none'`; fonts and fixture media are local. No global network interception, mock service worker, backend, database, or cloud data store is required.

The original theme/locale controllers remain in place, including their original preference handling. The demo adds no account-session persistence and sends no telemetry. No production auth boundary has been altered: the original application remains in its separate, untouched repository.

The static HTML retains original font/preference startup but removes the production JSON-LD block and uses showcase canonical URLs. Host headers supply the CSP. Production-only sitemap files are omitted. Source tests and infrastructure are replaced by focused SDK contract tests, browser demo checks, and source fidelity checks specific to this independent repository.
