import Link from "next/link";
import { NavBar } from "@/components/nav-bar";
import { getHomepagePatterns } from "@/lib/patterns";
import { PatternCard } from "@/components/pattern-card";
import { CodeSnippet } from "@/components/code-snippet";
import { SectionHeader } from "@/components/section-header";
import { InstallCta } from "@/components/install-cta";
import { Colophon } from "@/components/colophon";
import { PropertyList, type PropertyItem } from "@/components/property-list";
import { LINKS } from "@/lib/links";

export const dynamic = "force-dynamic";

const HERO_SOURCE = `// handler checks state, retries on failure
dk.handle("remind", {
  handler: async ({ key }) => {
    const user = await db.users.find(key);
    if (user.onboarded) return;
    await sendEmail(user.email, "heads up");
  },
  retry: {
    attempts: 5,
    backoff: "exponential",
  },
});

// schedule it for 24 hours from now
await dk.schedule("remind", {
  key: "user_123",
  delay: "24h",
});`;

const PROPERTIES: PropertyItem[] = [
  {
    title: "The store row is the source of truth.",
    body: (
      <>
        Your Postgres holds the jobs table and runs migrations on first
        connect. The scheduler only fires the trigger when it&rsquo;s time.
      </>
    ),
  },
  {
    title: "Jobs survive restarts and deploys.",
    body: (
      <>
        They&rsquo;re in Postgres, not memory. Crash, deploy, scale
        &mdash; they don&rsquo;t go away.
      </>
    ),
  },
  {
    title: "Keys, not payloads.",
    body: (
      <>
        There is no data field. Handlers receive the key and fetch current
        state when they run. Fresh data, not stale snapshots from scheduling
        time.
      </>
    ),
  },
  {
    title: "At most one active job per handler + key.",
    body: (
      <>
        Safe to call from request handlers without deduplication logic.
      </>
    ),
  },
  {
    title: "Swappable schedulers.",
    body: (
      <>
        Poll in dev with a long-running process. In production, a Vercel
        cron calls <code>dk.poll()</code> on your route, or Posthook
        delivers each job as a webhook. Same handlers, same store.
      </>
    ),
  },
  {
    title: "Stalled job recovery.",
    body: (
      <>
        If a process crashes mid-execution, the job stays in Postgres and
        is reclaimed on the next poll cycle. Handlers should be idempotent
        as they may re-execute after crash recovery.
      </>
    ),
  },
];

const DEPLOY: PropertyItem[] = [
  {
    title: "Vercel + Posthook — managed delivery.",
    body: (
      <>
        <a href={LINKS.posthook}>Posthook</a> fires each job as a webhook at
        the scheduled time. No cron route, no long-running process.
      </>
    ),
  },
  {
    title: "Vercel + cron — self-hosted polling.",
    body: (
      <>
        A Vercel Cron route calls <code>dk.poll()</code> on a schedule to
        drain due jobs, well inside the 10s function limit. No external
        scheduler required.{" "}
        <a href={LINKS.githubDeploy}>See the deploy guide&nbsp;↗</a>
      </>
    ),
  },
  {
    title: "Auto-migrates on first connect.",
    body: (
      <>
        Works with Neon, Supabase, Railway &mdash; any Postgres. On a
        long-running server, call <code>dk.start()</code> instead of{" "}
        <code>dk.poll()</code>.
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
          <h2 className="hero-headline">Run code later in Next.js.</h2>
          <p className="hero-subhead">
            A setTimeout backed by Postgres — with retries built in.
          </p>
          <InstallCta
            secondary={
              <a href="#patterns" className="hero-down">
                ↓&nbsp; What you can do with it
              </a>
            }
          />
        </div>

        <div className="hero-right">
          <CodeSnippet source={HERO_SOURCE} className="hero-code" />
        </div>
      </section>

      {/* PATTERNS GRID */}
      <section className="patterns reveal reveal-2" id="patterns">
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
      <section className="properties reveal reveal-3">
        <SectionHeader
          eyebrow="Properties"
          title="The shape of it"
        />
        <PropertyList items={PROPERTIES} />
      </section>

      {/* WORKS ON VERCEL */}
      <section className="deploy reveal reveal-3" id="deploy">
        <SectionHeader eyebrow="Deploy" title="Works on Vercel" />
        <PropertyList
          items={DEPLOY}
        />
      </section>

      <Colophon lead="The fire keeps to the top of the page." />
    </main>
  );
}
