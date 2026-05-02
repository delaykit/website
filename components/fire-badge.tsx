"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const WAIT_MS = 30 * 60 * 1000;
// Briefly lock the button after each click. Prevents double-fires and
// holds the UI steady until the CDN cache has refreshed past the click —
// any poll responses that arrive during this window are discarded, so a
// cached pre-click snapshot can't flicker over the optimistic state.
const COOLDOWN_MS = 3000;
// Coalesce bursts of refresh signals (e.g. cursor entering and re-entering
// the badge) into at most one fetch per second.
const REFRESH_THROTTLE_MS = 1000;

function describe(firesAt: number | null, now: number): string {
  if (firesAt === null || firesAt <= now) return "out";
  const min = Math.floor((firesAt - now) / 60000);
  if (min < 1) return "<1m left";
  return `${min}m left`;
}

type FireState = {
  clicks: number;
  firesAt: string | null;
};

export function FireBadge({ initialState }: { initialState: FireState }) {
  const [state, setState] = useState<FireState>(initialState);
  // `now` is intentionally not on a timer. We bump it on user signals
  // (visibility change / window focus / button hover / click), which is
  // when the displayed time actually needs to be fresh. An idle page
  // does zero per-second work.
  const [now, setNow] = useState(() => Date.now());
  const [cooling, setCooling] = useState(false);
  const inFlight = useRef(false);
  const cooldownUntil = useRef(0);
  const lastRefresh = useRef(0);

  const applyServerState = useCallback(
    (data: { current: FireState }, opts?: { fromClick?: boolean }) => {
      if (!opts?.fromClick && Date.now() < cooldownUntil.current) return;
      setState((prev) =>
        prev.clicks === data.current.clicks &&
        prev.firesAt === data.current.firesAt
          ? prev
          : { clicks: data.current.clicks, firesAt: data.current.firesAt },
      );
    },
    [],
  );

  const refresh = useCallback(async () => {
    const t = Date.now();
    if (t - lastRefresh.current < REFRESH_THROTTLE_MS) return;
    if (t < cooldownUntil.current) return;
    lastRefresh.current = t;
    setNow(t);
    if (typeof document !== "undefined" && document.hidden) return;
    try {
      const res = await fetch("/api/state", { cache: "no-store" });
      if (res.ok) applyServerState(await res.json());
    } catch {
      // ignore
    }
  }, [applyServerState]);

  // Refresh when the user re-engages with the page — no idle polling.
  useEffect(() => {
    const onVisibility = () => {
      if (!document.hidden) refresh();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", refresh);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  const click = useCallback(async () => {
    if (inFlight.current) return;
    if (Date.now() < cooldownUntil.current) return;
    inFlight.current = true;
    cooldownUntil.current = Date.now() + COOLDOWN_MS;
    setCooling(true);

    // Optimistic update — the server response will reconcile.
    const t = Date.now();
    setState((prev) => ({
      clicks: prev.clicks + 1,
      firesAt: new Date(t + WAIT_MS).toISOString(),
    }));
    setNow(t);

    try {
      const res = await fetch("/api/click", { method: "POST" });
      if (res.ok) applyServerState(await res.json(), { fromClick: true });
    } catch {
      // ignore
    } finally {
      inFlight.current = false;
      setTimeout(() => setCooling(false), COOLDOWN_MS);
    }
  }, [applyServerState]);

  const firesAt = state.firesAt ? new Date(state.firesAt).getTime() : null;
  const isAlive = firesAt !== null && firesAt > now;
  const display = describe(firesAt, now);

  const tooltip = isAlive ? "tend the fire" : "light the fire";

  return (
    <button
      type="button"
      onClick={click}
      onMouseEnter={refresh}
      onFocus={refresh}
      disabled={cooling}
      className={`fire-badge ${cooling ? "cooling" : ""} ${isAlive ? "" : "is-out"}`}
      aria-label={isAlive ? "Tend the fire" : "Light the fire"}
      data-tooltip={tooltip}
    >
      <FlameMark alive={isAlive} />
      <span className="fire-stats">
        <span className="fire-count">{state.clicks}</span>
        <span className="fire-sep" aria-hidden="true">
          ·
        </span>
        <span className="fire-time" suppressHydrationWarning>
          {display}
        </span>
      </span>
    </button>
  );
}

// Lucide flame icon — a single clean stroke that reads as a flame at any
// size. Color comes from currentColor so the badge can swap ink → stamp
// red when alive vs dim when out.
function FlameMark({ alive }: { alive: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={alive ? "flame-mark flame-mark-alive" : "flame-mark flame-mark-out"}
      aria-hidden="true"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}
