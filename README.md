# Expense Tracker

Expense Tracker is a learning project organised as an npm-workspaces monorepo.

| Path          | What it contains                                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/mobile` | Expo SDK 57 + React Native 0.86 app: Expo Router, TypeScript (strict), NativeWind 4 / Tailwind CSS 3, Firebase Auth/Firestore/Storage |
| `apps/api`    | Express 5 API: TypeScript (strict), PostgreSQL 18 via Docker Compose, Prisma ORM 7, Zod, Pino, Vitest                                 |

There is a single `package-lock.json` at the repository root. Always run `npm install` from the root.

Conventions are documented per workspace: [`apps/mobile/README.md`](apps/mobile/README.md) (folders, imports, styling, design tokens) and [`apps/api/README.md`](apps/api/README.md) (architecture, request flow, database, tests, security).

## Prerequisites (Windows)

| Tool             | Version / notes                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Node.js          | 24 LTS recommended. Supported: `^22.13.0` or `>=24.3.0`. Node 20 is end-of-life and no longer supported. Check with `node -v`.                   |
| npm              | Ships with Node.js (npm 10 or newer). Do not use Yarn, pnpm or Bun here: the lockfile is npm's.                                                  |
| Git              | Any recent version.                                                                                                                              |
| Docker Desktop   | Runs the local PostgreSQL databases (WSL 2 backend). Docker Desktop must be running before the `db:*` commands.                                  |
| Android Studio   | Installs the Android SDK, Platform Tools (`adb`), the bundled JDK 17 and the emulator. Create at least one virtual device in **Device Manager**. |
| `ANDROID_HOME`   | User environment variable pointing to the SDK, usually `%LOCALAPPDATA%\Android\Sdk`. Add `%ANDROID_HOME%\platform-tools` to `Path`.              |
| Firebase project | A Firebase web app configuration (API key, project ID, ...) with Email/Password authentication, Firestore and Storage enabled.                   |

Verify the tooling in a new PowerShell window:

```powershell
node -v
npm -v
docker version
docker compose version
adb version
$env:ANDROID_HOME
```

## First-time setup

```powershell
git clone https://github.com/Orgitogj/Expense-Tracker.git
cd Expense-Tracker
npm install
```

### Mobile app configuration

```powershell
Copy-Item apps/mobile/.env.example apps/mobile/.env
notepad apps/mobile/.env
```

Fill in every `EXPO_PUBLIC_FIREBASE_*` value from **Firebase console → Project settings → Your apps → Web app**. The app refuses to start if one of them is missing.

### API and database configuration

Create `apps/api/.env` with a random local database password (the same password is used in `POSTGRES_PASSWORD`, `DATABASE_URL` and `TEST_DATABASE_URL`):

```powershell
$password = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 24 | ForEach-Object { [char]$_ })
$example = Get-Content apps/api/.env.example -Raw
[IO.File]::WriteAllText("$PWD\apps\api\.env", $example.Replace("replace-with-a-local-password", $password))
```

Then start Docker Desktop and create the development database:

```powershell
npm run db:up
npm run api:prisma:generate
```

`db:up` waits until PostgreSQL reports healthy. The database listens only on `127.0.0.1:5433`, so it does not conflict with a PostgreSQL server installed directly on Windows (which normally uses port 5432).

## Running everything together

Use three PowerShell windows in the repository root.

```powershell
# 1. Database (once per session; it keeps running in Docker until you stop it)
npm run db:up

# 2. API with automatic restart on file changes
npm run api:dev

