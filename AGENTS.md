# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Repository layout

This is an npm-workspaces monorepo. The Expo app lives in `apps/mobile` and the Express API in `apps/api`. Run `npm install` only from the repository root.

Follow the mobile folder, import and styling conventions in `apps/mobile/README.md` and the API architecture, database and testing conventions in `apps/api/README.md`.

Never run destructive database commands (`prisma migrate reset`, `prisma db push --force-reset`, `docker compose down -v`, removing the `expense-tracker_postgres_data` volume).
