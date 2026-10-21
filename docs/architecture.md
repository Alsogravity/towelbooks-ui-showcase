# Showcase architecture

`apps/showcase` owns routing, pages, demo workflows, fictional entities, localization, and browser presentation. `packages/ui` owns router-independent primitives; `packages/design-tokens` owns existing brand values and semantic typography.

The original landing composition, custom illustrations, cover placeholders, layout primitives, and ButtonLink are copied presentation sources. Product containers and the shell are purpose-built adaptations for a curated showcase, not a drop-in copy of the complete authenticated application. See SOURCE.md for the source commit.

The demo uses React context and typed local collections. Navigation keeps the same in-memory state; a reload restores fixtures. Reading updates validate integer page boundaries. Personal notes and discussion text are never sent or persisted. Reset restores library data, room memberships, and discussion replies; theme and locale remain the current UI preference until reload.

There is no SDK, shared API schema package, auth session, backend, database, OAuth, billing, analytics, or cloud data storage. The application has no fetch, XHR, WebSocket, or EventSource behavior. Assets and fonts are bundled locally. `connect-src 'none'` in the static host policy reinforces that boundary.

The curated surface covers landing, pricing concepts, dashboard, catalog, library, reading details, collections, rooms/conversation, profile, preferences, visual states, and a credential-free access preview. The complete production product's administrative, account lifecycle, moderation, catalog contribution, media upload, and advanced social workflows are outside this showcase.

The access preview deliberately has no credential inputs. Pricing examples are labeled as design concepts. Loading, empty, and error examples are selected explicitly on `/demo/states`.
