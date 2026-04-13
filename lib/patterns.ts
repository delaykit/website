/**
 * Patterns are the shared source of truth for both the homepage grid
 * and the /patterns index + /patterns/[slug] detail pages. Add a new
 * pattern here and it appears everywhere.
 */

export type CodeBlock = {
  /** Optional caption above the block */
  label?: string;
  /** The source code, plain text (not highlighted) */
  source: string;
};

export type Pattern = {
  /** URL slug, used at /patterns/[slug] */
  slug: string;
  /** Display name, e.g. "Send a reminder" */
  name: string;
  /** One-line description (shown on cards and as the page subtitle) */
  description: string;
  /**
   * Short form shown on the homepage card — may be shorter than description.
   * If omitted, description is used.
   */
  short?: string;
  /**
   * Concrete one-line signature for the main DelayKit call this pattern
   * uses. Shown on cards with realistic values so time scales and options
   * are visible at a glance. Example:
   * `dk.schedule("remind", { delay: "24h" })`
   */
  signature: string;
  /**
   * One-line note highlighting the defining mechanic or option that makes
   * this pattern different from its siblings. Shown under the signature
   * on cards as a small secondary line. Example: "with unschedule to cancel".
   */
  signatureNote?: string;
  /**
   * Whether the pattern appears on the homepage grid. Not every pattern in
   * the index needs to be on the homepage.
   */
  onHomepage: boolean;
  /** "Use this to..." bullet list — concrete problems the pattern solves. */
  useWhen: string[];
  /** One or more code examples shown on the detail page. */
  examples: CodeBlock[];
  /** Related pattern slugs, shown as cross-links on the detail page. */
  related?: string[];
  /** Page metadata for the detail page. */
  seo: {
    title: string;
    description: string;
  };
};

