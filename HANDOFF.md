# LangEx handoff

Use this file as current context. Do not rely on old chat transcripts; inspect the code and Git
history when details matter. Read `AGENTS.md` first because its Expo 57, architecture, and physical
device requirements are mandatory.

## Current repository state

- Mobile client: Expo SDK 57, React Native 0.86, React 19, TypeScript, Expo Router.
- Branch: `main`.
- `origin/main` and local `main` were aligned at `3a5cabf` when this handoff was created.
- There is an existing uncommitted import-order-only change in
  `src/screens/chat/components/chat-thread.tsx`. Review and preserve it; do not accidentally bundle
  unrelated work into a feature commit.
- Production API: `https://langex-backend.onrender.com`.
- This workspace contains the frontend. Backend changes require access to the backend repository.
- Never add credentials, JWTs, Apple credentials, Expo tokens, or private env files to Git.

## Architecture

- `src/app`: thin Expo Router route entries and layouts.
- `src/screens/<feature>`: feature screens, APIs, hooks, schemas, types, components, utilities, and
  styles.
- `src/shared`: cross-feature UI, constants, hooks, Axios client, Socket.IO singleton, and Zustand
  stores.
- `src/providers`: React Query and theme providers.
- Server state: TanStack React Query.
- Persistent client state: Zustand + AsyncStorage.
- Forms: React Hook Form + Zod.
- HTTP: Axios. `authApiClient` handles unauthenticated auth requests; `apiClient` injects the JWT
  and invokes the global unauthorized handler on HTTP 401.
- Realtime chat: one manually connected Socket.IO singleton plus root `ChatSocketManager` and
  active-room lifecycle hooks.
- Exactly one `KeyboardProvider` exists at the app root.

## Implemented product flows

- Welcome, login, registration, and reset-password UI.
- Auth persistence and startup verification through `GET /me`.
- Logged-out startup goes to Welcome. Authenticated incomplete users go to onboarding. Completed
  users go to the Chats/Home tab.
- Five-step onboarding: basic info/avatar, country, different native/learning languages,
  proficiency, interests, and bio completion.
- Country is immutable after onboarding.
- Discover pagination/filtering, compact user cards, and public user profiles.
- Own profile, avatar upload/removal, edit profile, pull-to-refresh, logout, and theme selection.
- Real circular country/language flag images use the shared `CountryFlag`/`LanguageFlag`
  components.
- Conversation list with realtime last-message updates and backend unread counts.
- Chat with optimistic sending, typing state, pagination for older messages, message replies via
  swipe, reply previews, draft conversations, and profile navigation from avatars/headers.
- Long-pressing a message opens a Reply/Copy menu placed against that bubble, URLs and emails in
  message text are tappable, and replying by swipe follows the bubble's own side: incoming messages
  swipe right, own messages swipe left.
- Tapping the quote inside a reply bubble scrolls to the original message and flashes it. When the
  original is outside the loaded window the thread swaps to the window centred on it in one
  request, however far back it is, and a jump-to-latest arrow returns to the live thread.
- Android/iOS app icons and splash assets.

## Current API contract used by the client

- `POST /auth/register`
- `POST /auth/login`
- `GET /me`
- `POST /users/avatar` (`multipart/form-data`, field name `avatar`)
- `DELETE /users/avatar`
- `PATCH /users/profile` (onboarding completion)
- `PUT /users/profile` (profile editing)
- `GET /users/:id`
- `GET /discover?page=N&limit=20&proficiency=...`
- `GET /conversations`
- `GET /conversations/direct/:participantId`
- `GET /conversations/:id?limit=40&before=...` (also `after=<cursor>` and `around=<messageId>`;
  `pageInfo` carries `hasMore`/`olderCursor` plus `hasMoreNewer`/`newerCursor`)
- `POST /conversations/:id/read`

Socket events include `join_room`, `leave_room`, `send_message`, `receive_message`, `typing`,
`stop_typing`, `user_typing`, `user_stop_typing`, and `chat_error`. `send_message` supports
`conversationId` or `participantId`, `content`, and optional `replyToId`.

## Important implementation details

- Local API defaults: Android emulator uses `http://10.0.2.2:3000`; other local platforms use
  `http://localhost:3000`. Override with `EXPO_PUBLIC_API_URL` for real devices/LAN environments.
