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
    title: "Uses the Postgres you already have.",
    body: (
      <>
        No Redis, no managed queue. DelayKit creates its own table and handles
        migrations automatically.
      </>
    ),
  },
  {
    title: "Jobs survive restarts and deploys.",
    body: (
      <>
        Postgres-backed, not memory. Crash, redeploy, scale. They&rsquo;re
        still there.
      </>
    ),
  },
  {
    title: "No duplicate pending jobs.",
    body: (
      <>
        Same handler + key won&rsquo;t queue twice. Safe to call from any
        request handler.
      </>
    ),
  },
  {
    title: "Retries built in.",
    body: (
      <>
        Handlers retry on failure with configurable backoff. No extra wiring.
      </>
    ),
  },
  {
    title: "Works in dev and on Vercel.",
    body: (
      <>
        PollingScheduler locally, Posthook or Vercel Cron in production. Same
        handlers, same store.
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
          <h2 className="hero-headline">The timing layer for Next.js.</h2>
          <p className="hero-subhead">
            Remind users who haven&rsquo;t activated. Expire trials. Reindex
            once after edits settle.
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

      <Colophon lead="The fire badge is a live DelayKit demo." />
    </main>
  );
}
