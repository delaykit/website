import { config } from "dotenv";
import { runMigrations } from "delaykit/postgres";

config({ path: ".env.local" });

try {
  await runMigrations(process.env.DATABASE_URL);
  console.log("[delaykit] migrations applied");
} catch (err) {
  if (isConnRefused(err)) {
    const url = process.env.DATABASE_URL ?? "(DATABASE_URL unset)";
    console.error(
      `[delaykit] Postgres not reachable at ${url}. ` +
        `Run \`docker compose up -d\` first, or point DATABASE_URL at a running Postgres.`
    );
    process.exit(1);
  }
  throw err;
}

function isConnRefused(err) {
  if (!err) return false;
  if (err.code === "ECONNREFUSED") return true;
  if (Array.isArray(err.errors) && err.errors.some(isConnRefused)) return true;
  if (err.cause) return isConnRefused(err.cause);
  return false;
}
