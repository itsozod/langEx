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
