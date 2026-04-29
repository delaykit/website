import type { ReactNode } from "react";
import { INSTALL_BUN, INSTALL_NPM, LINKS } from "@/lib/links";

/**
 * Install commands + primary GitHub CTA, with an optional secondary
 * link (e.g. "↓ What you can do with it" on the homepage).
 */
export function InstallCta({ secondary }: { secondary?: ReactNode }) {
  return (
    <>
      <div className="install-line">
        <span className="install-prompt" aria-hidden="true">
          $
        </span>
        <span className="install-cmd">{INSTALL_NPM}</span>
      </div>
      <div className="install-line">
        <span className="install-prompt" aria-hidden="true">
          $
        </span>
        <span className="install-cmd">{INSTALL_BUN}</span>
      </div>

      <div className="hero-actions">
        <a className="cta cta-primary" href={LINKS.github}>
          View on GitHub
          <span aria-hidden="true"> ↗</span>
        </a>
        {secondary}
      </div>
    </>
  );
}
