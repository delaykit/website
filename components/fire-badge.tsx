"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Poller } from "./poller";

const WAIT_MS = 30 * 60 * 1000;
// Briefly lock the button after each click. Prevents double-fires and
// holds the UI steady until the CDN cache has refreshed past the click —
// any poll responses that arrive during this window are discarded, so a
// cached pre-click snapshot can't flicker over the optimistic state.
const COOLDOWN_MS = 3000;

function formatCountdown(remainingMs: number | null): string {
  if (remainingMs === null || remainingMs <= 0) return "out";
  const totalSec = Math.floor(remainingMs / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type FireState = {
  clicks: number;
  firesAt: string | null;
};

export function FireBadge({ initialState }: { initialState: FireState }) {
  const [state, setState] = useState<FireState>(initialState);
  // Countdown only needs second-level precision; tick every 1s.
  const [now, setNow] = useState(() => Date.now());
  const [cooling, setCooling] = useState(false);
  const inFlight = useRef(false);
  const cooldownUntil = useRef(0);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

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
    try {
      const res = await fetch("/api/state", { cache: "no-store" });
      if (res.ok) applyServerState(await res.json());
    } catch {
      // ignore
    }
  }, [applyServerState]);

  const click = useCallback(async () => {
    if (inFlight.current) return;
    if (Date.now() < cooldownUntil.current) return;
    inFlight.current = true;
    cooldownUntil.current = Date.now() + COOLDOWN_MS;
    setCooling(true);

    // Optimistic update — the server response will reconcile.
    setState((prev) => ({
      clicks: prev.clicks + 1,
      firesAt: new Date(Date.now() + WAIT_MS).toISOString(),
    }));

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
  const remainingMs = firesAt ? Math.max(0, firesAt - now) : null;
  const isAlive = remainingMs !== null && remainingMs > 0;

  const tooltip = isAlive ? "tend the fire" : "light the fire";

  return (
    <button
      type="button"
      onClick={click}
      disabled={cooling}
      className={`fire-badge ${cooling ? "cooling" : ""} ${isAlive ? "" : "is-out"}`}
      aria-label={isAlive ? "Tend the fire" : "Light the fire"}
      data-tooltip={tooltip}
    >
      <Poller onUpdate={refresh} interval={2000} />
      <FlameMark alive={isAlive} />
      <span className="fire-stats">
        <span className="fire-count">{state.clicks}</span>
        <span className="fire-sep" aria-hidden="true">
          ·
        </span>
        <span className="fire-time" suppressHydrationWarning>
          {formatCountdown(remainingMs)}
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
