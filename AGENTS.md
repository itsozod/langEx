# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## Screen architecture and file-size limits

- Keep files under `src/app` as thin Expo Router entries. They may read route parameters and compose
  a screen, but feature UI, networking, socket behavior, form logic, and large styles belong under
  the matching `src/screens/<feature>` folder. Prefer a one-line re-export when no route-only logic
  is needed.
- Do not allow a handwritten source file to grow beyond 400 lines. Start extracting before 300
  lines rather than waiting for the hard limit. Generated files and static data tables are the only
  exceptions, and the reason must be documented in the file.
- Organize each screen feature into focused `components/`, `hooks/`, `utils/`, and `styles/`
  directories when those responsibilities exist. Keep API functions and domain types in the feature
  folder as well. Shared cross-feature code still belongs under `src/shared`.
- A refactor is not complete if it only moves one oversized route into one oversized screen file.
  Separate rendering, server/socket lifecycle, stateful actions, pure transformations, and styles
  into independently readable modules with narrow typed props.
- Components should render one coherent UI responsibility. Hooks should own one stateful domain or
  side-effect lifecycle. Utilities must be pure where practical. Avoid circular feature imports and
  do not place feature-specific code in global shared folders merely to shorten a file.
- Before handoff, report the largest affected handwritten file and verify route files remain thin.
  Run TypeScript, targeted lint, formatting, and a platform bundle/build check after structural
  refactors.

## iOS and Android physical-device UI quality gate

Treat simulator/emulator output as insufficient proof for keyboard, safe-area, font-icon, and
inverted-list behavior. Before considering related UI work complete:

- Check layouts on physical Android and iOS devices when they are available. If either platform is
  unavailable, explicitly report which physical-device verification is still outstanding.
- Every screen containing an input must use keyboard-aware layout behavior on both platforms.
  Never use `behavior={undefined}` for Android. Multi-field forms must use
  `KeyboardAwareScrollView` from `react-native-keyboard-controller`, not a plain `ScrollView`
  wrapped in React Native's `KeyboardAvoidingView`. Their primary submit/save/next action must
  remain fully visible and tappable while the final input is focused.
- Keep exactly one `KeyboardProvider` at the app root. Do not add nested providers. For forms whose
  button follows the final input, set a measured `bottomOffset` large enough for the remaining gap,
  helper/error content, and the full button height. Use `mode="layout"` when the form relies on flex
  positioning. Use `keyboardShouldPersistTaps="always"`, `interactive` dismissal on iOS, and
  `on-drag` dismissal on Android.
- Preserve both `android.softwareKeyboardLayoutMode: "resize"` in Expo config and
  `android:windowSoftInputMode="adjustResize"` in the generated/native manifest. Recheck both after
  Expo prebuilds or SDK upgrades.
- Test login, registration, password reset, onboarding, profile editing, chat, and any new form with
  the keyboard open and closed. Include multiline inputs, validation errors that increase layout
  height, Samsung Keyboard and Gboard suggestion/tool rows, iOS predictive text, and gesture
  navigation/home indicators. A short emulator keyboard is not proof that the submit button will
  remain visible on a physical Android device.
- For chat and other bottom inputs, preserve `android:windowSoftInputMode="adjustResize"` and use
  the SDK 57-compatible keyboard controller. Calculate `keyboardVerticalOffset` from the input
  container's real distance from the top of the screen, including safe-area/status-bar inset and
  custom header height. Never assume an offset of `0` when a header exists.
- The chat composer and send button must remain fully visible above every keyboard variant on both
  platforms. Avoid nested keyboard providers and account for custom headers explicitly.
- Import symbols through `@/shared/components/ui/symbol-view`, never directly from `expo-symbols`
  or `lucide-react-native` in screens. The shared component must keep native SF Symbols on iOS and
  SVG Lucide icons on Android. Every new Android symbol name must be added to its centralized SVG
  map before use.
- Do not restore Expo's font-based Material Symbol renderer on Android. Font glyph baselines and
  padding differ across Android versions and manufacturers, so `translateY`, `marginTop`,
  `lineHeight`, or per-screen optical offsets are forbidden icon-centering fixes.
- Give icon buttons explicit square dimensions plus `alignItems: 'center'` and
  `justifyContent: 'center'`. Keep the Android SVG inside an explicit square view box. Verify back,
  theme, camera, send, tab, empty/loading/disabled, and no-avatar variants—not only one normal icon.
- In inverted lists such as Gifted Chat, verify empty states separately on Android and iOS. Do not
  apply a shared `scaleY: -1` correction: Android and iOS can invert empty content differently.
- Check narrow Android widths, large font scale, light/dark themes, no-avatar placeholders, loading
  indicators, and system navigation insets for every new or changed screen.
- Run TypeScript, formatting, and targeted lint checks for every affected file before handoff.