# 3. Mobile app (press "a" to open it on the Android emulator or device)
npm run mobile:start
```

Check the API:

```powershell
curl.exe http://127.0.0.1:3000/health
curl.exe http://127.0.0.1:3000/ready
```

`/health` answers `{"status":"ok"}` while the process runs. `/ready` answers `{"status":"ready"}` when the database is reachable and `503 {"status":"unavailable"}` when it is not.

Stop the API with `Ctrl+C` (it finishes in-flight requests and closes the database pool) and the database with `npm run db:stop`.

### Running the mobile app on Android

The app runs as a local native debug build (it is not tied to Expo Go).

1. Start an emulator from Android Studio's **Device Manager**, or connect a physical device with **USB debugging** enabled and accept the prompt on the phone. `adb devices` must list it as `device`.
2. Build, install and start the app (needed the first time and after adding or upgrading a native dependency):

   ```powershell
   npm run mobile:android
   ```

3. Day to day, start only the Metro dev server and open the installed app with `npm run mobile:start`. Press `a` in the terminal to open it on the connected Android device or emulator, `r` to reload, `j` to open the debugger.

After changing `.env`, `babel.config.js`, `metro.config.js` or `tailwind.config.js`, restart Metro with a clean cache:

```powershell
cd apps/mobile
npx expo start --clear
```

iOS builds require macOS and Xcode; `npm run mobile:ios` is kept for that case.

## Reaching the API from the mobile app

The mobile app does not call the API yet. `EXPO_PUBLIC_API_URL` in `apps/mobile/.env` is prepared for when it does. `localhost` inside an emulator or phone means the device itself, not your PC, so the URL depends on where the app runs:

| Where the app runs               | `EXPO_PUBLIC_API_URL`                                         | API `HOST` in `apps/api/.env` |
| -------------------------------- | ------------------------------------------------------------- | ----------------------------- |
| Android emulator                 | `http://10.0.2.2:3000`                                        | `127.0.0.1` (default)         |
| Android device over USB          | `http://localhost:3000` after `adb reverse tcp:3000 tcp:3000` | `127.0.0.1` (default)         |
| iOS simulator (macOS)            | `http://localhost:3000`                                       | `127.0.0.1` (default)         |
| Physical phone on the same Wi-Fi | `http://<your-PC-IPv4>:3000`                                  | `0.0.0.0`                     |

- `10.0.2.2` is the Android emulator's alias for the PC's `127.0.0.1`, so the API can keep listening on localhost only.
- A phone on Wi-Fi reaches the PC through the network, so the API must listen on all interfaces (`HOST=0.0.0.0`). Use this only on a trusted home network and switch back to `127.0.0.1` afterwards.
- `adb reverse` forwards the phone's port 3000 to the PC over USB and must be repeated after reconnecting the device. It avoids all network and firewall setup, so prefer it for USB-connected phones.

### Physical phone over Wi-Fi

1. Find the PC's address: run `ipconfig` and use the **IPv4 Address** of the Wi-Fi adapter (not `vEthernet`, VirtualBox or other virtual adapters).
2. Make sure Windows treats your home Wi-Fi as **Private**: **Settings → Network & internet → Wi-Fi → (your network) → Network profile type → Private**. Windows blocks incoming connections on **Public** networks, and you should not open ports there.
3. Allow the API port for private networks on the local subnet only. In PowerShell **as Administrator**:

   ```powershell
   New-NetFirewallRule -DisplayName "Expense Tracker API (dev)" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3000 -Profile Private -RemoteAddress LocalSubnet
   ```

   If Windows shows a firewall prompt for Node.js when the API starts on `0.0.0.0`, allow it for **private** networks only.

4. Set `HOST=0.0.0.0` in `apps/api/.env`, restart the API, and set `EXPO_PUBLIC_API_URL=http://<PC-IPv4>:3000` in `apps/mobile/.env`.
5. Open `http://<PC-IPv4>:3000/health` in the phone's browser; it must show `{"status":"ok"}`.

When you are done, set `HOST` back to `127.0.0.1` and remove the rule:

```powershell
Remove-NetFirewallRule -DisplayName "Expense Tracker API (dev)"
```

Only the API is opened this way. PostgreSQL is published on `127.0.0.1` only (`compose.yaml`), so it stays unreachable from the network whatever `HOST` is set to. Never add firewall rules for ports 5433 or 5434.

- Restart Metro after changing `EXPO_PUBLIC_API_URL`.
- Plain `http://` works only in development builds. Production apps must use an `https://` API.

Firebase Authentication stays in the mobile app. When protected endpoints are added, the app will send the user's Firebase ID token and the API must verify it on every request and enforce data ownership on the server (see [`apps/api/README.md`](apps/api/README.md)).

## Database

| Command                | What it does                                                                           |
| ---------------------- | -------------------------------------------------------------------------------------- |
| `npm run db:up`        | Starts the development database (`127.0.0.1:5433`) and waits until it is healthy       |
| `npm run db:stop`      | Stops the database containers. Data is kept.                                           |
| `npm run db:down`      | Removes the containers and network. Data is kept in the named volume.                  |
| `npm run db:logs`      | Follows the database logs                                                              |
| `npm run db:test:up`   | Starts the separate test database (`127.0.0.1:5434`, in memory, for integration tests) |
| `npm run db:test:down` | Stops and removes the test database container (its data is discarded)                  |

