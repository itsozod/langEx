# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## Android physical-device UI quality gate

Treat Android emulator output as insufficient proof for keyboard, safe-area, font-icon, and
inverted-list behavior. Before considering related UI work complete:

- Check layouts against a physical Android device when one is available. If none is connected,
  explicitly report that physical-device verification is still outstanding.
- For chat and other bottom inputs, preserve `android:windowSoftInputMode="adjustResize"` and use
  the SDK 57-compatible keyboard controller. Calculate `keyboardVerticalOffset` from the input
  container's real distance from the top of the screen, including safe-area/status-bar inset and
  custom header height. Never assume an offset of `0` when a header exists.
- Test the keyboard both closed and open, including keyboards with suggestion/tool rows and gesture
  navigation. The composer and send button must remain fully visible above the keyboard.
- Import Expo symbols through `@/shared/components/ui/symbol-view`, never directly from
  `expo-symbols`. Android symbols are font glyphs with device-dependent baselines; keep corrections
  centralized and do not add scattered `marginTop` fixes.
- Give icon buttons explicit square dimensions plus `alignItems: 'center'` and
  `justifyContent: 'center'`. Verify the empty/loading/disabled variants, not only the normal icon.
- In inverted lists such as Gifted Chat, verify empty states separately on Android and iOS. Do not
  apply a shared `scaleY: -1` correction: Android and iOS can invert empty content differently.
- Check narrow Android widths, large font scale, light/dark themes, no-avatar placeholders, loading
  indicators, and system navigation insets for every new or changed screen.
- Run TypeScript, formatting, and targeted lint checks for every affected file before handoff.
