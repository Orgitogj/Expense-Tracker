# API (`@expense-tracker/api`)

Express 5, TypeScript (strict, native ES modules), PostgreSQL 18, Prisma ORM 7 with the `pg` driver adapter, Zod, Pino, Vitest and Supertest.

First-time setup and the commands for running the whole project are in the [root README](../../README.md). This document describes how the API is built.

## Folder structure

```text
apps/api/
├── compose.yaml           Local PostgreSQL (development + test databases)
├── prisma7.config.ts      Prisma CLI configuration (schema path, migrations path, DATABASE_URL)
├── prisma/
│   ├── schema.prisma      Generator + datasource. No models yet.
│   └── migrations/        Created by the first `prisma migrate dev`
├── src/
│   ├── index.ts           Entry point: loads config, creates logger + Prisma, starts the server, handles signals
│   ├── app.ts             createApp(): builds the Express app from its dependencies (no listening)
│   ├── server.ts          listen() and graceful shutdown helpers
│   ├── config/            Environment validation (Zod)
│   ├── lib/               Shared infrastructure: logger, Prisma client factory, HttpError
│   ├── middleware/        Request logging, 404 and error handling
│   ├── modules/           Feature modules (currently only `health`)
│   └── generated/prisma/  Generated Prisma Client (git-ignored, created by `prisma generate`)
└── test/
    ├── unit/              Fast tests, no database, no network
    └── integration/       Tests against the dedicated test PostgreSQL database
```

`createApp()` receives its dependencies (configuration, logger, Prisma client) instead of creating them, so tests can build the app with a fake or a test database and call it with Supertest without opening a port.

## Request flow for future modules

```text
Route → validation / auth middleware → Controller → Service → Prisma
```

| Layer      | File                     | Responsibility                                                                   |
| ---------- | ------------------------ | -------------------------------------------------------------------------------- |
| Route      | `<module>.routes.ts`     | Maps HTTP method + path to middleware and controller functions                   |
| Middleware | `src/middleware/`        | Cross-cutting checks: Firebase token verification, request validation with Zod   |
| Controller | `<module>.controller.ts` | Reads the validated request, calls the service, chooses the status code and JSON |
| Service    | `<module>.service.ts`    | Business rules and database access through Prisma; knows nothing about Express   |
| Prisma     | `src/lib/prisma.ts`      | The single shared `PrismaClient`, injected from `src/index.ts`                   |

`src/modules/health` follows this flow and is the reference for new modules. Create a module folder (for example `src/modules/wallets/`) only when you implement that feature, and mount its router in `src/app.ts`.

Throw `HttpError` from `src/lib/http-error.ts` for expected failures, such as `new HttpError(404, "Wallet not found")`. The central error handler returns the message of 4xx errors and replaces 5xx errors and unexpected exceptions with a generic message, so internal details never reach clients. Errors are logged with their stack on the server.

## Security notes

- **Authentication stays in Firebase.** The mobile app signs users in with Firebase Authentication. Every future protected endpoint must verify the Firebase ID token sent in `Authorization: Bearer <token>` on the server (Firebase Admin SDK, `verifyIdToken`) before running any controller. Never trust a user ID sent in the body or URL.
- **Enforce ownership in the service layer.** Queries must be scoped to the verified user ID (for example `where: { id, userId }`), so one user can never read or change another user's data.
- **CORS is not access control.** It only tells browsers which web origins may read responses; mobile apps and scripts ignore it. `CORS_ORIGINS` lists the web origins allowed to call the API (for example Expo web on `http://localhost:8081`).
- Firebase Admin credentials, database URLs and other secrets belong only in the API's environment. They must never be added to the mobile app or to an `EXPO_PUBLIC_` variable.

## Configuration

Copy `.env.example` to `.env` (git-ignored). Every value is validated at startup by `src/config/env.ts`; the API refuses to start with an invalid configuration, and the error names the variable without printing its value.

