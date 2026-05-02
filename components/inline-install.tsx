"use client";

import { INSTALL_BUN, INSTALL_NPM } from "@/lib/links";

/**
 * Compact single-line install pill: both npm and bun commands on one
 * terminal-flavored line, each preceded by its own `$` prompt. Clicking
 * a command programmatically selects just that command's text — single
 * click is enough, the user can immediately Cmd/Ctrl+C to copy.
 */

function selectContents(el: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = window.getSelection();
  if (!sel) return;
  sel.removeAllRanges();
  sel.addRange(range);
}

function Cmd({ text }: { text: string }) {
  const handle = (e: React.MouseEvent<HTMLSpanElement> | React.KeyboardEvent<HTMLSpanElement>) => {
    selectContents(e.currentTarget);
  };
  return (
    <span
      className="install-cmd"
      role="button"
      tabIndex={0}
      onClick={handle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handle(e);
        }
      }}
    >
      {text}
    </span>
  );
}

export function InlineInstall() {
  return (
    <div className="install-inline">
      <span className="install-pair">
        <span className="install-prompt" aria-hidden="true">
          $
        </span>
        <Cmd text={INSTALL_NPM} />
      </span>
      <span className="install-pair">
        <span className="install-prompt" aria-hidden="true">
          $
        </span>
        <Cmd text={INSTALL_BUN} />
      </span>
    </div>
  );
}
