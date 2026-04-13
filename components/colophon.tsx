import type { ReactNode } from "react";
import { LINKS } from "@/lib/links";

/**
 * Footer used on every page. The `lead` slot is the left-most element
 * (either a tagline on the homepage, or a back-link on nested pages).
 */
export function Colophon({ lead }: { lead: ReactNode }) {
  return (
    <footer className="colophon reveal reveal-3">
      <p>
        {lead}
        {" · "}
        <a href={LINKS.github}>GitHub</a>
        {" · "}
        <a href={LINKS.npm}>npm</a>
        {" · "}
        <a href={LINKS.posthook}>Posthook</a>
      </p>
    </footer>
  );
}