export const patterns: Pattern[] = [
  {
    slug: "send-a-reminder",
    name: "Send a reminder",
    description:
      "Schedule a notification for later. The handler checks current state when it fires.",
    signature: `dk.schedule("remind", { delay: "24h" })`,
    signatureNote: "handler decides whether to send",
    onHomepage: true,
    useWhen: [
      "Send a new user a welcome email 24 hours after they sign up",
      "Nudge a user to finish onboarding 3 days after they created their account",
      "Email a shopper about their cart 1 hour after checkout starts",
      "Escalate a support ticket if no agent replies within 48 hours",
    ],
    examples: [
      {
        label: "Schedule the reminder",
        source: `await dk.schedule("send-reminder", {
  key: "user_123",
  delay: "24h",
});`,
      },
      {
        label: "Optionally cancel it when they act",
        source: `await dk.unschedule("send-reminder", "user_123");`,
      },
      {
        label: "When the time comes, handle the reminder",
        source: `dk.handle("send-reminder", async ({ key }) => {
  const user = await db.users.find(key);
  if (user.onboarded) return; // already acted, skip
  await sendEmail(user.email, "Finish setting up");
});`,
      },
    ],
    related: ["schedule-a-follow-up", "expire-something", "debounce-a-flurry"],
    seo: {
      title: "Send a scheduled reminder in Next.js",
      description:
        "Schedule a reminder notification for later and cancel it if the user acts first. Durable, survives restarts, backed by your own Postgres.",
    },
  },

  {
    slug: "expire-something",
    name: "Expire something",
    description:
      "Run cleanup the moment a deadline passes. Invitations, trials, holds.",
    signature: `dk.schedule("expire-trial", { delay: "14d" })`,
    signatureNote: "handler skips if already resolved",
    onHomepage: true,
    useWhen: [
      "Expire a team invitation 7 days after it was sent",
      "Downgrade an account to the free plan when its 14-day trial ends",
      "Release a held seat 30 minutes after a user started checkout",
      "Mark an upload as failed if processing hasn't completed within 10 minutes",
    ],
    examples: [
      {
        label: "Schedule the expiration",
        source: `await dk.schedule("expire-trial", {
  key: "acct_456",
  delay: "14d",
});`,
      },
      {
        label: "When the time comes, handle the expiration",
        source: `dk.handle("expire-trial", async ({ key }) => {
  const acct = await db.accounts.find(key);
  if (acct.plan !== "trial") return; // already upgraded, skip
  await db.accounts.update(key, { plan: "free" });
  await sendEmail(acct.email, "Your trial has ended");
});`,
      },
      {
        label: "Optionally cancel if they upgrade early",
        source: `await dk.unschedule("expire-trial", "acct_456");`,
      },
    ],
    related: ["send-a-reminder", "deferred-cleanup"],
    seo: {
      title: "Expire an invitation, trial, or reservation in Next.js",
      description:
        "Run cleanup exactly when a deadline passes. Durable timers for trials, invitations, holds, and timeouts, backed by your own Postgres.",
    },
  },

  {
    slug: "debounce-a-flurry",
    name: "Debounce a flurry",
    description:
      "Collapse fifty events into one action. Durable across restarts.",
    signature: `dk.debounce("reindex", { wait: "5s" })`,
    signatureNote: "optional maxWait to cap the window",
    onHomepage: true,
    useWhen: [
      "Rebuild a search index for a document after an editor stops making changes",
      "Send one Slack alert per incident instead of one per failing request",
      "Regenerate a product feed after a batch of catalog updates settles",
      "Recompute dashboard stats after a burst of order imports finishes",
    ],
    examples: [
      {
        label: "Debounce on each event",
        source: `// called once per edit — only fires after silence
await dk.debounce("reindex", {
  key: "doc_789",
  wait: "5s",
});`,
      },
      {
        label: "Cap the wait with maxWait",
        source: `// fires at most every 60s, even if edits keep arriving
await dk.debounce("reindex", {
  key: "doc_789",
  wait: "5s",
  maxWait: "60s",
});`,
      },
      {
        label: "When the time comes, rebuild the index",
        source: `dk.handle("reindex", async ({ key }) => {
  await searchIndex.rebuild(key);
});`,
      },
    ],
    related: ["throttle-calls", "retry-with-backoff"],
    seo: {
      title: "Durable debounce for backend events in Next.js",
      description:
        "Backend debounce that survives restarts and runs on serverless. Collapse a flurry of events into one action, backed by your own Postgres.",
    },
  },

  {
    slug: "retry-with-backoff",
    name: "Retry with backoff",
    description:
      "Something failed during a request. Defer the retry instead of blocking the response.",
    signature: `dk.schedule("retry-charge", { delay: "1m" })`,
    signatureNote: "handler retries with configurable backoff",
    onHomepage: true,
    useWhen: [
      "A Stripe charge fails at checkout — retry in 1 minute without holding up the response",
      "A CRM sync times out during signup — schedule retries over the next hour",
      "A webhook delivery returns a 500 — back off and try again over the next day",
      "An email send fails — retry with exponential backoff instead of showing the user an error",
    ],
    examples: [
      {
        label: "Something fails in your API route — schedule a retry",
        source: `// respond to the user now, retry happens later
try {
  await stripe.charges.create({ amount, customer });
} catch (err) {
  await dk.schedule("retry-charge", {
    key: order.id,
    delay: "1m",
  });
}`,
      },
      {
        label: "When the time comes, try again with backoff",
        source: `dk.handle("retry-charge", {
  handler: async ({ key }) => {
    const order = await db.orders.find(key);
    await stripe.charges.create({
      amount: order.amount,
      customer: order.customerId,
    });
  },
  retry: {
    attempts: 5,
    backoff: "exponential",
  },
});`,
      },
    ],
    related: ["debounce-a-flurry", "renew-before-expiry"],
    seo: {
      title: "Retry with exponential backoff in Next.js",
      description:
        "Defer a failed operation to a durable retry with exponential backoff. Respond to the user immediately, retry in the background over minutes or hours.",
    },
  },

  {
    slug: "throttle-calls",
    name: "Coalesce into a digest",
    description:
      "Collapse a burst of events into one handler run per window. The handler fires at the end of the window with the latest state.",
    signature: `dk.throttle("digest", { wait: "1m" })`,
    signatureNote: "one handler run per window — many calls coalesce",
    onHomepage: false,
    useWhen: [
      "Send one Slack summary per minute instead of one message per event in a busy channel",
      "Batch incoming webhook events into a single handler call per 60-second window",
      "Rebuild a search index at most once per minute even during a bulk import",
      "Push aggregated metrics to a dashboard every 30 seconds instead of per-write",
    ],
    examples: [
      {
        label: "Throttle on each event",
        source: `// fires once per minute with the latest state — every call
// inside the window coalesces into the next handler run
await dk.throttle("digest", {
  key: "chan_42",
  wait: "1m",
});`,
      },
      {
        label: "When the time comes, send the digest",
        source: `dk.handle("digest", async ({ key }) => {
  // runs once per window with whatever state is current
  const events = await db.events.unread(key);
  await sendDigest(key, events);
  await db.events.markRead(key, events);
});`,
      },
    ],
    related: ["debounce-a-flurry", "schedule-a-follow-up"],
    seo: {
      title: "Coalesce a burst of events into one handler run — Next.js",
      description:
        "Collapse a burst of events into a single handler call per window with DelayKit's throttle. Durable, backed by your own Postgres.",
    },
  },

  {
    slug: "schedule-a-follow-up",
    name: "Schedule a follow-up",
    description:
      "Run a task after a period of user inactivity. Each call resets the clock.",
    signature: `dk.debounce("follow-up", { key, wait: "3d" })`,
    signatureNote: "cheap to call from every request",
    onHomepage: false,
    useWhen: [
      "Send a re-engagement email 3 days after a user's last login",
      "Remind a team member about an unreplied thread after 48 hours",
      "Nudge a user to finish a form they started but haven't submitted in 24 hours",
      "Prompt a seller to update their listing if they haven't edited it in a week",
    ],
    examples: [
      {
        label: "Debounce on every user activity",
        source: `// safe to call from middleware on every request — debounce
// only updates a row in Postgres, no scheduling churn
await dk.debounce("follow-up", {
  key: user.id,
  wait: "3d",
});`,
      },
      {
        label: "When the time comes, send the follow-up",
        source: `dk.handle("follow-up", async ({ key }) => {
  const user = await db.users.find(key);
  if (wasActiveRecently(user)) return; // safety check
  await sendReengagementEmail(user.email);
});`,
      },
    ],
    related: ["debounce-a-flurry", "send-a-reminder"],
    seo: {
      title: "Schedule a follow-up after user inactivity — Next.js",
      description:
        "Run a task after a period of user inactivity. Each call resets the clock without creating new jobs. Backed by your own Postgres, safe to call from middleware.",
    },
  },

  {
    slug: "deferred-cleanup",
    name: "Deferred cleanup",
    description:
      "Fire-and-forget maintenance. Schedule it once, let it run.",
    signature: `dk.schedule("cleanup", { delay: "1h" })`,
    signatureNote: "no state check, no cancel — just runs",
    onHomepage: false,
    useWhen: [
      "Delete a soft-deleted record one hour after the user confirmed deletion",
      "Archive a video upload one hour after transcoding finishes",
      "Tear down a sandbox environment 24 hours after it was created",
      "Remove temporary export files from storage after their download link expires",
    ],
    examples: [
      {
        label: "Schedule once, walk away",
        source: `// no cancel, no state check — the handler always runs
await dk.schedule("cleanup-upload", {
  key: "upload_abc",
  delay: "1h",
});`,
      },
      {
        label: "When the time comes, just delete",
        source: `dk.handle("cleanup-upload", async ({ key }) => {
  await storage.delete(key);
  await db.uploads.delete(key);
});`,
      },
    ],
    related: ["expire-something", "send-a-reminder"],
    seo: {
      title: "Scheduled cleanup and retention in Next.js",
      description:
        "Fire-and-forget cleanup, retention, and archival after a delay. No cron, no state check, no cancel. Durable deferred execution backed by your own Postgres.",
    },
  },

  {
    slug: "renew-before-expiry",
    name: "Renew before expiry",
    description:
      "Refresh a token, lease, or session a few minutes before it expires.",
    signature: `dk.schedule("refresh", { delay: "55m" })`,
    signatureNote: "reschedule on each successful renewal",
    onHomepage: true,
    useWhen: [
      "Refresh an OAuth access token 5 minutes before it expires",
      "Renew a distributed lock 30 seconds before its TTL expires",
      "Re-sign a presigned upload URL ahead of its expiration",
      "Refresh an external API session token every 50 minutes to prevent timeout",
    ],
    examples: [
      {
        label: "Schedule the first renewal",
        source: `// token is good for 60 minutes — renew at the 55-minute mark
await dk.schedule("refresh-token", {
  key: "acct_456",
  delay: "55m",
});`,
      },
      {
        label: "When the time comes, refresh and reschedule",
        source: `dk.handle("refresh-token", async ({ key }) => {
  const next = await oauth.refresh(key);
  await db.tokens.update(key, next);

  // queue the next renewal — one job per account, always
  await dk.schedule("refresh-token", {
    key,
    delay: "55m",
  });
});`,
      },
    ],
    related: ["expire-something", "send-a-reminder"],
    seo: {
      title: "Refresh tokens and leases before they expire — Next.js",
      description:
        "Schedule a token refresh, lease renewal, or session keep-alive a few minutes before expiration. Durable, backed by your own Postgres.",
    },
  },

  {
    slug: "dead-mans-switch",
    name: "Dead man's switch",
    description:
      "Alarm when something stops happening. The absence of an event is the trigger.",
    signature: `dk.schedule("missed-heartbeat", { delay: "5m" })`,
    signatureNote: "cancel on each ping, fires only on silence",
    onHomepage: true,
    useWhen: [
      "Page oncall if a background worker stops sending heartbeats for 5 minutes",
      "Alert when a batch import hasn't reported progress in 10 minutes",
      "Notify your team if a payment processor stops responding to health checks",
      "Detect a stalled web crawler that should have finished its run by now",
    ],
    examples: [
      {
        label: "Reset the timer on each heartbeat",
        source: `// every heartbeat replaces the pending alarm
await dk.schedule("missed-heartbeat", {
  key: "worker_42",
  delay: "5m",
  onDuplicate: "replace",
});`,
      },
      {
        label: "The alarm fires only if heartbeats stop",
        source: `dk.handle("missed-heartbeat", async ({ key }) => {
  // we got here because no heartbeat arrived in time
  await alerts.page("worker-silent", { worker: key });
});`,
      },
    ],
    related: ["send-a-reminder", "expire-something"],
    seo: {
      title: "Dead man's switch in Next.js — alert on silence",
      description:
        "Trigger an alarm when something stops happening. Durable absence-of-event detection for heartbeats, watchdogs, and stalled jobs.",
    },
  },

  {
    slug: "poll-until-done",
    name: "Poll until done",
    description:
      "Wait on async work by checking back periodically until it's ready — or until you give up.",
    signature: `dk.schedule("check", { delay: "2m" })`,
    signatureNote: "handler reschedules itself if not ready yet",
    onHomepage: false,
    useWhen: [
      "Check whether a video transcoding job has finished every 2 minutes",
      "Verify a POS bill has been paid 5 minutes after it was created",
      "Poll an external API for export results until the file is ready to download",
      "Wait for an IoT sensor to report a reading, then forward it to the dashboard",
    ],
    examples: [
      {
        label: "Schedule the first check",
        source: `await dk.schedule("check-task", {
  key: task.id,
  delay: "2m",
});`,
      },
      {
        label: "When the time comes, check and reschedule if not ready",
        source: `dk.handle("check-task", async ({ key }) => {
  const task = await api.getTask(key);
  if (task.done) {
    await onTaskDone(task);
    return;
  }

  // give up after an hour — derived from the task's own state,
  // no separate counter to maintain
  const elapsedMs = Date.now() - task.createdAt.getTime();
  if (elapsedMs > 60 * 60 * 1000) {
    await alerts.page("task-stuck", { taskId: key });
    return;
  }

  // not ready yet — check again in 2 minutes
  await dk.schedule("check-task", { key, delay: "2m" });
});`,
      },
    ],
    related: ["renew-before-expiry", "dead-mans-switch"],
    seo: {
      title: "Poll an external task until it's done — Next.js",
      description:
        "Wait on an external async job by scheduling a check, rescheduling if not ready, and giving up after a cap. Durable, backed by your own Postgres.",
    },
  },

  {
    slug: "drip-sequence",
    name: "Schedule a drip sequence",
    description:
      "Schedule every step of an onboarding or trial drip up front. Each handler checks current state when it fires.",
    signature: `dk.schedule("drip-day-3", { delay: "3d" })`,
    signatureNote: "one job per step, all queued at signup",
    onHomepage: false,
    useWhen: [
      "Send a 5-email onboarding sequence over a new user's first two weeks",
      "Remind a trial user at day 1, day 7, and day 13 that their trial is ending",
      "Run a 3-step re-engagement series for users who signed up but never activated",
      "Schedule welcome, tips, and case-study emails that each skip if the user already converted",
    ],
    examples: [
      {
        label: "Queue every step at signup",
        source: `// at signup, schedule the whole drip — one job per step,
// each independently cancellable
await dk.schedule("drip-day-1", { key: user.id, delay: "1d" });
await dk.schedule("drip-day-3", { key: user.id, delay: "3d" });
await dk.schedule("drip-day-7", { key: user.id, delay: "7d" });`,
      },
      {
        label: "When the time comes, each step checks state independently",
        source: `dk.handle("drip-day-1", async ({ key }) => {
  const user = await db.users.find(key);
  if (user.churned || user.activated) return;
  await sendEmail(user, "welcome-day-1");
});

dk.handle("drip-day-3", async ({ key }) => {
  const user = await db.users.find(key);
  if (user.churned || user.activated) return;
  await sendEmail(user, "tips-day-3");
});

dk.handle("drip-day-7", async ({ key }) => {
  const user = await db.users.find(key);
  if (user.churned || user.activated) return;
  await sendEmail(user, "case-study-day-7");
});`,
      },
    ],
    related: ["send-a-reminder", "schedule-a-follow-up"],
    seo: {
      title: "Schedule a drip campaign in Next.js",
      description:
        "Schedule a multi-step onboarding or trial drip up front. Each step is independently cancellable, and handlers check current state at execution time.",
    },
  },

  {
    slug: "delayed-publish",
    name: "Delayed publish",
    description:
      "Publish a post, send an email, or release content at a specific future time.",
    signature: `dk.schedule("publish", { at: post.publishAt })`,
    signatureNote: "edit or cancel any time before it fires",
    onHomepage: false,
    useWhen: [
      "Schedule a blog post to go live next Tuesday at 9am",
      "Send a marketing email at a specific time in the recipient's timezone",
      "Release a feature flag at a coordinated launch moment",
      "Queue a changelog announcement to go out at the start of business hours",
    ],
    examples: [
      {
        label: "Schedule for an exact time",
        source: `await dk.schedule("publish-post", {
  key: post.id,
  at: post.publishAt, // a Date in the future
});`,
      },
      {
        label: "Reschedule or cancel before it fires",
        source: `// editor moved the time
await dk.schedule("publish-post", {
  key: post.id,
  at: post.publishAt,
  onDuplicate: "replace",
});

// or pull it entirely
await dk.unschedule("publish-post", post.id);`,
      },
      {
        label: "When the time comes, read current state and publish",
        source: `dk.handle("publish-post", async ({ key }) => {
  const post = await db.posts.find(key);
  if (post.status !== "scheduled") return; // already published or pulled
  await db.posts.update(key, { status: "published" });
  await cdn.invalidate(post.slug);
});`,
      },
    ],
    related: ["send-a-reminder", "expire-something"],
    seo: {
      title: "Schedule a post or email for a future time — Next.js",
      description:
        "Schedule content to publish at a specific future time, with edit and cancel before it fires. Durable, backed by your own Postgres.",
    },
  },
];

export function getPattern(slug: string): Pattern | undefined {
  return patterns.find((p) => p.slug === slug);
}

export function getHomepagePatterns(): Pattern[] {
  return patterns.filter((p) => p.onHomepage);
}

export function getRelatedPatterns(slugs: string[] | undefined): Pattern[] {
  if (!slugs) return [];
  return slugs
    .map((slug) => getPattern(slug))
    .filter((p): p is Pattern => p !== undefined);
}