Development data lives in the Docker volume `expense-tracker_postgres_data`. **Removing that volume deletes all development data permanently**, for example `docker compose -f apps/api/compose.yaml down -v` or `docker volume rm expense-tracker_postgres_data`. None of the scripts do this.

## Scripts

Run these from the repository root. They delegate to the workspaces.

| Command                             | What it does                                                          |
| ----------------------------------- | --------------------------------------------------------------------- |
| `npm run mobile:start`              | Starts the Expo dev server (Metro) for the mobile app                 |
| `npm run mobile:android`            | Builds and installs the Android debug app, then starts Metro          |
| `npm run mobile:ios`                | Same for iOS (macOS only)                                             |
| `npm run mobile:web`                | Starts the web version                                                |
| `npm run mobile:test`               | Mobile component tests (Jest + React Native Testing Library)          |
| `npm run mobile:bundle`             | Builds the Android and iOS JavaScript bundles into `apps/mobile/dist` |
| `npm run api:dev`                   | Starts the API with automatic restart                                 |
| `npm run api:build`                 | Generates the Prisma Client and compiles the API to `dist/`           |
| `npm run api:start`                 | Runs the compiled API                                                 |
| `npm run api:test`                  | API unit and HTTP tests (no database needed)                          |
| `npm run api:test:integration`      | API tests against the test database (`db:test:up` first)              |
| `npm run api:prisma:validate`       | Validates the Prisma schema                                           |
| `npm run api:prisma:generate`       | Generates the Prisma Client                                           |
| `npm run api:prisma:migrate:dev`    | Creates and applies a migration in development                        |
| `npm run api:prisma:migrate:deploy` | Applies pending migrations without resetting data                     |
| `npm run api:prisma:migrate:status` | Shows the migration status                                            |
| `npm run typecheck`                 | TypeScript (strict) in every workspace                                |
| `npm run lint`                      | ESLint in every workspace                                             |
| `npm run test`                      | Mobile tests and API unit tests                                       |
| `npm run format`                    | Formats files with Prettier in every workspace                        |
| `npm run format:check`              | Checks formatting without writing                                     |
| `npm run check`                     | `typecheck`, `lint`, `test`, then `format:check`                      |

Expo-specific checks are run from `apps/mobile`:

```powershell
cd apps/mobile
npx expo install --check
npx expo-doctor
npx expo config --type public
```

## Continuous integration

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on every pull request to `main`, every push to `main`, and manually from **Actions → CI → Run workflow**. It has read-only repository permissions, uses no secrets, and cancels an older run when a newer commit arrives for the same pull request or branch. Each job checks out the code, installs the Node.js version from [`.nvmrc`](.nvmrc) and runs `npm ci` from the root lockfile (npm downloads are cached by the lockfile hash). Nothing is deployed, published, uploaded or released.

| Check (job name)                  | What it verifies                                                                                                     | Run it locally                                            |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `Format`                          | Prettier formatting in every workspace                                                                               | `npm run format:check`                                    |
| `Lint`                            | ESLint for mobile (`expo lint`) and API                                                                              | `npm run lint`                                            |
| `Typecheck`                       | TypeScript strict for mobile and API (generates the Prisma Client first)                                             | `npm run typecheck`                                       |
| `Mobile tests`                    | Jest + React Native Testing Library component tests                                                                  | `npm run mobile:test`                                     |
| `API tests`                       | Vitest unit and HTTP tests without a database                                                                        | `npm run api:test`                                        |
| `API integration (PostgreSQL)`    | Readiness and query timeouts against a disposable PostgreSQL 18 service container                                    | `npm run db:test:up`, then `npm run api:test:integration` |
| `API build`                       | Prisma schema validation, Prisma Client generation and the production TypeScript build                               | `npm run api:prisma:validate`, then `npm run api:build`   |
| `Mobile JS bundle (Android, iOS)` | Metro + Hermes JavaScript bundles for Android and iOS (`expo export`), written to the git-ignored `apps/mobile/dist` | `npm run mobile:bundle`                                   |

`npm run check` runs `Format`, `Lint`, `Typecheck`, `Mobile tests` and `API tests` locally in one command.