| Variable                    | Default       | Purpose                                                                                                                                                   |
| --------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NODE_ENV`                  | `development` | `development` enables readable logs; use `production` in deployments                                                                                      |
| `HOST`                      | `127.0.0.1`   | Interface the API listens on. `0.0.0.0` is needed for physical phones (see the root README)                                                               |
| `PORT`                      | `3000`        | HTTP port                                                                                                                                                 |
| `LOG_LEVEL`                 | `info`        | `fatal`, `error`, `warn`, `info`, `debug`, `trace` or `silent`                                                                                            |
| `CORS_ORIGINS`              | (empty)       | Comma-separated web origins allowed by CORS                                                                                                               |
| `BODY_LIMIT`                | `100kb`       | Maximum JSON request body                                                                                                                                 |
| `DATABASE_URL`              | (required)    | PostgreSQL connection URL used by the API and the Prisma CLI                                                                                              |
| `DATABASE_POOL_MAX`         | `10`          | Maximum connections in the shared pool                                                                                                                    |
| `DATABASE_QUERY_TIMEOUT_MS` | `30000`       | Longest any query may run: PostgreSQL cancels it (`statement_timeout`), and the client gives up 1 s later if the server does not answer (`query_timeout`) |
| `READINESS_TIMEOUT_MS`      | `2000`        | How long `/ready` waits before answering 503                                                                                                              |
| `SHUTDOWN_TIMEOUT_MS`       | `10000`       | How long shutdown waits for in-flight requests before closing connections                                                                                 |
| `POSTGRES_*`                | see example   | Used only by Docker Compose to create the local databases                                                                                                 |
| `TEST_DATABASE_URL`         | (tests only)  | Integration-test database. Must be local and its name must end with `_test`                                                                               |

`DATABASE_URL` and `TEST_DATABASE_URL` must use the same user, password and ports as the `POSTGRES_*` values.

## Endpoints

| Endpoint      | Meaning                                                                                                                             |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `GET /health` | Liveness: the process is running. Never touches the database. Always `200 {"status":"ok"}`.                                         |
| `GET /ready`  | Readiness: runs `SELECT 1`. `200 {"status":"ready"}`, or `503 {"status":"unavailable"}` on failure or after `READINESS_TIMEOUT_MS`. |

During a database outage, concurrent and repeated `/ready` calls share one in-flight `SELECT 1` instead of starting a new query each time, so readiness probes use at most one pool connection and can never exhaust the pool. Answering 503 after `READINESS_TIMEOUT_MS` does not cancel that query; it ends through the database query timeout (`DATABASE_QUERY_TIMEOUT_MS`), after which the next probe starts a fresh check. If the server stops answering entirely, the client-side timeout fails the query and the pool discards that connection.

Unknown routes return `404 {"error":{"message":"Not Found"}}`.

## Logging

Pino writes structured JSON (pretty-printed when `NODE_ENV=development`). Request logs contain only the request ID, method, path without query string, status code and duration. Headers, bodies and query strings are never logged, and fields such as `authorization`, `password`, `token`, `idToken` and `connectionString` are redacted if they ever reach a log call. Successful `/health` and `/ready` probes are not logged.

## Database and Prisma

- **One client, one pool.** `src/index.ts` creates a single `PrismaClient` through `createPrismaClient()`. `createPrismaClient()` passes `pg` pool options (not a `Pool` instance) to `@prisma/adapter-pg`, so the adapter creates and owns the pool: it is created on the first query, reused for the client's lifetime, and closed by `prisma.$disconnect()` during shutdown. In Prisma 7, pool settings come from the driver and are passed to the adapter; URL parameters such as `connection_limit` or `pool_timeout` no longer apply. The adapter's driver defaults include no connection timeout at all, so the API sets explicit limits: `DATABASE_POOL_MAX` connections, a 5 s limit for opening or acquiring a connection, `DATABASE_QUERY_TIMEOUT_MS` for query execution, and TCP keep-alive so dead idle connections are detected.
- **Generated client.** `prisma generate` writes TypeScript into `src/generated/prisma` (git-ignored). Import it with `import { PrismaClient } from "../generated/prisma/client.js"`. The `build`, `typecheck` and `test` scripts generate it automatically.
- **Configuration file.** The Prisma CLI reads `prisma7.config.ts`, the file name Prisma 7.10+ uses so it does not clash with Prisma 8's `prisma.config.ts` format. Prisma 7 no longer loads `.env` automatically. The official examples add `import "dotenv/config"`; this project uses Node's built-in `process.loadEnvFile()` instead, which needs no extra dependency. The CLI looks for the config file in the current directory, so run Prisma through the npm scripts (they run inside `apps/api`).
- **No models yet.** `schema.prisma` only has a generator and a datasource. Until the first model and migration exist, `npm run prisma:migrate:status` reports "The current database is not managed by Prisma Migrate" and exits with code 1. That is expected.
- **First migration.** When you add your first model, run `npm run prisma:migrate:dev -- --name init`. It creates `prisma/migrations/<timestamp>_init/migration.sql`, applies it to the development database and regenerates the client. Commit the migrations folder.
- **Applying migrations elsewhere.** Use `npm run prisma:migrate:deploy`. It applies pending migrations and never resets data.
- **Destructive commands.** `prisma migrate reset` and `prisma db push --force-reset` delete all data. Never run them against a database whose data you need. `migrate dev` may also offer to reset the development database when it detects drift; read the prompt before answering.

## Tests

| Command                    | What it covers                                                                                                                                                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run test`             | Unit and API tests with Supertest: health, readiness success/failure/timeout, 404, error responses, body limits, security headers, CORS, environment validation, server start and graceful shutdown. No database needed. |
| `npm run test:integration` | Readiness against the real test PostgreSQL database, and readiness failure when nothing listens on the database port.                                                                                                    |

