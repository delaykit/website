/**
 * Hero illustration: an engraved-style "instrument plate" showing the
 * three core DelayKit primitives as antique tools laid out on a printed
 * specimen plate.
 *
 *   - schedule  → pocket chronometer
 *   - debounce  → settling bell
 *   - throttle  → metronome
 *
 * The whole composition is a single inline SVG so it can be exported
 * verbatim as a static asset for the README banner / OG image. The
 * plate is a still engraving by default — animations only run while
 * the cursor is hovering the SVG, so idle CPU is zero. Implemented
 * entirely in CSS via `animation-play-state` and `:hover` so this
 * stays a pure server component.
 */

const W = 380;
const H = 240;

// Three cells laid out horizontally
const CELL_CENTERS = [65, 190, 315];
const ART_Y = 120;
const LABEL_Y = 195;

export function PrimitiveDiagrams() {
  return (
    <div className="plate">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="plate-svg"
        role="img"
        aria-label="Instrument plate: a pocket chronometer (schedule), a settling bell (debounce), and a metronome (throttle)."
      >
        <Cartouche />
        <Eyebrow />

        <Chronometer cx={CELL_CENTERS[0]} cy={ART_Y} />
        <Bell cx={CELL_CENTERS[1]} cy={ART_Y} />
        <Metronome cx={CELL_CENTERS[2]} cy={ART_Y} />

        <text x={CELL_CENTERS[0]} y={LABEL_Y} className="plate-label">
          schedule
        </text>
        <text x={CELL_CENTERS[1]} y={LABEL_Y} className="plate-label">
          debounce
        </text>
        <text x={CELL_CENTERS[2]} y={LABEL_Y} className="plate-label">
          throttle
        </text>
      </svg>
    </div>
  );
}

function Cartouche() {
  return (
    <g className="plate-stroke">
      <rect
        x={4}
        y={4}
        width={W - 8}
        height={H - 8}
        fill="none"
        strokeWidth={0.8}
      />
      <rect
        x={10}
        y={10}
        width={W - 20}
        height={H - 20}
        fill="none"
        strokeWidth={1.2}
      />
    </g>
  );
}

function Eyebrow() {
  return (
    <g>
      {/* knockout box that interrupts the top rule */}
      <rect
        x={W / 2 - 50}
        y={4}
        width={100}
        height={12}
        className="plate-knockout"
      />
      <text x={W / 2} y={13} className="plate-eyebrow">
        PLATE  I
      </text>
      <text x={W / 2} y={32} className="plate-title">
        instruments of the kit
      </text>
    </g>
  );
}

/* ---------- INSTRUMENTS ---------- */

// Round float math to 4 decimal places so SSR and CSR emit the exact
// same SVG attribute strings. Without this, Math.cos/sin can render as
// e.g. "29.444863728670914" on the server and "29.44486372867091" on
// the client, triggering a React hydration mismatch.
const q = (n: number) => Math.round(n * 10000) / 10000;

function Chronometer({ cx, cy }: { cx: number; cy: number }) {
  const R = 38;
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const long = i % 3 === 0;
    const r1 = R - (long ? 7 : 4);
    const r2 = R - 1;
    return {
      x1: q(Math.cos(a) * r1),
      y1: q(Math.sin(a) * r1),
      x2: q(Math.cos(a) * r2),
      y2: q(Math.sin(a) * r2),
      long,
    };
  });
  // Hatching on the lower-left for engraved depth
  const hatch = Array.from({ length: 7 }, (_, i) => i);
  return (
    <g transform={`translate(${cx} ${cy})`}>
      {/* crown */}
      <g className="plate-stroke" strokeWidth={1}>
        <line x1={0} y1={-R - 8} x2={0} y2={-R - 4} />
        <rect
          x={-4}
          y={-R - 4}
          width={8}
          height={4}
          fill="none"
          strokeWidth={1}
        />
      </g>
      {/* lower-left hatching */}
      <g className="plate-hatch">
        {hatch.map((i) => {
          const a = (Math.PI * 7) / 6 - i * 0.04;
          const r0 = R + 1.5;
          const r1 = R + 6 + (i % 2);
          return (
            <line
              key={i}
              x1={q(Math.cos(a) * r0)}
              y1={q(Math.sin(a) * r0)}
              x2={q(Math.cos(a) * r1)}
              y2={q(Math.sin(a) * r1)}
            />
          );
        })}
      </g>
      {/* outer rim */}
      <circle cx={0} cy={0} r={R} className="plate-stroke-bold" fill="none" />
      <circle
        cx={0}
        cy={0}
        r={R - 3}
        className="plate-stroke"
        fill="none"
        strokeWidth={0.7}
      />
      {/* tick marks */}
      <g className="plate-stroke" strokeWidth={0.8}>
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            strokeWidth={t.long ? 1.1 : 0.7}
          />
        ))}
      </g>
      {/* fine inner ring */}
      <circle
        cx={0}
        cy={0}
        r={R - 14}
        className="plate-stroke"
        fill="none"
        strokeWidth={0.5}
        strokeDasharray="0.8 1.6"
      />
      {/* second hand — thin needle, slow continuous sweep, behind the bold hands */}
      <g className="plate-second-hand">
        <path
          d="M -0.5 2 L 0.5 2 L 0 -30 Z"
          className="plate-second-hand-needle"
        />
      </g>
      {/* hands: minute pointing 12, hour pointing 2 (+24h) */}
      <line
        x1={0}
        y1={0}
        x2={0}
        y2={-R + 8}
        className="plate-stroke-bold"
        strokeWidth={1.4}
      />
      <line
        x1={0}
        y1={0}
        x2={16}
        y2={-9}
        className="plate-stroke-accent"
        strokeWidth={1.6}
      />
      {/* center pin */}
      <circle cx={0} cy={0} r={2.2} className="plate-fill" stroke="none" />
      <circle
        cx={0}
        cy={0}
        r={2.2}
        className="plate-stroke"
        fill="none"
        strokeWidth={0.6}
      />
    </g>
  );
}

