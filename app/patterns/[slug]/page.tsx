import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NavBar } from "@/components/nav-bar";
import { CodeSnippet } from "@/components/code-snippet";
import { PatternCard } from "@/components/pattern-card";
import { SectionHeader } from "@/components/section-header";
import { InstallCta } from "@/components/install-cta";
import { Colophon } from "@/components/colophon";
import {
  getPattern,
  getRelatedPatterns,
  patterns,
} from "@/lib/patterns";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return patterns.map((pattern) => ({ slug: pattern.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pattern = getPattern(slug);
  if (!pattern) return { title: "Not found" };
  return {
    title: `${pattern.seo.title}. DelayKit.`,
    description: pattern.seo.description,
  };
}

export default async function PatternPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pattern = getPattern(slug);
  if (!pattern) notFound();

  const related = getRelatedPatterns(pattern.related);

  return (
    <main className="guide">
      <NavBar />

      <article className="pattern-page reveal reveal-1">
        <nav className="pattern-crumb">
          <Link href="/patterns">← Patterns</Link>
        </nav>

        <header className="pattern-page-header">
          <h2 className="pattern-page-title">{pattern.name}</h2>
          <p className="pattern-page-desc">{pattern.description}</p>
        </header>

        <section className="pattern-use-when">
          <div className="section-eyebrow">Use this to</div>
          <ul className="use-when-list">
            {pattern.useWhen.map((item) => (
              <li key={item}>
                <span className="use-when-mark" aria-hidden="true">
                  §
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="pattern-examples">
          <div className="section-eyebrow">Code</div>
          {pattern.examples.map((example) => (
            <div key={example.label ?? example.source} className="example-block">
              {example.label && (
                <div className="example-label">{example.label}</div>
              )}
              <CodeSnippet source={example.source} />
            </div>
          ))}
        </section>

        <section className="pattern-cta">
          <InstallCta
            secondary={
              <Link href="/patterns" className="hero-down">
                ← Back to all patterns
              </Link>
            }
          />
        </section>

        {related.length > 0 && (
          <section className="pattern-related">
            <div className="section-eyebrow">Related patterns</div>
            <div className="pattern-grid">
              {related.map((p) => (
                <PatternCard key={p.slug} pattern={p} />
              ))}
            </div>
          </section>
        )}
      </article>

      <Colophon lead={<Link href="/">← DelayKit home</Link>} />
    </main>
  );
}