- **The JS bundle check is not a native build.** It proves that Metro can resolve, transform and bundle all JavaScript for both platforms. It does not compile the Android or iOS projects, link native modules, sign anything or produce an installable app.
- **Database in CI.** The integration job starts `postgres:18-alpine` (the same major as development) as a service container with throwaway credentials (`ci` / `ci`, database `expense_tracker_test`) and a `pg_isready` healthcheck. Checked-in migrations are applied with `prisma migrate deploy` only when `apps/api/prisma/migrations` contains `migration.sql` files. Until the first model exists, the tests verify connectivity and timeouts without creating any tables. CI never connects to a deployed database.
- **No Firebase in CI.** Mobile tests run with `jest.setup.js`, which replaces `@/lib/firebase` with inert objects, so tests cannot reach Firebase. The bundle job needs no Firebase values because bundling does not execute app code.
- **Pinned actions.** Actions are pinned to commit SHAs: `actions/checkout` v7.0.1 = `3d3c42e5aac5ba805825da76410c181273ba90b1`, `actions/setup-node` v7.1.0 = `949feb2413d6458794dcd2491c4babbbce0c15c1` (used in `.github/actions/setup/action.yml`). To update one, look up the new release's commit SHA on GitHub and replace it everywhere it appears.
- **Mobile tests** live in `__tests__` folders next to the code they test (never inside `src/app`, because Expo Router treats every file there as a route) and import `describe`, `it`, `expect` and `jest` from `@jest/globals`.

### What still needs a manual device test

CI cannot run the app. Test these on an emulator or phone before merging changes that affect them: the native Android build (`npm run mobile:android`), sign-in, registration, email verification and profile editing against Firebase, image picking and permissions, navigation and layout on real screen sizes, and reaching the API from a device.

### Making the checks required on `main`

GitHub only offers a check as "required" after it has run at least once, so do this after the first pull request with this workflow has finished its CI run:

1. Open the repository on GitHub → **Settings → Rules → Rulesets → New ruleset → New branch ruleset**.
2. Name it `Protect main`, set **Enforcement status** to **Active**, and under **Target branches** choose **Add target → Include default branch**.
3. Enable **Require a pull request before merging**.
4. Enable **Require status checks to pass**, click **Add checks**, and add each job name from the table above: `Format`, `Lint`, `Typecheck`, `Mobile tests`, `API tests`, `API integration (PostgreSQL)`, `API build`, `Mobile JS bundle (Android, iOS)`. Optionally enable **Require branches to be up to date before merging**.
5. Enable **Block force pushes**, then **Create**.

Required checks are matched by job name, so if a job's `name:` changes in `ci.yml`, update the ruleset as well.

## Environment variables and secrets

- The mobile app reads `apps/mobile/.env`. Only variables prefixed with `EXPO_PUBLIC_` reach the app, and they are embedded in the JavaScript bundle, so anyone with the app can read them.
- Firebase web config values are designed to be public; access is protected by Firebase Security Rules.
- The API and Docker Compose read `apps/api/.env`. Database credentials, Firebase Admin/service-account keys and any other server secrets belong there and nowhere else. Never put them in an `EXPO_PUBLIC_` variable or in `apps/mobile/.env`.
- `.env` and `.env.*` files are ignored by Git. Only `.env.example` files with placeholders are committed.

## Troubleshooting

- **`failed to connect to the docker API`.** Docker Desktop is not running. Start it, wait until it reports that the engine is running, then retry.
- **`Set POSTGRES_PASSWORD in apps/api/.env`.** `apps/api/.env` is missing or incomplete; create it as described in the first-time setup.
- **Port 5433 or 5434 is already in use.** Change `POSTGRES_PORT` / `POSTGRES_TEST_PORT` in `apps/api/.env` and the port in `DATABASE_URL` / `TEST_DATABASE_URL` to match, then run `npm run db:up` again.
- **`/ready` returns 503.** The database is not running or `DATABASE_URL` does not match the `POSTGRES_*` values. Run `npm run db:up` and check `npm run db:logs`.
- **`Invalid environment configuration` when the API starts.** The message names the invalid variable in `apps/api/.env`.
- **Android build fails with paths from the old repository layout.** The generated `apps/mobile/android` folder is not committed. Regenerate it from `apps/mobile` with `npx expo prebuild --platform android --clean`, then run `npm run mobile:android` again.
- **Styles from `className` do not apply.** Restart Metro with `npx expo start --clear` from `apps/mobile`.
- **`Missing Firebase configuration: ...` on startup.** A value in `apps/mobile/.env` is empty; fill it in and restart Metro.
- **`adb` is not recognised.** `%ANDROID_HOME%\platform-tools` is missing from `Path`; reopen PowerShell after fixing it.
