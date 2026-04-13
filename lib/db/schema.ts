import {
  pgTable,
  serial,
  integer,
  numeric,
  timestamp,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const rounds = pgTable("rounds", {
  id: serial("id").primaryKey(),
  clicks: integer("clicks").notNull(),
  durationSeconds: numeric("duration_seconds").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  firedAt: timestamp("fired_at", { withTimezone: true }).notNull().defaultNow(),
});

export const currentRound = pgTable(
  "current_round",
  {
    id: integer("id").primaryKey().default(1),
    clicks: integer("clicks").notNull().default(0),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    lastClickAt: timestamp("last_click_at", { withTimezone: true }),
    firesAt: timestamp("fires_at", { withTimezone: true }),
  },
  (table) => [check("singleton", sql`${table.id} = 1`)],
);
