const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function getTestDatabaseUrl(): string {
  const value = process.env.TEST_DATABASE_URL;

  if (!value) {
    throw new Error(
      "TEST_DATABASE_URL is not set. Start the test database with `npm run db:test:up` and set TEST_DATABASE_URL in apps/api/.env.",
    );
  }

  if (value === process.env.DATABASE_URL) {
    throw new Error("TEST_DATABASE_URL must not point to DATABASE_URL.");
  }

  const url = new URL(value);
  const databaseName = url.pathname.replace(/^\//, "");

  if (!localHosts.has(url.hostname) || !databaseName.endsWith("_test")) {
    throw new Error(
      "Refusing to run integration tests: TEST_DATABASE_URL must point to a local database whose name ends with _test.",
    );
  }

  return value;
}
