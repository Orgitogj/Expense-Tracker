# Expense Tracker

Expense Tracker is a learning project organised as an npm-workspaces monorepo.

| Path          | What it contains                                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/mobile` | Expo SDK 57 + React Native 0.86 app: Expo Router, TypeScript (strict), NativeWind 4 / Tailwind CSS 3, Firebase Auth/Firestore/Storage |
| `apps/api`    | Reserved for the upcoming Express API (PostgreSQL + Prisma). It has not been created yet.                                             |

There is a single `package-lock.json` at the repository root. Always run `npm install` from the root.

Mobile code conventions (folders, imports, styling, design tokens) are documented in [`apps/mobile/README.md`](apps/mobile/README.md).

## Prerequisites (Windows)

| Tool             | Version / notes                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Node.js          | 24 LTS recommended. Supported: `^20.19.4`, `^22.13.0`, `>=24.3.0` (React Native 0.86 requirement). Check with `node -v`.                         |
| npm              | Ships with Node.js (npm 10 or newer). Do not use Yarn, pnpm or Bun here: the lockfile is npm's.                                                  |
| Git              | Any recent version.                                                                                                                              |
| Android Studio   | Installs the Android SDK, Platform Tools (`adb`), the bundled JDK 17 and the emulator. Create at least one virtual device in **Device Manager**. |
| `ANDROID_HOME`   | User environment variable pointing to the SDK, usually `%LOCALAPPDATA%\Android\Sdk`. Add `%ANDROID_HOME%\platform-tools` to `Path`.              |
| Firebase project | A Firebase web app configuration (API key, project ID, ...) with Email/Password authentication, Firestore and Storage enabled.                   |

Verify the Android tooling in a new PowerShell window:

```powershell
node -v
npm -v
adb version
$env:ANDROID_HOME
```

## First-time setup

```powershell
git clone https://github.com/Orgitogj/Expense-Tracker.git
cd Expense-Tracker
npm install
Copy-Item apps/mobile/.env.example apps/mobile/.env
notepad apps/mobile/.env
```

Fill in every `EXPO_PUBLIC_FIREBASE_*` value from **Firebase console → Project settings → Your apps → Web app**. The app refuses to start if one of them is missing.

## Running the app on Android

The app runs as a local native debug build (it is not tied to Expo Go).

1. Start an emulator from Android Studio's **Device Manager**, or connect a physical device with **USB debugging** enabled and accept the prompt on the phone. `adb devices` must list it as `device`.
2. Build, install and start the app (needed the first time and after adding or upgrading a native dependency):

   ```powershell
   npm run mobile:android
   ```

3. Day to day, start only the Metro dev server and open the installed app:

   ```powershell
   npm run mobile:start
   ```

   Press `a` in the terminal to open it on the connected Android device or emulator, `r` to reload, `j` to open the debugger.

After changing `.env`, `babel.config.js`, `metro.config.js` or `tailwind.config.js`, restart Metro with a clean cache:

```powershell
cd apps/mobile
npx expo start --clear
```

iOS builds require macOS and Xcode; `npm run mobile:ios` is kept for that case.

## Scripts

Run these from the repository root. They delegate to the workspaces.

| Command                  | What it does                                                 |
| ------------------------ | ------------------------------------------------------------ |
| `npm run mobile:start`   | Starts the Expo dev server (Metro) for the mobile app        |
| `npm run mobile:android` | Builds and installs the Android debug app, then starts Metro |
| `npm run mobile:ios`     | Same for iOS (macOS only)                                    |
| `npm run mobile:web`     | Starts the web version                                       |
| `npm run typecheck`      | TypeScript (strict) in every workspace                       |
| `npm run lint`           | ESLint in every workspace                                    |
| `npm run format`         | Formats files with Prettier in every workspace               |
| `npm run format:check`   | Checks formatting without writing                            |
| `npm run check`          | `typecheck`, then `lint`, then `format:check`                |

Expo-specific checks are run from `apps/mobile`:

```powershell
cd apps/mobile
npx expo install --check
npx expo-doctor
npx expo config --type public
```

## Environment variables and secrets

- The mobile app reads `apps/mobile/.env`. Only variables prefixed with `EXPO_PUBLIC_` reach the app, and they are embedded in the JavaScript bundle, so anyone with the app can read them.
- Firebase web config values are designed to be public; access is protected by Firebase Security Rules.
- Never put server credentials (database URLs, Firebase Admin/service-account keys, JWT secrets, API secrets) in an `EXPO_PUBLIC_` variable or in `apps/mobile/.env`. Those belong to the future API in its own, ignored `.env` file.
- `.env` and `.env.*` files are ignored by Git. Only `.env.example` files with empty placeholders are committed.

## Troubleshooting

- **Android build fails with paths from the old repository layout.** The generated `apps/mobile/android` folder is not committed. Regenerate it from `apps/mobile` with `npx expo prebuild --platform android --clean`, then run `npm run mobile:android` again.
- **Styles from `className` do not apply.** Restart Metro with `npx expo start --clear` from `apps/mobile`.
- **`Missing Firebase configuration: ...` on startup.** A value in `apps/mobile/.env` is empty; fill it in and restart Metro.
- **`adb` is not recognised.** `%ANDROID_HOME%\platform-tools` is missing from `Path`; reopen PowerShell after fixing it.
