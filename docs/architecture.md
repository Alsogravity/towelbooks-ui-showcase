# Original frontend extraction

The source is the original React frontend, not a redesigned approximation. `apps/showcase` preserves the original pages, routes, shell, styles, feature controllers, and translations. The UI, tokens, schemas, and SDK packages are extracted with it. Source manifests and `pnpm source:check` make presentation drift detectable.

Six integration seams differ from the source snapshot:

| File                            | Demo adaptation                                                                                        |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `app/router.tsx`                | Mount the original routes beneath `/demo` for product entry; retain guest routes at `/`.               |
| `app/guest-auth-routes.tsx`     | Send sign-in/signup entry into the fictional demo without credentials.                                 |
| `features/auth/AuthContext.tsx` | Supply an in-memory fictional viewer and preserve original locale synchronization.                     |
| `lib/sdk.ts`                    | Inject `demoFetch` into the original SDK instead of sending real API requests.                         |
| `app/providers.tsx`             | Omit analytics collection/visitor consent startup and show a brief original-component portfolio toast. |
| `lib/documentMetadata.ts`       | Point canonical metadata to the showcase domain.                                                       |

`demo/fixtures.ts` defines fictional books, rooms, collections, and a reader using the original schemas. `demo/state.ts` owns memory state. Domain handlers update it through the original SDK response contracts, so the original query hooks and mutation forms still drive the UI. Reading-session edits update summaries and continue-reading data; collection edits update the same local records. Reloading restores fixtures.

The transport never delegates to network fetch. Real authentication, credential changes, account deletion, uploads, privacy exports, and administrative operations are rejected locally. Unsupported advanced workflows use the original error/empty presentations. The static host enforces `connect-src 'none'`; fonts and fixture media are local. No global network interception, mock service worker, backend, database, or cloud data store is required.

The original theme/locale controllers remain in place, including their original preference handling. The demo adds no account-session persistence and sends no telemetry. No production auth boundary has been altered: the original application remains in its separate, untouched repository.

The static HTML retains original font/preference startup but removes the production JSON-LD block and uses showcase canonical URLs. Host headers supply the CSP. Production-only sitemap files are omitted. Source tests and infrastructure are replaced by focused SDK contract tests, browser demo checks, and source fidelity checks specific to this independent repository.
