import { DelayKit } from "delaykit";
import { PostgresStore } from "delaykit/postgres";
import { PosthookScheduler } from "delaykit/posthook";
import { PollingScheduler } from "delaykit/polling";
import { recordRound } from "./store";

type DelayKitBundle = {
  instance: DelayKit;
  webhookHandler: ((req: Request) => Promise<Response>) | null;
  mode: "posthook" | "polling";
};

let _bundle: DelayKitBundle | null = null;
let _initPromise: Promise<DelayKitBundle> | null = null;

export const FIRE_WAIT = "30m";
export const FIRE_WAIT_MS = 30 * 60 * 1000;

function setupInstance(instance: DelayKit) {
  instance.handle("fire", async () => {
    await recordRound();
  });

  instance.on("job:scheduled", ({ job }) => {
    console.log(`[delaykit] fire scheduled key=${job.key} at=${job.scheduledFor.toISOString()}`);
  });
  instance.on("job:completed", ({ job, durationMs }) => {
    console.log(`[delaykit] fire completed key=${job.key} duration=${durationMs}ms`);
  });
  instance.on("job:retrying", ({ job, attempt, nextAttempt, scheduledFor }) => {
    console.warn(`[delaykit] fire retrying key=${job.key} attempt=${attempt}->${nextAttempt} next=${scheduledFor.toISOString()}`);
  });
  instance.on("job:failed", ({ job, error, reason, attempts, durationMs }) => {
    console.error(`[delaykit] fire failed key=${job.key} reason=${reason} attempts=${attempts} duration=${durationMs}ms`, error);
  });
  instance.on("job:stalled", ({ job, stalledMs, reclaimed }) => {
    console.warn(`[delaykit] fire stalled key=${job.key} stalledMs=${stalledMs} reclaimed=${reclaimed}`);
  });
}

export function dk(): Promise<DelayKitBundle> {
  if (_bundle) return Promise.resolve(_bundle);
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    const store = await PostgresStore.connect(process.env.DATABASE_URL!, { runMigrations: false });

    const usePosthook =
      !!process.env.POSTHOOK_API_KEY && !!process.env.POSTHOOK_SIGNING_KEY;

    if (usePosthook) {
      const scheduler = new PosthookScheduler({
        apiKey: process.env.POSTHOOK_API_KEY!,
        signingKey: process.env.POSTHOOK_SIGNING_KEY!,
        basePath: "/api/delaykit",
      });

      const instance = new DelayKit({ store, scheduler });
      setupInstance(instance);

      const webhookHandler = instance.createHandler();
      _bundle = { instance, webhookHandler, mode: "posthook" };
    } else {
      const scheduler = new PollingScheduler({ interval: 500 });
      const instance = new DelayKit({ store, scheduler });
      setupInstance(instance);

      await instance.start();
      _bundle = { instance, webhookHandler: null, mode: "polling" };
    }

    return _bundle;
  })();

  return _initPromise;
}
