# Google authentication setup

The app and API code are ready for Google authentication, but every installable build must be tied
to OAuth credentials owned by the LangEx Google Cloud project. OAuth client IDs are public
configuration; never add a client secret or service-account JSON to the mobile app.

## Google Cloud credentials

Create these OAuth 2.0 client IDs in one Google Cloud project:

1. A **Web application** client. Its client ID is the server client ID used to mint the ID token.
2. An **iOS** client for bundle ID `com.ozod2905.langEx`.
3. An **Android** client for package `com.ozod2905.langEx`, with the SHA-1 fingerprints for every
   development and production signing certificate that will install the app.

Configure the OAuth consent screen before testing with accounts outside the project's test-user
list.

## Mobile build environment

Set both variables in the local/EAS build environment:

```dotenv
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=000000000000-example.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=000000000000-example.apps.googleusercontent.com
```

`app.config.ts` derives the reversed iOS URL scheme and enables the native config plugin only when
the iOS client ID exists. After adding or changing either ID, regenerate/rebuild the native app:

```sh
npx expo prebuild
npx expo run:ios
npx expo run:android
```

Google sign-in is native code and does not run in Expo Go. Use a development build or release
build. The auth screen safely falls back to email authentication when the installed binary does
not contain the native module, but Google itself becomes available only after rebuilding. Do not
commit generated credentials containing secrets.

## Backend environment

Set the accepted token audiences on the backend. A comma-separated list allows tokens minted for
both native platforms:

```dotenv
GOOGLE_CLIENT_IDS=web-client-id.apps.googleusercontent.com,ios-client-id.apps.googleusercontent.com
```

`GOOGLE_WEB_CLIENT_ID` is also accepted for a single web/server audience. Deploy migration
`20261010200000_add_google_auth` before enabling the mobile button.

## Verification checklist

- New Google account creates a LangEx user and continues to onboarding.
- Returning Google account enters the existing account directly.
- Account picker and cancellation behave correctly on physical Android and iOS devices.
- A Google account whose verified email is already used by an active password account links to and
  signs in to that same LangEx user without creating a duplicate profile.
- Invalid, expired, wrong-audience, and unverified-email tokens are rejected by the backend.
- Deleted Google accounts cannot reuse an old LangEx session and can create a fresh account only
  after the deletion transaction removes the old provider identity.
