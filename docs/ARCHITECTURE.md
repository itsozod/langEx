# LangEx architecture

Last verified against the repository: 2026-08-26.

## System boundary

LangEx is an Expo SDK 57 mobile client for iOS and Android. It talks to a separate HTTP and Socket.IO backend; backend implementation and deployment are outside this repository.

## Application structure

- `src/app/` contains thin Expo Router entries and layouts. Feature behavior belongs under `src/screens/`.
- `src/screens/<feature>/` owns feature UI, hooks, API calls, schemas, types, utilities, and styles.
- `src/shared/` owns cross-feature UI, constants, hooks, API/socket clients, and persistent stores.
- `src/providers/` owns app-wide React Query and theme providers.
- `scripts/` contains local release and maintenance tooling.

The root composition in `src/app/_layout.tsx` is:

```text
KeyboardProvider
└── QueryProvider
    └── ThemeProvider
        └── Tamagui + navigation theme
            ├── auth/session bootstrap and protected routes
            ├── authenticated API interceptor
            ├── chat socket manager
            ├── durable chat outbox manager
            └── push notification manager
```

Exactly one `KeyboardProvider` must remain at the root.

## State and data flow

- Server state: TanStack React Query.
- Persistent client state: Zustand with AsyncStorage.
- Forms: React Hook Form with Zod validation.
- HTTP: Axios through `src/shared/lib/api-client.ts`.
- Realtime chat: one manually connected Socket.IO singleton in `src/shared/lib/socket.ts`.
- Theme: the project theme provider coordinates Tamagui, Expo Router navigation themes, and status-bar appearance.

Authenticated Axios requests read the token from the auth store. An HTTP 401 invokes the installed unauthorized handler, which must clear authentication and dependent query/chat state.

## Navigation and session lifecycle

`src/app/_layout.tsx` waits for fonts and persisted auth hydration, verifies the session with `GET /me`, then routes users as follows:

- Logged out → `/welcome`.
- Authenticated with incomplete profile → `/onboarding/step1`.
- Authenticated with complete profile → `/(tabs)`.
- A valid notification target may route an authenticated user directly to `/chat/[id]`.

Protected Expo Router stacks enforce the same boundaries.

## Networking

The API base URL is selected in `src/shared/lib/api-client.ts`:

- `EXPO_PUBLIC_API_URL` when supplied.
- Android emulator fallback: `http://10.0.2.2:3000`.
- Other local fallback: `http://localhost:3000`.

`EXPO_PUBLIC_*` values are embedded in the app and must not contain secrets. Production currently uses `https://langex-backend.onrender.com` according to `HANDOFF.md`.

The socket uses the same base URL and supplies the bearer token during connection setup. Chat joins rooms explicitly and reconciles socket events with both the Zustand message store and React Query caches.

## Chat delivery model

- The latest conversation window stays live while older anchored windows can be loaded independently.
- Optimistic messages use client-generated IDs.
- The in-progress durable outbox persists queued messages before transmission, sends them sequentially, retries transient failures with bounded backoff, and stops after five automatic attempts.
- The backend must deduplicate `send_message` using `clientMessageId` for retry safety.
- A confirmed live message is reconciled into both the transient Zustand thread and the React
  Query latest-window cache. Navigation rebuilds the thread from that cache, so updating only the
  transient store is invalid. Anchored historical windows do not receive new live messages.
- Message edits and unsends update both the message store and cached query pages.
- An unsent message is removed entirely; quoted replies have their `replyTo` reference cleared.

## Platform constraints

The mandatory physical-device, keyboard, safe-area, icon, and inverted-list rules live in `AGENTS.md`. Important invariants include:

- Android uses resize keyboard behavior.
- Icons flow through `src/shared/components/ui/symbol-view.tsx`.
- Gifted Chat inversion and empty-state corrections are platform-specific.
- Input screens require keyboard-aware behavior and physical-device verification.

## Build and release

- Development: `npm start`, `npm run android`, `npm run ios`.
- Local releases: `npm run android:release`, `npm run ios:release`.
- Production release scripts load `EXPO_PUBLIC_API_URL` from ignored `.env.production.local` and require HTTPS.
- EAS configuration is in `eas.json`; native identifiers and Expo plugins are in `app.json`.
