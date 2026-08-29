# LangEx decision log

Record durable decisions here. Add the date, decision, rationale, and consequences; do not use this file as a session diary.

## 2026-08-26 — Keep Expo Router entries thin

**Decision:** Route files under `src/app/` only read route parameters and compose feature screens. Feature behavior lives under `src/screens/<feature>/`.

**Rationale:** Navigation remains easy to inspect while feature UI, networking, side effects, and styles keep coherent ownership.

**Consequences:** Handwritten files stay below 400 lines and extraction begins before 300 lines. Shared code moves to `src/shared/` only when it is genuinely cross-feature.

## 2026-08-26 — Separate server state from persistent client state

**Decision:** Use TanStack React Query for server state and Zustand with AsyncStorage for persistent client state.

**Rationale:** Query caching, invalidation, and pagination differ from durable local session and UI state.

**Consequences:** Socket mutations that affect server-derived views must reconcile both Zustand and React Query caches; store-only corrections are insufficient.

## 2026-08-26 — Use one shared HTTP boundary

**Decision:** Route unauthenticated requests through `authApiClient` and authenticated requests through `apiClient` in `src/shared/lib/api-client.ts`.

**Rationale:** API URL selection, error normalization, bearer-token injection, and 401 handling need one consistent implementation.

**Consequences:** Feature API modules should not create independent Axios clients. Multipart uploads must let Axios set their boundary rather than manually setting `Content-Type`.

## 2026-08-26 — Use a singleton Socket.IO connection

**Decision:** Maintain one manually connected socket in `src/shared/lib/socket.ts`, with root managers and feature hooks owning connection and room lifecycles.

**Rationale:** Multiple sockets would duplicate events and complicate auth refresh, active-room presence, and cache reconciliation.

**Consequences:** New realtime behavior must extend the typed event contracts and clean up listeners deterministically.

## 2026-08-26 — Preserve exactly one root keyboard provider

**Decision:** Keep a single `KeyboardProvider` in `src/app/_layout.tsx` and use SDK 57-compatible keyboard-controller patterns in input screens.

**Rationale:** Nested providers and generic keyboard avoidance produce inconsistent offsets and hidden controls on physical devices.

**Consequences:** Forms and chat must follow the platform-specific keyboard requirements in `AGENTS.md`; simulator output alone is not acceptance evidence.

## 2026-08-26 — Use native iOS symbols and centralized Android SVGs

**Decision:** Import icons through `src/shared/components/ui/symbol-view.tsx`, retaining SF Symbols on iOS and mapped Lucide SVGs on Android.

**Rationale:** Font glyph baselines vary across Android devices and cannot be centered reliably with per-screen offsets.

**Consequences:** Every new Android symbol requires an entry in the centralized SVG map. Font-based Material Symbol rendering and optical offset hacks are prohibited.

## 2026-08-26 — Model unsend as removal, not a tombstone UI

**Decision:** Remove unsent messages from the thread and clear reply references that pointed to them.

**Rationale:** The backend filters unsent messages from REST responses and emits a minimal `message_unsent` socket payload.

**Consequences:** Socket handling must validate the tombstone with `isUnsentMessage`, then update the store and all loaded query pages consistently.

## 2026-08-26 — Persist outgoing chat messages before sending

**Decision:** The current chat work introduces a per-user AsyncStorage-backed outbox, sequential delivery, client message IDs, bounded retry, and explicit failed states.

**Rationale:** Messages composed offline or during connection loss must survive app restarts and preserve user order.

**Consequences:** Persistence must finish before socket transmission. The backend must treat `clientMessageId` idempotently. This decision remains subject to verification while the implementation is uncommitted.

## 2026-08-27 — Every request must be able to fail, and a persisted session must never be blocked

**Decision:** Both Axios instances in `src/shared/lib/api-client.ts` carry an explicit 15s default timeout, `useAuthSessionBootstrap` blocks on `GET /me` only when no persisted user exists, and unreachable-API failures (`ApiError.status === 0`) stay retryable.

**Rationale:** React Native's Android networking stack applies no default socket timeout, so a request reusing a stale keep-alive connection — routine after Android backgrounds or cold-starts the process — never settled and never errored. iOS gets a 60s NSURLSession default, which is why only Android stranded on the "Checking your session…" gate indefinitely.

**Consequences:** Session verification is now a background revalidation over the hydrated session rather than a startup gate; a 401 still clears auth through the unauthorized handler. Long-running requests must opt into a larger per-request timeout, as `getConversation` already does. Do not reintroduce a startup state that a single unsettled request can hold open.

## 2026-08-27 — Bound OkHttp's TCP connect phase on Android

**Decision:** `plugins/with-android-okhttp-connect-timeout.js` installs a React Native `OkHttpClientFactory` with an 8s `connectTimeout` and `retryOnConnectionFailure`. Read and write timeouts stay at React Native's `0`.

**Rationale:** `langex-backend.onrender.com` resolves to two A records and one of them (216.24.57.15) blackholes SYN packets while the other (216.24.57.7) answers in ~70ms. React Native 0.86 bundles OkHttp 4.9.2, which predates Happy Eyeballs "fast fallback" (4.12) and therefore tries resolved addresses strictly in sequence, with `connectTimeout(0)` meaning it waits on a dead address forever. iOS never reproduced this because NSURLSession implements RFC 8305 and races the addresses. A finite connect timeout is what lets OkHttp fall through to the next address.

**Consequences:** Only the TCP connect phase is bounded, so Socket.IO long-polling and large uploads are unaffected. This is defence against any multi-address host with a bad endpoint, not a fix for the DNS record itself — that must be raised with the hosting provider. The plugin must stay registered in `app.json` so it survives `expo prebuild`; verify `setOkHttpClientFactory` is present in the generated `MainApplication.kt` after any prebuild or SDK upgrade.

## 2026-08-29 — Keep multi-account identity local and transitions atomic

**Decision:** Persist independent authenticated sessions on the device and select one active account. Do not introduce backend account linking. All login, registration, switching, invalidation, and logout paths use one account-transition boundary.

**Rationale:** LangEx accounts already have complete independent authentication and profile lifecycles. A server-side parent-account model would add authorization and migration risk without being required for Telegram-style device switching.

**Consequences:** Account transitions cancel and clear React Query state, disconnect the socket, and reset chat/onboarding state before exposing the next token. Outbox entries remain keyed by user. Push payloads identify the recipient account, and late responses from a previous bearer token cannot invalidate the newly active account.

## 2026-08-29 — Tombstone deleted accounts and close their conversations

**Decision:** Account deletion scrubs authentication and profile data but retains a tombstoned user row. Every conversation containing that user is permanently marked read-only; conversation membership and message rows remain intact.

**Rationale:** Hard-deleting the user would either destroy message history or break the sender and participant relationships needed to render retained conversations. A tombstone preserves referential integrity without exposing the former identity.

**Consequences:** Deleted sessions are rejected and disconnected, their email can be registered as a new identity, discovery/search exclude tombstones, profiles project only “Deleted user,” and chat creation/send/edit/unsend operations reject closed conversations. Backend and app releases must include the migration and new API fields together.
