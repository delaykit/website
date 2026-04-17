import { config } from "dotenv";
import { runMigrations } from "delaykit/postgres";

config({ path: ".env.local" });

await runMigrations(process.env.DATABASE_URL);
console.log("[delaykit] migrations applied");
