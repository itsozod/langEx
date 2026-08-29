# Project context

## Current state

- Profile supports multiple saved accounts. Add account presents the existing login/register/reset-password flow as a dismissible full-screen modal; successful login switches immediately, while registration continues through onboarding before entering tabs.
- Onboarding for an added or selected incomplete secondary account shows a persistent close action that switches back to the previous account; normal first-account onboarding remains non-dismissible.
- Discover includes an authenticated display-name search sheet owned by the Discover screen. Selecting a result pushes the normal partner profile while the open sheet remains in Discover state underneath it, so every native or explicit back path reveals the same sheet.
- Android notification taps are captured independently and routed after the session is restored; notification hydration never blocks auth or API startup.
- Foreground Android notifications are presented globally; only an actively viewed matching conversation is suppressed by the backend.
- Core API requests use the established Axios transport. Android session verification retries only unreachable/timeout failures and can render a persisted user while verification continues.
- Account deletion permanently removes authentication/profile data while retaining old conversations and messages under a “Deleted user” tombstone. Affected chats become read-only in realtime.

## Architecture

- `src/shared/store/auth-store.ts` owns only credentials: it persists `{ token, userId }` records and derives the active token/account ID. `src/shared/store/user.store.ts` separately owns persisted user entities and the active user. Both stores migrate automatically from the legacy combined session, while `src/screens/auth/session-transition.ts` coordinates their updates.
- `src/screens/auth/session-transition.ts` is the only account-transition boundary. It cancels and clears server queries, disconnects the socket, and resets chat/onboarding state before activating another account. Outbox data remains user-scoped and is deleted only when that account logs out.
- Adding or switching accounts requires no backend account-linking model: each saved account remains an independent authenticated user. Message push payloads include `recipientUserId`, allowing a notification tap to activate the matching locally saved account before conversation navigation.
- User search belongs to the Discover feature (`src/screens/discover`) and is an in-screen overlay rather than an Expo Router route. Its UI-thread pan gesture supports swipe-down dismissal, while keeping it outside the native navigation stack prevents modal stacking and preserves the live query/result state beneath pushed profile and chat routes.
- `src/screens/notifications/push-notification-manager.tsx` owns Android presentation, push-token synchronization, and notification-response capture. It reports typed navigation targets instead of navigating directly.
- `src/app/_layout.tsx` owns auth-aware notification routing. Initial navigation runs once per authenticated session, while each notification identifier is handled once.
- Native notification-response hydration is fire-and-forget and never a prerequisite for session verification. Native response state is cleared only after auth-aware routing consumes it.
- `src/shared/lib/api-client.ts` owns the authenticated and unauthenticated Axios clients, bearer auth, response normalization, and unauthorized handling.
- `src/screens/chat/hooks/use-active-conversation-presence.ts` reports the focused, foreground conversation and renews that presence every 20 seconds.
- The sibling backend's `src/sockets/presence.ts` validates conversation membership and treats active-conversation presence as a 60-second lease.
- Account deletion is a backend-owned tombstone transaction: it scrubs the user, closes every conversation, deletes read-state metadata, emits participant/account deletion events, and disconnects all sockets for that identity. See `docs/DECISIONS.md`.

## Decisions

