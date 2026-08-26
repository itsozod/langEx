# LangEx current context

Last updated: 2026-08-26. Treat this as a concise handoff map and verify it against current code and Git state.

## Current state

- Expo SDK 57 / React Native 0.86 / React 19 / TypeScript mobile client on branch `main`.
- Auth, five-step onboarding, discover, public/own profiles, theme selection, push notifications, conversation lists, and realtime chat are implemented.
- Chat supports optimistic sending, pagination, typing state, replies, edit, unsend, links, jumping to quoted messages, and returning to the live window.
- The working tree contains substantial uncommitted user work. Preserve it and review the diff before editing.
- Current uncommitted work appears to add a durable message outbox, socket read receipts, notification-to-chat navigation, Android release tooling, and related chat UI/refactors. It has not been accepted as verified merely by being documented here.
- Confirmed outgoing and incoming socket messages now reconcile into the React Query latest-window cache as well as the transient thread, preventing messages from disappearing after chat re-entry.
- Chat typing state uses an accessible, reduced-motion-aware three-dot indicator. Incoming messages auto-follow only when the reader is already within 80 points of the live edge; otherwise a numbered jump-to-latest badge preserves the reading position and reports unseen arrivals.
- The backend is a separate repository. Confirm backend contract changes instead of assuming them.

## Key references

- Mandatory repository rules: `AGENTS.md`.
- Stable architecture: `docs/ARCHITECTURE.md`.
- Durable choices: `docs/DECISIONS.md`.
- Detailed historical handoff and API inventory: `HANDOFF.md`.
- Root lifecycle: `src/app/_layout.tsx`.
- HTTP boundary: `src/shared/lib/api-client.ts`.
- Socket contract: `src/shared/lib/socket.ts`.
- Chat feature: `src/screens/chat/`.

## API behavior

- Production API recorded in `HANDOFF.md`: `https://langex-backend.onrender.com`.
- Authenticated requests use bearer tokens; HTTP 401 must clear auth and dependent state.
- REST endpoints and socket events currently consumed by the client are enumerated in `HANDOFF.md`.
- Socket `send_message` now includes `clientMessageId`; backend idempotency must be confirmed for safe retries.
- `message_unsent` is a minimal tombstone payload and is not a renderable message.
- Avatar upload uses multipart field `avatar`; Axios owns the multipart boundary.

## Known issues and constraints

- Full-project lint may report a pre-existing `react-hooks/set-state-in-effect` issue in `src/shared/hooks/use-color-scheme.web.ts`; distinguish it from affected-file failures.
- React Native core `Clipboard` is deprecated. Move to `expo-clipboard` only alongside a native rebuild so existing development clients are not broken.
- Physical Android and iOS verification remains mandatory for keyboard, safe-area, icons, Gifted Chat inversion, multiline growth, and large-font behavior.
- The default `README.md` still describes a generic create-expo-app project and is not an authoritative architecture reference.

## Next steps

1. Review the current uncommitted diff and determine the intended completion boundary for the outbox/read-receipt/notification work.
2. Confirm backend support for idempotent `clientMessageId` and the `conversation_read` event.
3. Run formatting, TypeScript, targeted lint, `git diff --check`, and Android/iOS bundle checks for all affected files.
4. Exercise offline send, restart recovery, retry exhaustion/manual retry, ordering, logout/user switching, notification navigation, and read receipts.
5. Complete physical-device verification on Android and iOS, explicitly recording any unavailable platform.
6. Replace stale detail in this file at handoff; add durable choices to `docs/DECISIONS.md` instead of appending session history.

## Verification

- Documentation initialized from current source, `HANDOFF.md`, package/config files, Git status, and recent history on 2026-08-26.
- Chat cache reconciliation passed `npx tsc --noEmit`, targeted ESLint, targeted Prettier, and Expo Android/iOS exports on 2026-08-26.
- Chat typing/autoscroll UX passed TypeScript, targeted ESLint/Prettier, `git diff --check`, and Android/iOS Expo exports on 2026-08-26.
- Physical-device re-entry verification remains outstanding on both Android and iOS.
