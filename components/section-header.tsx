import type { ReactNode } from "react";

/**
 * The repeated section header pattern: a small red eyebrow label
 * with an h2 below it. Used everywhere we introduce a new section.
 */
export function SectionHeader({
  eyebrow,
  title,
  titleClassName,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  titleClassName?: string;
}) {
  return (
    <>
      <div className="section-eyebrow">{eyebrow}</div>
      <h2 className={`section-title-h2 ${titleClassName ?? ""}`}>{title}</h2>
    </>
  );
}
