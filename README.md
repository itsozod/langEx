# LangEx mobile app

LangEx is a language-exchange app for discovering language partners and communicating through realtime direct messages. This repository contains the Expo/React Native client for Android and iOS.

Current app version: **1.1.0**

## Features

- Email authentication and profile onboarding
- Language-partner discovery and display-name search
- Realtime direct messaging with replies, edits, unsend, typing, and read state
- Push notifications with active-conversation suppression
- Multiple saved accounts with isolated sessions
- Profile and avatar management
- Light and dark themes
- Account deletion with retained, read-only conversation history

## Technology

- Expo SDK 57, React Native 0.86, React 19, and TypeScript
- Expo Router for file-based navigation
- TanStack React Query for server state
- Zustand and AsyncStorage for persistent client state
- Axios for HTTP and Socket.IO for realtime communication
- React Hook Form and Zod for forms and validation
- Tamagui for the UI system

The API, PostgreSQL database, push delivery, and realtime server live in the separate `langEx-backend` repository.

## Requirements

- Node.js and npm
- Android Studio and the Android SDK for Android development
- macOS and Xcode for iOS development
- A running LangEx backend or access to its deployed API

This project contains native configuration and a custom Android networking plugin. Use a development build for full functionality; Expo Go is not the primary development environment.

## Setup

Install dependencies:

```bash
npm install
```

Optionally configure the API URL in an ignored `.env.local` file:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

API URL defaults when the variable is absent:

- Android emulator: `http://10.0.2.2:3000`
- iOS simulator and web: `http://localhost:3000`
- Physical device: set `EXPO_PUBLIC_API_URL` to a backend address reachable from the device, normally the development computer's LAN IP or an HTTPS deployment.

Values prefixed with `EXPO_PUBLIC_` are embedded in the app bundle. Never place secrets in them.

## Development

Start the Expo development server:

```bash
npm start
```

Build and run the native apps:

```bash
npm run android
npm run ios
```

Run quality checks:

```bash
npm run lint
npm run format:check
npx tsc --noEmit
```

Final keyboard, safe-area, notification, icon, and chat behavior must be checked on physical Android and iOS devices. Simulator and emulator output alone is not acceptance evidence for those areas.

## Release builds

Local release scripts read `EXPO_PUBLIC_API_URL` from the ignored `.env.production.local` file and require an HTTPS URL.

```bash
npm run android:release
npm run android:release:install
npm run ios:release
```

- `android:release` creates a shareable release APK.
- `android:release:install` builds, installs, and launches it on one connected Android device.
- `ios:release` requires macOS and Xcode and creates a release build for a selected physical device.

## Versioning

LangEx uses semantic versioning. The npm lifecycle synchronizes the version from `package.json` into `app.json` before creating the release commit and Git tag.

```bash
npm run version:patch
npm run version:minor
npm run version:major
```

Use a patch release for compatible fixes, a minor release for compatible features, and a major release for intentionally breaking product or compatibility changes.

## Project structure

```text
src/app/       Thin Expo Router entries and layouts
src/screens/   Feature screens, components, hooks, APIs, and state
src/shared/    Shared UI, networking, stores, constants, and utilities
src/providers/ Application-wide providers
plugins/       Expo config plugins and native build customization
scripts/       Versioning and local release automation
docs/          Architecture, decisions, current context, and handoff state
```

Store modules use kebab-case names ending in `-store.ts`, such as `chat-store.ts`. Detailed development conventions live in [`AGENTS.md`](./AGENTS.md).

## Documentation

- [`docs/project-context.md`](./docs/project-context.md) — concise entry point for a fresh development context
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — application boundaries and data flow
- [`docs/DECISIONS.md`](./docs/DECISIONS.md) — durable architectural decisions
- [`docs/CONTEXT.md`](./docs/CONTEXT.md) — current behavior, constraints, verification, and next steps
- [`AGENTS.md`](./AGENTS.md) — mandatory repository and physical-device development rules
