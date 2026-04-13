import { FireBadge } from "./fire-badge";
import { HeaderActions } from "./header-actions";
import { getState } from "@/lib/store";

// NavBar is a server component that fetches the current fire state itself,
// so pages can just drop <NavBar /> without threading props.
// If the database is unreachable, the fire badge gracefully hides.
export async function NavBar() {
  let fire = { clicks: 0, firesAt: null as string | null };
  let dbAvailable = true;

  try {
    const initial = await getState();
    fire = {
      clicks: initial.current.clicks,
      firesAt: initial.current.firesAt
        ? new Date(initial.current.firesAt).toISOString()
        : null,
    };
  } catch {
    dbAvailable = false;
  }

  return (
    <header className="nav-bar reveal reveal-1">
      <h1 className="nav-wordmark">
        <a href="/" aria-label="DelayKit home">
          DelayKit
        </a>
      </h1>
      <div className="nav-center">
        {dbAvailable && <FireBadge initialState={fire} />}
      </div>
      <HeaderActions />
    </header>
  );
}
