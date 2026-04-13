import Link from "next/link";
import type { Pattern } from "@/lib/patterns";

export function PatternCard({ pattern }: { pattern: Pattern }) {
  return (
    <Link href={`/patterns/${pattern.slug}`} className="pattern-card">
      <h3 className="pattern-name">{pattern.name}</h3>
      <p className="pattern-desc">{pattern.short ?? pattern.description}</p>
      <div className="pattern-signature-wrap">
        <code className="pattern-signature">
          <span className="pattern-signature-mark" aria-hidden="true">
            ↳
          </span>
          {pattern.signature}
        </code>
        {pattern.signatureNote && (
          <div className="pattern-signature-note">
            <span className="pattern-signature-note-mark" aria-hidden="true">
              ◦
            </span>
            {pattern.signatureNote}
          </div>
        )}
      </div>
    </Link>
  );
}
