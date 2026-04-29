import { spawnSync } from "node:child_process";
import { config } from "dotenv";

config({ path: ".env.local" });

// Only auto-start the bundled Postgres when DATABASE_URL points at it.
// If the developer is using a different Postgres (Postgres.app, a remote DB),
// don't touch their environment.
const url = process.env.DATABASE_URL;
if (!url || !pointsAtBundledCompose(url)) {
  process.exit(0);
}

if (!hasDocker()) {
  console.error(
    "[db-up] DATABASE_URL points at the bundled docker compose, but `docker` " +
      "was not found on PATH. Install Docker, or override DATABASE_URL to " +
      "point at a Postgres you already run."
  );
  process.exit(1);
}

const result = spawnSync("docker", ["compose", "up", "-d", "--wait"], {
  stdio: "inherit",
});

if (result.status !== 0) {
  console.error(
    "[db-up] `docker compose up` failed. Start Postgres yourself or fix the " +
      "compose error above before running `npm run dev` again."
  );
  process.exit(result.status ?? 1);
}

function pointsAtBundledCompose(databaseUrl) {
  try {
    const u = new URL(databaseUrl);
    const isLocalHost =
      u.hostname === "localhost" ||
      u.hostname === "127.0.0.1" ||
      u.hostname === "::1";
    return isLocalHost && u.port === "5440";
  } catch {
    return false;
  }
}

function hasDocker() {
  const probe = spawnSync("docker", ["--version"], { stdio: "ignore" });
  return probe.status === 0;
}