function Bell({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      {/* hanging eyelet */}
      <g className="plate-stroke" strokeWidth={1} fill="none">
        <path d="M -3 -52 q -3 -6 0 -10 q 3 -2 6 0 q 3 4 0 10" />
      </g>
      {/* bell body — flared base */}
      <g className="plate-stroke-bold" fill="none" strokeWidth={1.2}>
        <path d="M -25 -2 Q -28 -36 0 -42 Q 28 -36 25 -2 L 30 -2 L 30 2 L -30 2 L -30 -2 Z" />
      </g>
      {/* inner shading line */}
      <path
        d="M -20 -4 Q -22 -30 0 -36"
        className="plate-stroke"
        fill="none"
        strokeWidth={0.6}
      />
      {/* clapper — animated, hangs from a pivot at bell-local (0, -26) */}
      <g transform="translate(0 -26)">
        <g className="plate-clapper">
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={18}
            className="plate-stroke"
            strokeWidth={0.8}
          />
          <circle cx={0} cy={19} r={2.4} className="plate-fill" stroke="none" />
        </g>
      </g>
      {/* settling sound rings — staggered pulse */}
      <g className="plate-stroke" fill="none">
        <path
          d="M -42 16 Q 0 24 42 16"
          strokeWidth={0.9}
          className="plate-ring plate-ring-1"
        />
        <path
          d="M -34 26 Q 0 32 34 26"
          strokeWidth={0.7}
          strokeDasharray="2 1.5"
          className="plate-ring plate-ring-2"
        />
        <path
          d="M -24 34 Q 0 38 24 34"
          strokeWidth={0.5}
          strokeDasharray="1 1.5"
          className="plate-ring plate-ring-3"
        />
      </g>
      {/* tiny accent dot — the moment of the single fire */}
      <circle
        cx={0}
        cy={42}
        r={1.6}
        className="plate-fill-accent"
        stroke="none"
      />
    </g>
  );
}

function Metronome({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      {/* base shadow hatching */}
      <g className="plate-hatch">
        {Array.from({ length: 9 }, (_, i) => (
          <line
            key={i}
            x1={-26 + i * 6}
            y1={36}
            x2={-22 + i * 6}
            y2={42}
          />
        ))}
      </g>
      {/* base */}
      <line
        x1={-30}
        y1={32}
        x2={30}
        y2={32}
        className="plate-stroke-bold"
        strokeWidth={1.2}
      />
      {/* pyramid body */}
      <g className="plate-stroke-bold" fill="none" strokeWidth={1.2}>
        <path d="M -22 32 L 22 32 L 14 -28 L -14 -28 Z" />
      </g>
      {/* face plate inside */}
      <path
        d="M -16 28 L 16 28 L 11 -22 L -11 -22 Z"
        className="plate-stroke"
        fill="none"
        strokeWidth={0.5}
      />
      {/* scale ticks down the centerline */}
      <g className="plate-stroke" strokeWidth={0.6}>
        {[-18, -10, -2, 6, 14, 22].map((y, i) => (
          <line key={i} x1={-3} y1={y} x2={3} y2={y} />
        ))}
      </g>
      {/* swing-arc hint — static, sits behind the moving pendulum */}
      <path
        d="M -23 -39 Q 0 -32 23 -39"
        className="plate-stroke"
        fill="none"
        strokeWidth={0.6}
        strokeDasharray="1.4 2"
      />
      {/* pendulum — animated, pivots inside the body at metronome-local (0, 14) */}
      <g transform="translate(0 14)">
        <g className="plate-pendulum">
          {/* rod */}
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={-58}
            className="plate-stroke-bold"
            strokeWidth={1.2}
          />
          {/* weight (red accent) */}
          <rect
            x={-7}
            y={-46}
            width={14}
            height={6}
            className="plate-fill-accent"
            stroke="none"
          />
          <rect
            x={-7}
            y={-46}
            width={14}
            height={6}
            className="plate-stroke"
            fill="none"
            strokeWidth={0.7}
          />
          {/* top finial */}
          <circle cx={0} cy={-60} r={2.2} className="plate-fill" stroke="none" />
        </g>
      </g>
    </g>
  );
}
