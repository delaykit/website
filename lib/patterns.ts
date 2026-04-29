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
    slug: "wake-an-agent",
    name: "Wake an agent after a timeout",
    description:
      "Schedule a timeout for an agent run waiting on human input. The handler resumes the run if approval doesn't arrive.",
    signature: `dk.schedule("agent-timeout", { delay: "24h" })`,
    signatureNote: "cancel when approval arrives",
    onHomepage: true,
    useWhen: [
      "Resume an agent run if a human reviewer doesn't approve a step within 24 hours",
      "Time out an agent waiting on a tool call that may never return",
      "Fail over a long-running agent task that has been idle past its deadline",
      "Wake a paused agent at a specific future time without holding a worker",
    ],
    examples: [
      {
        label: "Schedule the timeout when the agent pauses",
        source: `// agent run pauses, waiting on human approval
await dk.schedule("agent-timeout", {
  key: "run_789",
  delay: "24h",
});`,
      },
      {
        label: "Cancel when approval arrives",
        source: `await dk.unschedule("agent-timeout", "run_789");`,
      },
      {
        label: "When the time comes, resume the run",
        source: `dk.handle("agent-timeout", async ({ key }) => {
  const run = await db.runs.find(key);
  if (run.status !== "awaiting_approval") return; // already resolved
  await agents.resume(key, { outcome: "timed_out" });
});`,
      },
    ],
    related: ["expire-something", "send-a-reminder", "poll-until-done"],
    seo: {
      title: "Wake an agent after a human-in-the-loop timeout in TypeScript",
      description:
        "Schedule a timeout for an agent run waiting on human input. Resume the run with a timed-out outcome if approval doesn't arrive. Durable, backed by Postgres or SQLite.",
    },
  },

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
      "Send a follow-up email 48 hours after the first, unless the recipient clicks the link",
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
        label: "Cancel from a webhook. The job is the state.",
        source: `// in your email webhook (Resend, Postmark, etc.)
// no "email_clicked" column needed in your own db.
// the scheduled job is what tracks "still pending"
const event = await req.json();
if (event.type === "email.clicked") {
  await dk.unschedule("send-reminder", event.data.user_id);
}`,
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
      title: "Send a scheduled reminder in TypeScript",
      description:
        "Schedule a reminder notification for later and cancel it if the user acts first. Durable, survives restarts, backed by Postgres or SQLite.",
    },
  },

  {
    slug: "expire-something",
    name: "Expire something",
    description:
      "Run a side effect (email, cleanup, notification) when an invitation, checkout hold, or magic link expires. Handler reads current state and skips if the user already acted.",
    signature: `dk.schedule("expire-invitation", { delay: "7d" })`,
    signatureNote: "handler skips if the user already accepted",
    onHomepage: true,
    useWhen: [
      "Email a user that their Clerk invitation expired (Clerk has no webhook on time-based expiry)",
      "Release a held checkout cart 30 minutes after the customer started",
      "Invalidate a magic-link sign-in if the user doesn't click within 15 minutes",
      "Mark an upload as failed if processing hasn't completed within 10 minutes",
    ],
    examples: [
      {
        label: "Clerk invitation: notify the user when it expires",
        source: `// Clerk silently invalidates expired invitations but does not
// fire a webhook on time-based expiry. DelayKit fills the gap:
// schedule a job that runs the same moment Clerk stops accepting.
const invitation = await clerkClient.invitations.createInvitation({
  emailAddress: "user@example.com",
  expiresInDays: 7,
});
await dk.schedule("expire-invitation", {
  key: invitation.id,
  delay: "7d",
});

dk.handle("expire-invitation", async ({ key }) => {
  const invitation = await clerkClient.invitations.getInvitation(key);
  if (invitation.status !== "pending") return; // already accepted

  await sendEmail(invitation.emailAddress, "Your invitation has expired");
  await db.pendingUsers.delete(invitation.id);
});`,
      },
      {
        label: "Checkout hold: release stock if checkout stalls",
        source: `// when the customer starts checkout, hold the inventory
await dk.schedule("release-hold", {
  key: cart.id,
  delay: "30m",
});

dk.handle("release-hold", async ({ key }) => {
  const reservation = await reservations.find(key);
  if (reservation.status !== "held") return; // already paid or cancelled
  await reservations.release(key);
});`,
      },
      {
        label: "Cancel the expiry on early acceptance",
        source: `// in your Clerk webhook or post-payment route
await dk.unschedule("expire-invitation", invitation.id);`,
      },
    ],
    related: ["send-a-reminder", "deferred-cleanup"],
    seo: {
      title: "Expire invitations, holds, and magic links: Clerk and any app-side deadline",
      description:
        "Run a side effect when any app-side deadline passes. Worked example for Clerk invitations (Clerk has no webhook on time-based expiry); same shape applies to checkout holds, magic links, upload deadlines, or anything else with a clock. Durable, backed by Postgres or SQLite.",
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
        source: `// called once per edit, only fires after silence
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
      title: "Durable debounce in TypeScript: collapse a flurry of events into one action",
      description:
        "Debounce backend events durably across restarts and deploys. Collapse a flurry of edits, alerts, or webhooks into a single handler call. Backed by Postgres or SQLite.",
    },
  },

  {
    slug: "retry-with-backoff",
    name: "Retry with backoff",
    description:
      "Defer a failed operation to a durable retry with exponential backoff. Worked examples for Stripe (idempotency-key handling for timeouts and custom dunning); same shape applies to CRM syncs, webhook deliveries, and any external call that occasionally fails.",
    signature: `dk.schedule("retry-charge", { delay: "30s" })`,
    signatureNote: "reuse the idempotency key when retrying the same attempt",
    onHomepage: false,
    useWhen: [
      "Retry a Stripe payment that timed out using the same idempotency key (Stripe deduplicates against the original)",
      "Run a custom invoice dunning sequence beyond Stripe Smart Retries with a new key per attempt",
      "Retry a CRM sync that timed out during signup",
      "Retry a 500-failing webhook delivery with backoff over the next day",
    ],
    examples: [
      {
        label: "Stripe timeout: reuse the idempotency key on retry",
        source: `// the call timed out, so you don't know whether Stripe processed it.
// retry with the SAME idempotency key. Stripe returns the cached
// result if the original succeeded, so the customer is never charged
// twice. don't auto-retry card_declined — the bank already said no
// and the cached error will come back unchanged.
try {
  await stripe.paymentIntents.create(
    { amount, customer, confirm: true },
    { idempotencyKey: \`charge-\${order.id}\` },
  );
} catch (err) {
  if (isTransientError(err)) {
    await dk.schedule("retry-charge", { key: order.id, delay: "30s" });
  }
}

dk.handle("retry-charge", {
  handler: async ({ key }) => {
    const order = await db.orders.find(key);
    if (order.status === "paid") return; // resolved by another path

    await stripe.paymentIntents.create(
      { amount: order.amount, customer: order.customerId, confirm: true },
      { idempotencyKey: \`charge-\${key}\` }, // SAME key as the original
    );
  },
  retry: { attempts: 3, backoff: "exponential" },
});`,
      },
      {
        label: "Stripe invoice dunning: a new idempotency key per attempt",
        source: `// after Smart Retries exhaust (or if you've turned it off),
// run your own dunning schedule. each attempt is a NEW payment,
// so each gets its own idempotency key. reusing the key would
// dedupe back to the first failure and never actually retry.
dk.handle("retry-invoice", async ({ key }) => {
  const [invoiceId, attempt] = key.split(":");
  const invoice = await stripe.invoices.retrieve(invoiceId);
  if (invoice.status !== "open") return; // paid or voided

  await stripe.invoices.pay(invoiceId, undefined, {
    idempotencyKey: \`dunning-\${invoiceId}-\${attempt}\`,
  });
});`,
      },
    ],
    related: ["debounce-a-flurry", "renew-before-expiry"],
    seo: {
      title: "Retry with backoff: Stripe payments, CRM syncs, and any failed call",
      description:
        "Defer a failed operation to a durable retry with exponential backoff. Worked Stripe examples (idempotency-key handling for timeouts and invoice dunning); same shape applies to CRM syncs, webhook deliveries, and any external call. Backed by Postgres or SQLite.",
    },
  },

  {
    slug: "throttle-calls",
    name: "Coalesce into a digest",
    description:
      "Collapse a burst of events into one handler run per window. The handler fires at the end of the window with the latest state.",
    signature: `dk.throttle("digest", { wait: "1m" })`,
    signatureNote: "one handler run per window, many calls coalesce",
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
        source: `// fires once per minute with the latest state.
// every call inside the window coalesces into the next handler run
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
      title: "Coalesce a burst of events into one handler run in TypeScript",
      description:
        "Collapse a burst of events into a single handler call per window with DelayKit's throttle. Durable, backed by Postgres or SQLite.",
    },
  },

  {
    slug: "schedule-a-follow-up",
    name: "Schedule a follow-up",
    description:
      "Fire a task only after activity goes silent. Each event resets the clock with a single DB update, no scheduler churn.",
    signature: `dk.debounce("follow-up", { key, wait: "3d" })`,
    signatureNote: "single DB update per call, no scheduler reschedule",
    onHomepage: false,
    useWhen: [
      "Send a re-engagement email 3 days after a user's last login",
      "Remind a team member about an unreplied thread after 48 hours",
      "Nudge a user to finish a form they started but haven't submitted in 24 hours",
      "Prompt a seller to update their listing if they haven't edited it in a week",
      "Auto-release a collaborative-editing lock 5 minutes after the holder stops typing",
      "Cancel a stalled chunked upload if no new chunk arrives in 60 seconds",
    ],
    examples: [
      {
        label: "Debounce on every user activity",
        source: `// each call updates one row in Postgres,
// no scheduler reschedule, no churn on the wake-up
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
      title: "Schedule a follow-up after user inactivity in TypeScript",
      description:
        "Run a task after a period of user inactivity. Each call resets the clock with a single Postgres update and no scheduler reschedule. Backed by Postgres or SQLite.",
    },
  },

  {
    slug: "deferred-cleanup",
    name: "Deferred cleanup",
    description:
      "Fire-and-forget maintenance. Schedule it once, let it run.",
    signature: `dk.schedule("cleanup", { delay: "1h" })`,
    signatureNote: "no state check, no cancel, just runs",
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
        source: `// no cancel, no state check. the handler always runs
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
      title: "Deferred cleanup in TypeScript: delete, archive, or expire after a delay",
      description:
        "Fire-and-forget cleanup, retention, and archival after a delay. No cron, no state check, no cancel. Durable deferred execution backed by Postgres or SQLite.",
    },
  },

  {
    slug: "renew-before-expiry",
    name: "Renew before expiry",
    description:
      "Refresh a token, lease, or session a few minutes before it expires. Worked examples for Google and Slack v2 OAuth (with refresh-token rotation); the same shape applies to GitHub Apps, presigned URLs, and any time-bound credential.",
    signature: `dk.schedule("refresh-google", { at: renewAt })`,
    signatureNote: "reschedule on each successful renewal",
    onHomepage: false,
    useWhen: [
      "Refresh a Google OAuth access token 5 minutes before its expiry_date",
      "Refresh a Slack v2 OAuth token before the 12-hour access window closes (refresh tokens always rotate)",
      "Renew a GitHub App installation token before its 1-hour TTL expires",
      "Re-sign a presigned S3 upload URL ahead of its expiration",
    ],
    examples: [
      {
        label: "Google OAuth: schedule a renewal before expiry_date",
        source: `// after first authorizing, schedule a renewal 5 minutes before expiry
await dk.schedule("refresh-google", {
  key: account.id,
  at: new Date(tokens.expiry_date - 5 * 60 * 1000),
});

// handler refreshes, persists, reschedules.
// Google may rotate the refresh_token. fall back to the stored
// one if the refresh response omits it (common case).
dk.handle("refresh-google", async ({ key }) => {
  const stored = await db.googleTokens.find(key);
  oauth2Client.setCredentials({ refresh_token: stored.refresh_token });

  const { credentials } = await oauth2Client.refreshAccessToken();

  await db.googleTokens.update(key, {
    access_token: credentials.access_token,
    refresh_token: credentials.refresh_token ?? stored.refresh_token,
    expiry_date: credentials.expiry_date,
  });

  await dk.schedule("refresh-google", {
    key,
    at: new Date(credentials.expiry_date - 5 * 60 * 1000),
  });
});`,
      },
      {
        label: "Slack v2: refresh_token rotates on every refresh",
        source: `// Slack v2 with token rotation enabled. the refresh_token is
// single-use and rotates on every call, so persist both tokens
// or the next renewal will fail.
dk.handle("refresh-slack", async ({ key }) => {
  const stored = await db.slackTokens.find(key);

  const res = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: stored.refresh_token,
      client_id: process.env.SLACK_CLIENT_ID!,
      client_secret: process.env.SLACK_CLIENT_SECRET!,
    }),
  });
  const data = await res.json();

  await db.slackTokens.update(key, {
    access_token: data.access_token,
    refresh_token: data.refresh_token, // mandatory rotation
  });

  // renew at 90% of the new access token's lifetime
  await dk.schedule("refresh-slack", {
    key,
    delay: \`\${Math.floor(data.expires_in * 0.9)}s\`,
  });
});`,
      },
    ],
    related: ["expire-something", "send-a-reminder"],
    seo: {
      title: "Refresh tokens and leases before they expire: Google OAuth, Slack, and others",
      description:
        "Schedule a refresh a few minutes before any time-bound credential expires. Worked examples for Google OAuth and Slack v2 (handles refresh-token rotation); the same shape applies to GitHub Apps, presigned URLs, and distributed locks. Durable, backed by Postgres or SQLite.",
    },
  },

  {
    slug: "poll-until-done",
    name: "Poll until done",
    description:
      "Wait on an async job by checking back periodically until it's done, or until you give up. Useful for Replicate predictions, OpenAI batch jobs, and Mux transcodes.",
    signature: `dk.schedule("check-prediction", { delay: "2m" })`,
    signatureNote: "handler reschedules itself until status is terminal",
    onHomepage: false,
    useWhen: [
      "Poll a Replicate prediction until it returns succeeded, failed, or canceled",
      "Wait for an OpenAI batch job to finish, then process the output file",
      "Check a Mux asset every 30 seconds until it's ready to play or has errored",
      "Wait for any third-party async job (export, transcoding, model inference) until the result is ready",
    ],
    examples: [
      {
        label: "Replicate: poll a prediction until terminal status",
        source: `// after kicking off the prediction
await dk.schedule("check-replicate", {
  key: prediction.id,
  delay: "2m",
});

// handler reschedules itself until Replicate reports a terminal status.
// Replicate's terminal set is succeeded, failed, canceled.
dk.handle("check-replicate", async ({ key }) => {
  const prediction = await replicate.predictions.get(key);
  if (["succeeded", "failed", "canceled"].includes(prediction.status)) {
    await onPredictionDone(prediction);
    return;
  }

  // give up after an hour, derived from the prediction's own state
  const elapsedMs = Date.now() - new Date(prediction.created_at).getTime();
  if (elapsedMs > 60 * 60 * 1000) {
    await alerts.page("prediction-stuck", { id: key });
    return;
  }

  await dk.schedule("check-replicate", { key, delay: "2m" });
});`,
      },
      {
        label: "OpenAI batch: same shape, different terminal statuses",
        source: `dk.handle("check-batch", async ({ key }) => {
  const batch = await openai.batches.retrieve(key);
  if (["completed", "failed", "expired", "cancelled"].includes(batch.status)) {
    await onBatchDone(batch);
    return;
  }
  // batch jobs run for hours, so check less often than predictions
  await dk.schedule("check-batch", { key, delay: "5m" });
});`,
      },
      {
        label: "Mux: poll an asset until it's ready",
        source: `dk.handle("check-asset", async ({ key }) => {
  const asset = await mux.video.assets.retrieve(key);
  if (asset.status === "ready" || asset.status === "errored") {
    await onAssetReady(asset);
    return;
  }
  await dk.schedule("check-asset", { key, delay: "30s" });
});`,
      },
    ],
    related: ["renew-before-expiry", "schedule-a-follow-up"],
    seo: {
      title: "Poll an async job until done: Replicate, OpenAI batch, Mux, and other APIs",
      description:
        "Wait on any async job by scheduling periodic checks and rescheduling until the status is terminal. Worked examples for Replicate, OpenAI batch, and Mux; same shape applies to any external API. Durable, backed by Postgres or SQLite.",
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
        source: `// at signup, schedule the whole drip.
// one job per step, each independently cancellable
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
      title: "Schedule a drip campaign in TypeScript: onboarding, trial, and re-engagement emails",
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
      title: "Schedule a post or email for a future time in TypeScript",
      description:
        "Schedule content to publish at a specific future time, with edit and cancel before it fires. Durable, backed by Postgres or SQLite.",
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