- 2026-08-29: Authentication state and user domain state have separate stores. Auth owns tokens and account selection; the user store owns profile snapshots and the current user. Cross-store login, switching, and logout updates remain centralized and React-batched in the session-transition boundary.
- 2026-08-29: Refreshing an existing user updates its stored profile in place. Account switching must not reorder the account picker; only adding a new account prepends a row.
- 2026-08-29: Incomplete secondary-account onboarding persists its previous-account return target. This prevents protected-route redirection from trapping an existing user while keeping first-account onboarding required.
- 2026-08-29: Standalone onboarding routing reacts to auth state, not onboarding step changes, so later steps are not replaced with Step 1. Removing the active account never implicitly activates the first saved credential: logout selects a remaining profile-complete account, or leaves incomplete accounts dormant and returns to Welcome when none is eligible.
- 2026-08-29: User search is Discover-owned UI state, not a native route presentation. Profile and chat use ordinary pushes, so iOS edge swipes and visible Back buttons traverse the same history and reveal the still-open search sheet without reconstructing or stacking modals.
- 2026-08-29: Multi-account support is device-local session orchestration, not a backend account-linking feature. Account switching must atomically reset account-scoped runtime state, and delayed 401 responses may invalidate only the token that issued their request.
- 2026-08-29: Deleted accounts retain only a tombstone row for message/conversation referential integrity. Conversations remain readable but permanently reject new messages, edits, replies, typing, and unsends.
- 2026-08-26: Notification response capture is independent of authentication. This preserves Android cold-start taps while still delaying protected navigation until auth and profile checks pass.
- 2026-08-26: Push suppression uses an exact conversation ID plus a renewable lease. Immediate blur/background events provide normal cleanup; expiry is the recovery path for missed events or stale sockets.
- 2026-08-27: Android backup/restore is disabled because persisted auth tokens and push-registration markers are security-sensitive and can be stale after reinstall.
- 2026-08-27: Push-token registration remains locally deduplicated; an app startup must not create a competing API request when the token is already registered.
- 2026-08-27: Cold-start notification responses use `Notifications.useLastNotificationResponse()` plus the live response listener. The hook's late transition from `undefined` to a response may override the already-selected Chats route; notification state never gates auth or API work.
- 2026-08-27: Notification hydration and API startup are independent lifecycles. Coupling them caused session hangs, and changing the global transport to work around that coupling caused request regressions.
- 2026-08-27: Core requests remain on the established Axios transport. Do not replace the app-wide transport as part of notification routing work without independent transport tests.
- 2026-08-28: Android's system-wide Private DNS can independently break native API traffic. On the Samsung test device, `dns.adguard.com` left authenticated requests pending, while temporarily disabling Private DNS made the real chat list load on the next cold launch. The diagnostic API warm-up did not help and was removed.

## API behavior

- `GET /users/search?q=<display-name>&limit=20` requires authentication, accepts 2–50 trimmed characters, returns at most 30 complete profiles, excludes the caller, and never returns email or private account fields. “Username” currently maps to the existing `displayName`; there is no separate username column.
- `GET /users/:id` requires authentication and no longer exposes email addresses.
- Message push payloads must include string `data.conversationId` and `data.recipientUserId` values.
- The Socket.IO client emits `active_conversation` with a conversation ID only while that route is focused and the app is active; it emits `null` otherwise.
- The backend suppresses a recipient push only when at least one authenticated socket has a fresh lease for that same conversation.
- `DELETE /me` tombstones the authenticated account and returns `{ success: true }`. Deleted sessions receive `401`; `GET /users/:id` returns an `isDeleted: true` tombstone; conversation participants expose `isDeleted`, and conversations expose `isReadOnly`.

## Next steps

- Deploy the sibling backend before testing cross-account notification taps, then verify add/login, add/register/onboarding, switching, per-account logout fallback, relaunch persistence, and notification routing on physical Android and iOS devices.
- Deploy the sibling backend together with the next Android app build; either half alone does not provide the full stale-presence guarantee.
- With an authenticated test account, verify Samsung autofill login plus notification display/tap routing in terminated, background, foreground-other-screen, foreground-same-chat, and locked-device states.

## Verification

