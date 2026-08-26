# Project context

## Current state

- Android notification taps are captured before authentication finishes and routed after the session is restored.
- Foreground Android notifications are presented globally; only an actively viewed matching conversation is suppressed by the backend.

## Architecture

- `src/screens/notifications/push-notification-manager.tsx` owns Android presentation, push-token synchronization, and notification-response capture. It reports typed navigation targets instead of navigating directly.
- `src/app/_layout.tsx` owns auth-aware notification routing. Initial navigation runs once per authenticated session, while each notification identifier is handled once.
- `src/screens/chat/hooks/use-active-conversation-presence.ts` reports the focused, foreground conversation and renews that presence every 20 seconds.
- The sibling backend's `src/sockets/presence.ts` validates conversation membership and treats active-conversation presence as a 60-second lease.

## Decisions

- 2026-08-26: Notification response capture is independent of authentication. This preserves Android cold-start taps while still delaying protected navigation until auth and profile checks pass.
- 2026-08-26: Push suppression uses an exact conversation ID plus a renewable lease. Immediate blur/background events provide normal cleanup; expiry is the recovery path for missed events or stale sockets.

## API behavior

- Message push payloads must include a string `data.conversationId`.
- The Socket.IO client emits `active_conversation` with a conversation ID only while that route is focused and the app is active; it emits `null` otherwise.
- The backend suppresses a recipient push only when at least one authenticated socket has a fresh lease for that same conversation.

## Next steps

- Deploy the sibling backend together with the next Android app build; either half alone does not provide the full stale-presence guarantee.
- Verify notification display and tap routing on a physical Android device in terminated, background, foreground-other-screen, foreground-same-chat, and locked-device states.

## Verification

- 2026-08-26: App `npx tsc --noEmit`, targeted ESLint, targeted Prettier, and `npx expo export --platform android` passed.
- 2026-08-26: Backend `npx tsc --noEmit`, targeted Prettier, and `git diff --check` passed.