- A 401 from authenticated Axios requests must clear auth/query/chat state through the installed
  unauthorized handler.
- Avatar requests use Axios `FormData`; do not manually set multipart `Content-Type`.
- `EXPO_PUBLIC_*` values are embedded in app bundles and are not secrets.
- Android symbols must be added to the Lucide SVG map in
  `src/shared/components/ui/symbol-view.tsx`. Never restore font-based Android icons.
- Gifted Chat uses different inverted-list transforms in RN 0.86: iOS uses `scaleY: -1`, while
  Android uses `scale: -1`. The empty-chat correction is platform-specific in `chat-styles.ts`.
- Chat custom-header safe area uses `useSafeAreaInsets` plus a regular `View`; avoid reintroducing
  a `SafeAreaView` there because it caused mount-time header jumps during navigation animations.
- `maintainVisibleContentPosition` on the chat list is suspended around a local send on Android
  only (`use-chat-autoscroll.ts`). Android re-anchors from `didMountItems` and cancels the running
  scroll animator, while iOS adjusts inside the mount transaction. Suspending it on iOS reintroduces
  a stale-anchor jump of one bubble, because iOS keeps its captured frame across the prop change.
- A fetched page reaches the message list one render after it reaches the query, so
  `hasNextPage` can already be false while the new messages are still on their way. Pagination
  driven UI must not treat that single render as "nothing more is coming".
- The chat thread renders one window at a time. The newest window query stays mounted while an
  anchored `around` window is open, so screen state never flickers and returning is instant. While
  an older window is open, socket messages are not appended to it; scrolling forward until no newer
  page remains rejoins the live window, which is also what makes the arrow disappear.
- Never wrap message text in a gesture-handler pressable. On iOS its native recognizer cancels
  touches in subviews, so `Text.onPress` never fires and links stop opening, while Android keeps
  working. Message text carries its own press handlers instead (`MessageLongPressContext`).
- Copy uses React Native's core `Clipboard`, which logs a deprecation warning but needs no native
  module. Switch it to `expo-clipboard` at the next native rebuild, not before, or existing dev
  clients stop working.
- The chat composer input must never use `flex`. Gifted Chat only auto-grows the composer on web;
  on native the multiline input has to size itself from its content, so a flexible input fills the
  space above the keyboard and turns `maxHeight` into a fixed height.

## Build and development commands

```bash
npm install
npm start
npm run android
npm run ios
npm run ios:release
```

`npm run ios:release` loads the production URL from the ignored `.env.production.local`, keeps the
Mac awake, prompts for an iPhone, and creates a local Release build. The env file must contain:

```dotenv
EXPO_PUBLIC_API_URL=https://langex-backend.onrender.com
```

Pushing to `main` triggers `.github/workflows/mobile-release.yml`, which builds an installable
Android preview APK with EAS, uploads a workflow artifact, and creates a prerelease. It requires the
GitHub `EXPO_TOKEN` secret.

## Required verification before handoff

```bash
npx prettier --write <affected files>
npx tsc --noEmit
npx eslint <affected files> --no-cache
git diff --check
npx expo export --platform android --output-dir /tmp/langex-check
```

Run iOS bundling too for cross-platform structural or navigation changes. Full-project lint may
still report a pre-existing `react-hooks/set-state-in-effect` issue in
`src/shared/hooks/use-color-scheme.web.ts`; do not confuse that with targeted feature failures.

Physical-device verification remains essential for keyboard, safe-area, Android SVG alignment,
and Gifted Chat inversion. State explicitly which devices were unavailable. Test Samsung Keyboard,
Gboard, iOS predictive text, narrow screens, large font scale, both themes, and empty/loading states.

## How to continue

1. Read `AGENTS.md` and this file.
2. Run `git status --short` and inspect existing changes before editing.
3. Ask the user which feature to build next; no new feature is currently specified here.
4. Inspect existing feature patterns before adding dependencies or abstractions.
5. Keep route entries thin and extract files before 300 lines.
6. Do not change backend contracts by assumption. Confirm required backend behavior with the user
   when the backend repository is not available.
7. Do not commit or push unless the user explicitly requests it.
