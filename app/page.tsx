import Link from "next/link";
import { NavBar } from "@/components/nav-bar";
import { getHomepagePatterns } from "@/lib/patterns";
import { PatternCard } from "@/components/pattern-card";
import { PrimitiveDiagrams } from "@/components/primitive-diagrams";
import { CodeSnippet } from "@/components/code-snippet";
import { SectionHeader } from "@/components/section-header";
import { InlineInstall } from "@/components/inline-install";
import { Colophon } from "@/components/colophon";
import { PropertyList, type PropertyItem } from "@/components/property-list";
import { LINKS } from "@/lib/links";

export const dynamic = "force-dynamic";

const TASTE_SOURCE = `// when a user signs up, schedule a reminder for 24h later
app.post("/signup", async (req, res) => {
  const user = await createUser(req.body);
  await dk.schedule("remind-onboarding", {
    key: user.id,
    delay: "24h",
  });
  res.json({ ok: true });
});

// the DelayKit handler runs at the scheduled time
dk.handle("remind-onboarding", async ({ key }) => {
  const user = await db.users.find(key);
  if (user.onboarded) return;
  await sendEmail(user.email, "ready to finish setup?");
});`;

const PROPERTIES: PropertyItem[] = [
  {
    title: "Schedule, debounce, throttle. All per entity, all cancellable.",
    body: (
      <>
        Not just &ldquo;run this at time X.&rdquo; Debounce a burst of edits
        into one reindex. Throttle notifications to one per hour per user.
        Cancel any of it if it&rsquo;s no longer needed.
      </>
    ),
  },
  {
    title: "Postgres or SQLite. Use what fits.",
    body: (
      <>
        SQLite for single-process apps, zero infra. Postgres for multi-replica
        and serverless. Either store auto-migrates on first connect.
      </>
    ),
  },
  {
    title: "Jobs survive restarts and deploys.",
    body: (
      <>
        Durable in Postgres or SQLite, not in memory. Crash, redeploy, scale.
        They&rsquo;re still there.
      </>
    ),
  },
  {
    title: "No duplicate pending jobs.",
    body: (
      <>
        Same handler and key won&rsquo;t queue twice. Safe to call from any
        request handler.
      </>
    ),
  },
  {
    title: "Retries built in.",
    body: (
      <>
        Handlers retry on failure with configurable backoff. Stalled jobs from
        crashed processes recover automatically.
      </>
    ),
  },
  {
    title: "Zero runtime dependencies.",
    body: (
      <>
        <code>postgres</code>, <code>better-sqlite3</code>, and{" "}
        <code>@posthook/node</code> are optional peers. Install only what your
        deployment needs.
      </>
    ),
  },
];

const STORES: PropertyItem[] = [
  {
    title: "SQLite. Local-first, zero infra.",
    body: (
      <>
        For single-process apps: a Bun server, a Node backend on one VPS, a
        desktop or CLI tool. <code>bun:sqlite</code> is built in. On Node,
        install <code>better-sqlite3</code> as an optional peer.
      </>
    ),
  },
  {
    title: "Postgres. Multi-replica.",
    body: (
      <>
        For multi-instance apps and serverless. Share an existing pool or pass
        a connection string. Works with Neon, Supabase, Railway, or any
        Postgres.
      </>
    ),
  },
];

const RUNTIMES: PropertyItem[] = [
  {
    title: "Long-running process.",
    body: (
      <>
        Node, Bun, Docker, VPS, Fly. Call <code>dk.start()</code> to poll
        continuously. Works with SQLite or Postgres.
      </>
    ),
  },
  {
    title: "Serverless and cron.",
    body: (
      <>
        Vercel, Lambda. A cron route calls <code>dk.poll()</code> on a schedule
        to drain due jobs. Postgres only.{" "}
        <a href={LINKS.githubDeploy}>See the deploy guide&nbsp;↗</a>
      </>
    ),
  },
  {
    title: "Posthook webhook delivery.",
    body: (
      <>
        <a href={LINKS.posthook}>Posthook</a> fires each job as a webhook at
        the scheduled time. No cron, no long-running process.
      </>
    ),
  },
];

const WHEN_NOT_TO_USE: PropertyItem[] = [
  {
    title: "setTimeout if the timer fits in one request.",
    body: (
      <>
        Or if losing the timer on restart is acceptable. The standard library
        is enough.
      </>
    ),
  },
  {
    title: "A queue for short-lived high-throughput jobs.",
    body: (
      <>
        BullMQ and friends are Redis-backed and tuned for that shape. DelayKit
        composes cleanly with one: schedule with DelayKit, enqueue from the
        handler.
      </>
    ),
  },
  {
    title: "A workflow engine for multi-step pipelines.",
    body: (
      <>
        Inngest and Temporal track state across steps, branch on outcomes,
        and retry the whole chain when a step fails. DelayKit handles
        durable waits, but the multi-step flow itself is DIY.
      </>
    ),
  },
];

export default function Home() {
  const homepagePatterns = getHomepagePatterns();

  return (
    <main className="guide">
      <NavBar />

      {/* HERO */}
      <section className="hero hero-split reveal reveal-1">
        <div className="hero-left">
          <h2 className="hero-headline">
            Durable wake‑ups for TypeScript apps and agents.
          </h2>
          <p className="hero-subhead">
            Reminders, expirations, retries, debounces, and agent resumes.
            Backed by Postgres or SQLite.
          </p>
          <InlineInstall />
          <div className="hero-actions">
            <a className="cta cta-primary" href={LINKS.github}>
              View on GitHub
              <span aria-hidden="true"> ↗</span>
            </a>
            <a href="#patterns" className="hero-down">
              ↓&nbsp; What you can do with it
            </a>
          </div>
        </div>

        <div className="hero-right">
          <PrimitiveDiagrams />
        </div>
      </section>

      {/* CODE TASTE */}
      <section className="taste reveal reveal-2">
        <SectionHeader eyebrow="Code" title="What it looks like" />
        <CodeSnippet source={TASTE_SOURCE} className="taste-snippet" />
      </section>

      {/* PATTERNS GRID */}
      <section className="patterns reveal reveal-3" id="patterns">
        <SectionHeader eyebrow="Patterns" title="What you can do with it" />
        <div className="pattern-grid">
          {homepagePatterns.map((pattern) => (
            <PatternCard key={pattern.slug} pattern={pattern} />
          ))}
        </div>
        <p className="pattern-all-link">
          <Link href="/patterns">See all patterns ↗</Link>
        </p>
      </section>

      {/* PROPERTIES */}
      <section className="properties reveal reveal-4">
        <SectionHeader
          eyebrow="Properties"
          title="What DelayKit handles"
        />
        <PropertyList items={PROPERTIES} />
      </section>

      {/* WHERE IT RUNS — STORES */}
      <section className="deploy reveal reveal-4" id="stores">
        <SectionHeader eyebrow="Stores" title="Pick a store" />
        <PropertyList items={STORES} />
      </section>

      {/* WHERE IT RUNS — RUNTIMES */}
      <section className="deploy reveal reveal-4" id="runtime">
        <SectionHeader eyebrow="Runtimes" title="Pick a runtime" />
        <PropertyList items={RUNTIMES} />
      </section>

      {/* BOUNDARIES */}
      <section className="properties reveal reveal-4" id="boundaries">
        <SectionHeader
          eyebrow="Boundaries"
          title="When not to use it"
        />
        <PropertyList items={WHEN_NOT_TO_USE} />
      </section>

      <Colophon lead="The fire badge is a live DelayKit demo." />
    </main>
  );
}
