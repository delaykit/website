import { FireBadge } from "./fire-badge";
import { HeaderActions } from "./header-actions";

// NavBar is a pure server component — the fire badge fetches its own
// state on the client now, so this component has no dynamic dependency
// and pages using it can be statically rendered.
export function NavBar() {
  return (
    <header className="nav-bar reveal reveal-1">
      <h1 className="nav-wordmark">
        <a href="/" aria-label="DelayKit home">
          DelayKit
        </a>
      </h1>
      <div className="nav-center">
        <FireBadge />
      </div>
      <HeaderActions />
    </header>
  );
}