- 2026-08-29: Account deletion passed backend Prisma formatting/generation/validation, TypeScript, and `git diff --check`; frontend TypeScript, targeted ESLint/Prettier, `git diff --check`, and Android production export also passed. Database migration and physical multi-device deletion/read-only-chat verification remain outstanding.
- 2026-08-29: Completed-only logout fallback and dormant incomplete-session persistence passed TypeScript, targeted ESLint/Prettier, `git diff --check`, and Android production export. Physical logout with only an incomplete saved account remaining is still outstanding.
- 2026-08-29: Discover-owned search-sheet navigation passed TypeScript, targeted ESLint/Prettier, `git diff --check`, and Android production export. Physical iOS verification of Profile edge-swipe → open search sheet remains outstanding.
- 2026-08-29: Logout fallback and onboarding step-loop fixes passed TypeScript, targeted ESLint/Prettier, `git diff --check`, and Android production export. Physical multi-account logout and Step 1→5 progression remain to be verified.
- 2026-08-29: Stable account ordering passed TypeScript, targeted ESLint/Prettier, and `git diff --check`; switching now updates the selected user in place instead of prepending it.
- 2026-08-29: Added-account onboarding escape passed TypeScript, targeted ESLint/Prettier, `git diff --check`, and an Android Expo production export. Physical Android/iOS registration, close, relaunch, and later incomplete-account switching remain outstanding.
- 2026-08-29: Auth/user store separation passed TypeScript, targeted ESLint/Prettier, `git diff --check`, and an Android Expo production export. Physical iOS/Android login, relaunch migration, account switching, and logout verification remains outstanding.
- 2026-08-29: Multi-account frontend passed TypeScript and targeted ESLint/Prettier; backend passed TypeScript, Prisma validation, targeted Prettier, and `git diff --check`. Per request, no Android build was produced. Physical Android/iOS modal, keyboard, switching, relaunch, and push-routing verification remains outstanding.
- 2026-08-29: Display-name search passed frontend TypeScript, targeted ESLint/Prettier, `git diff --check`, and an Android Expo production export. Backend TypeScript `--noEmit`, Prisma validation, Prettier, and `git diff --check` passed. Physical Android and iOS sheet/keyboard verification remains outstanding until the backend route is deployed.
- 2026-08-26: App `npx tsc --noEmit`, targeted ESLint, targeted Prettier, and `npx expo export --platform android` passed.
- 2026-08-26: Backend `npx tsc --noEmit`, targeted Prettier, and `git diff --check` passed.
- 2026-08-27: A production Android release built and installed successfully on a physical Samsung SM-A505FN. Preserved stale auth data returned 401 and recovered to Welcome instead of hanging; the packaged app has backup disabled.
- 2026-08-27: The Android cold-start notification routing fix passed TypeScript, targeted ESLint/Prettier, and a release assemble/install on the physical Samsung. A real terminated-state notification tap remains to be verified.
- 2026-08-27: The authentication cold-start timeout fix passed TypeScript, targeted ESLint/Prettier, release assemble, and install/launch on the physical Samsung. Credentialed login remains to be verified by the user.
- 2026-08-27: Direct `expo/fetch` API execution plus ordered notification/session startup passed TypeScript, targeted ESLint/Prettier, release assemble/install, and authenticated chats loading on the physical Samsung. A real terminated-notification tap remains to be verified.
- 2026-08-27: The authoritative async cold-start notification observer passed TypeScript, targeted ESLint/Prettier, release assemble, and install/launch on the physical Samsung. A real terminated-notification tap remains to be verified.
- 2026-08-27: After decoupling notification hydration and restoring Axios, TypeScript, targeted ESLint/Prettier, `git diff --check`, and production release assembly passed. The installed release loaded authenticated live chat data after three consecutive force-stop/cold-launch cycles on Samsung SM-A505FN; a real terminated-notification tap remains to be verified.
- 2026-08-27: The SDK 57 reactive cold-response observer passed TypeScript, targeted ESLint/Prettier, `git diff --check`, and production release assembly. Wireless ADB copied the APK, but Samsung's package-manager install stalled before updating the installed package; physical terminated-notification verification remains pending after install recovery.
- 2026-08-28: With Samsung Private DNS set to `dns.adguard.com`, the installed release remained on chat skeletons beyond 50 seconds. With Private DNS temporarily off, the same release loaded live chat data within 25 seconds. The device setting was restored to `hostname` / `dns.adguard.com` after the test. This isolates the intermittent Android failure to the device DNS/filtering path rather than auth, notification routing, or Render wake-up. The ineffective Android `/health` warm-up and shortened timeout were removed; iOS behavior remains unchanged.