Integration tests read `TEST_DATABASE_URL` only. They refuse to run when it is missing, equal to `DATABASE_URL`, not on `localhost`/`127.0.0.1`, or when the database name does not end with `_test`. None of the tests need Firebase credentials.

Start the test database first with `npm run db:test:up` from the repository root. It runs in a separate container on port 5434 and keeps its data in memory, so stopping it discards everything.

## PostgreSQL container notes

- The image is pinned to the PostgreSQL 18 major (`postgres:18-alpine`). From PostgreSQL 18, the official image stores data in a version-specific directory (`/var/lib/postgresql/18/docker`), so the named volume is mounted at `/var/lib/postgresql`. Images for PostgreSQL 17 and older expect `/var/lib/postgresql/data` instead; changing the image major without changing the mount would start with an empty database.
- A volume created by one PostgreSQL major cannot be opened by another. Upgrading the major version requires a dump and restore (or `pg_upgrade`), not just a new image tag.
- Both containers publish their port on `127.0.0.1` only and have no restart policy, so they are not reachable from the network and only run while you start them.

## Scripts (run inside `apps/api`, or use the `api:*` scripts at the root)

| Script                            | Purpose                                             |
| --------------------------------- | --------------------------------------------------- |
| `npm run dev`                     | Start with automatic restart on changes (tsx watch) |
| `npm run build`                   | Generate the Prisma Client and compile to `dist/`   |
| `npm run start`                   | Run the compiled API                                |
| `npm run typecheck`               | TypeScript strict check                             |
| `npm run lint`                    | ESLint                                              |
| `npm run test`                    | Unit and API tests                                  |
| `npm run test:integration`        | Database integration tests                          |
| `npm run format` / `format:check` | Prettier                                            |
| `npm run prisma:validate`         | Validate `schema.prisma`                            |
| `npm run prisma:generate`         | Generate the Prisma Client                          |
| `npm run prisma:migrate:dev`      | Create and apply a migration in development         |
| `npm run prisma:migrate:deploy`   | Apply pending migrations (non-destructive)          |
| `npm run prisma:migrate:status`   | Show which migrations are applied                   |
