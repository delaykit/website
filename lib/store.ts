import { db } from "./db";
import { rounds, currentRound } from "./db/schema";
import { desc, sql } from "drizzle-orm";

export async function incrementClicks(firesAt: Date) {
  const now = new Date();

  await db
    .insert(currentRound)
    .values({
      id: 1,
      clicks: 1,
      startedAt: now,
      lastClickAt: now,
      firesAt,
    })
    .onConflictDoUpdate({
      target: currentRound.id,
      set: {
        clicks: sql`${currentRound.clicks} + 1`,
        // Reset startedAt when this is the first click of a new round
        startedAt: sql`CASE WHEN ${currentRound.clicks} = 0 THEN ${now} ELSE ${currentRound.startedAt} END`,
        lastClickAt: now,
        firesAt,
      },
    });
}

export async function recordRound() {
  const current = await db.select().from(currentRound).limit(1);
  if (!current.length || current[0].clicks === 0) return;

  const round = current[0];
  const now = new Date();
  const lastClickAt = round.lastClickAt ?? round.startedAt;
  const durationSeconds = (
    (lastClickAt.getTime() - round.startedAt.getTime()) /
    1000
  ).toFixed(1);

  await db.insert(rounds).values({
    clicks: round.clicks,
    durationSeconds,
    startedAt: round.startedAt,
    firedAt: now,
  });

  // Reset current round
  await db
    .insert(currentRound)
    .values({
      id: 1,
      clicks: 0,
      startedAt: now,
      lastClickAt: null,
      firesAt: null,
    })
    .onConflictDoUpdate({
      target: currentRound.id,
      set: {
        clicks: 0,
        startedAt: now,
        lastClickAt: null,
        firesAt: null,
      },
    });
}

export async function getState() {
  // The two selects are independent — run them in parallel.
  const [currentRows, recentRounds] = await Promise.all([
    db.select().from(currentRound).limit(1),
    db.select().from(rounds).orderBy(desc(rounds.firedAt)).limit(10),
  ]);

  return {
    current: currentRows[0] ?? {
      clicks: 0,
      startedAt: null,
      lastClickAt: null,
      firesAt: null,
    },
    rounds: recentRounds,
  };
}
