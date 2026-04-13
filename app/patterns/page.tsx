import type { Metadata } from "next";
import Link from "next/link";
import { NavBar } from "@/components/nav-bar";
import { PatternCard } from "@/components/pattern-card";
import { SectionHeader } from "@/components/section-header";
import { Colophon } from "@/components/colophon";
import { patterns } from "@/lib/patterns";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Patterns — DelayKit",
  description:
    "A catalog of things you can do with DelayKit. Reminders, expirations, debounce, throttle, retries, cleanup — each with concrete code.",
};

export default function PatternsIndex() {
  return (
    <main className="guide">
      <NavBar />

      <section className="hero reveal reveal-1">
        <SectionHeader
          eyebrow="Patterns"
          title="A catalog of things you can do with DelayKit"
          titleClassName="patterns-index-title"
        />
        <p className="title-sub">
          Each pattern maps a concrete problem to the DelayKit API. If
          you&rsquo;re not sure which one you need, start with{" "}
          <Link href="/patterns/send-a-reminder">Send a reminder</Link> or{" "}
          <Link href="/patterns/debounce-a-flurry">Debounce a flurry</Link>.
        </p>
      </section>

      <section className="patterns reveal reveal-2">
        <div className="pattern-grid">
          {patterns.map((pattern) => (
            <PatternCard key={pattern.slug} pattern={pattern} />
          ))}
        </div>
      </section>

      <Colophon lead={<Link href="/">← back to the homepage</Link>} />
    </main>
  );
}
