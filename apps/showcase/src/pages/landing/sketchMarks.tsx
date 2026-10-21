import {
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

/**
 * Hand-drawn "sketch" accents for the guest landing page.
 *
 * The sloppy look is produced by an original lightweight generator (no external
 * drawing library): a small deterministic PRNG jitters points along each shape,
 * and the points are smoothed into Bézier curves (Catmull-Rom). Edges wobble
 * perpendicular to their direction and every shape is drawn in two passes for a
 * hand-sketched feel.
 */

type Point = [number, number];

type SketchProps = {
  className?: string;
  color?: string;
  strokeWidth?: number;
};

/** Sloppiness → wobble amplitude. `medium` matches the original default look. */
export type Sloppiness = 'low' | 'medium' | 'high';
const SLOPPINESS_AMPLITUDE: Record<Sloppiness, number> = {
  low: 0.9,
  medium: 1.8,
  high: 3.2,
};

/** Stroke width preset → px. `medium` matches the original default look. */
export type StrokeWidthLevel = 'thin' | 'medium' | 'bold' | 'heavy';
const STROKE_WIDTH_PX: Record<StrokeWidthLevel, number> = {
  thin: 1.1,
  medium: 1.6,
  bold: 2.6,
  heavy: 4,
};

export type StrokeStyle = 'solid' | 'dashed' | 'dotted';

/**
 * SVG `stroke-dasharray` for a stroke style, or undefined for solid. The gap is
 * parameterized by stroke width so thicker lines get proportionally wider gaps.
 * Lengths are in px because the frame's viewBox equals its pixel size. Dotted
 * uses a near-zero dash with the path's round linecaps to render as dots.
 */
function dashArrayFor(style: StrokeStyle, widthPx: number): string | undefined {
  if (style === 'dashed') return `8 ${round(6 + widthPx)}`;
  if (style === 'dotted') return `0.1 ${round(4 + widthPx)}`;
  return undefined;
}

/**
 * mulberry32 — a tiny, fast, public-domain PRNG. A fixed seed yields a stable
 * wobble so the sketch does not jump between renders/resizes.
 */
function createRng(seed: number) {
  let state = seed >>> 0 || 0x9e3779b9;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (value: number) => Math.round(value * 100) / 100;

/** Smooth an ordered point list into an SVG path via Catmull-Rom → Bézier. */
function smooth(points: Point[], closed: boolean, tension = 1 / 6): string {
  const n = points.length;
  if (n < 2) return '';

  const at = (i: number): Point => {
    if (closed) return points[((i % n) + n) % n];
    return points[Math.max(0, Math.min(n - 1, i))];
  };

  let d = `M${round(points[0][0])} ${round(points[0][1])}`;
  const segments = closed ? n : n - 1;
  for (let i = 0; i < segments; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1x = p1[0] + (p2[0] - p0[0]) * tension;
    const c1y = p1[1] + (p2[1] - p0[1]) * tension;
    const c2x = p2[0] - (p3[0] - p1[0]) * tension;
    const c2y = p2[1] - (p3[1] - p1[1]) * tension;
    d += ` C${round(c1x)} ${round(c1y)} ${round(c2x)} ${round(c2y)} ${round(p2[0])} ${round(p2[1])}`;
  }
  return closed ? `${d} Z` : d;
}

/** A single hand-drawn segment with perpendicular wobble only. */
function handStroke(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  rng: () => number,
  amplitude: number,
): string {
  const dx = bx - ax;
  const dy = by - ay;
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;
  // Perpendicular jitter, damped on long edges so they stay mostly straight.
  const amp = amplitude * (length > 260 ? 0.55 : 1);
  const jitter = () => (rng() * 2 - 1) * amp;

  // Wobble only perpendicular to the edge so horizontal strokes stay between
  // the vertical sides (and vice versa).
  const start: Point = [ax + -uy * jitter(), ay + ux * jitter()];
  const end: Point = [bx + -uy * jitter(), by + ux * jitter()];

  const points: Point[] = [start];
  const steps = 3;
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    points.push([ax + dx * t + -uy * jitter(), ay + dy * t + ux * jitter()]);
  }
  points.push(end);

  return smooth(points, false);
}

/** Hand-drawn rectangle hugging the card contour (crossed corners). */
function sketchRectPath(
  width: number,
  height: number,
  pad: number,
  seed: number,
  amplitude: number,
  passes: number,
): string {
  const rng = createRng(seed);
  const l = pad;
  const t = pad;
  const r = width - pad;
  const b = height - pad;

  const pass = () =>
    [
      handStroke(l, t, r, t, rng, amplitude),
      handStroke(r, t, r, b, rng, amplitude),
      handStroke(r, b, l, b, rng, amplitude),
      handStroke(l, b, l, t, rng, amplitude),
    ].join(' ');

  const drawn: string[] = [];
  for (let i = 0; i < passes; i += 1) drawn.push(pass());
  return drawn.join(' ');
}

type PerimeterEdge = 'top' | 'right' | 'bottom' | 'left' | 'arc';

type PerimeterPoint = {
  point: Point;
  edge: PerimeterEdge;
  arcCenter?: Point;
};

function pushPerimeterPoint(
  points: PerimeterPoint[],
  point: Point,
  edge: PerimeterEdge,
  arcCenter?: Point,
) {
  const last = points.at(-1);
  if (
    last &&
    Math.hypot(point[0] - last.point[0], point[1] - last.point[1]) < 0.5
  ) {
    return;
  }
  points.push({ point, edge, arcCenter });
}

/** Sample a rounded-rect perimeter with extra points on straights and arcs. */
function buildRoundedRectPerimeter(
  l: number,
  t: number,
  r: number,
  b: number,
  rad: number,
): PerimeterPoint[] {
  const points: PerimeterPoint[] = [];
  const cornerSteps = 7;
  const straightSteps = 5;

  const addArc = (
    cx: number,
    cy: number,
    start: number,
    end: number,
    skipFirst = false,
  ) => {
    const center: Point = [cx, cy];
    for (let i = skipFirst ? 1 : 0; i <= cornerSteps; i += 1) {
      const angle = start + (end - start) * (i / cornerSteps);
      pushPerimeterPoint(
        points,
        [cx + Math.cos(angle) * rad, cy + Math.sin(angle) * rad],
        'arc',
        center,
      );
    }
  };

  const addStraight = (
    from: Point,
    to: Point,
    edge: Exclude<PerimeterEdge, 'arc'>,
  ) => {
    for (let i = 1; i <= straightSteps; i += 1) {
      const progress = i / straightSteps;
      pushPerimeterPoint(
        points,
        [
          from[0] + (to[0] - from[0]) * progress,
          from[1] + (to[1] - from[1]) * progress,
        ],
        edge,
      );
    }
  };

  addArc(l + rad, t + rad, Math.PI, Math.PI * 1.5);
  addStraight([l + rad, t], [r - rad, t], 'top');
  addArc(r - rad, t + rad, Math.PI * 1.5, Math.PI * 2, true);
  addStraight([r, t + rad], [r, b - rad], 'right');
  addArc(r - rad, b - rad, 0, Math.PI * 0.5, true);
  addStraight([r - rad, b], [l + rad, b], 'bottom');
  addArc(l + rad, b - rad, Math.PI * 0.5, Math.PI, true);
  addStraight([l, b - rad], [l, t + rad], 'left');

  return points;
}

function jitterPerimeterPoint(
  { point, edge, arcCenter }: PerimeterPoint,
  rng: () => number,
  amplitude: number,
): Point {
  const wobble = (rng() * 2 - 1) * amplitude;

  if (edge === 'top') return [point[0], point[1] + wobble * 0.45];
  if (edge === 'bottom') return [point[0], point[1] + wobble * 0.45];
  if (edge === 'left') return [point[0] + wobble * 0.45, point[1]];
  if (edge === 'right') return [point[0] + wobble * 0.45, point[1]];

  const [cx, cy] = arcCenter ?? point;
  const dx = point[0] - cx;
  const dy = point[1] - cy;
  const dist = Math.hypot(dx, dy) || 1;
  const scale = (dist + wobble * 0.55) / dist;
  return [cx + dx * scale, cy + dy * scale];
}

function clampPerimeterPoint(
  [x, y]: Point,
  edge: PerimeterEdge,
  l: number,
  t: number,
  r: number,
  b: number,
  rad: number,
  amplitude: number,
): Point {
  const slack = amplitude * 0.35;

  if (edge === 'top') {
    return [
      Math.min(r - rad, Math.max(l + rad, x)),
      Math.min(t + slack, Math.max(t - slack, y)),
    ];
  }
  if (edge === 'bottom') {
    return [
      Math.min(r - rad, Math.max(l + rad, x)),
      Math.min(b + slack, Math.max(b - slack, y)),
    ];
  }
  if (edge === 'left') {
    return [
      Math.min(l + slack, Math.max(l - slack, x)),
      Math.min(b - rad, Math.max(t + rad, y)),
    ];
  }
  if (edge === 'right') {
    return [
      Math.min(r + slack, Math.max(r - slack, x)),
      Math.min(b - rad, Math.max(t + rad, y)),
    ];
  }

  return [Math.min(r, Math.max(l, x)), Math.min(b, Math.max(t, y))];
}

/**
 * Hand-drawn rounded rectangle. Straights wobble only perpendicular to the
 * edge, arcs wobble radially, and a clip-friendly inset keeps curves inside.
 */
function sketchRoundedRectPath(
  width: number,
  height: number,
  pad: number,
  radius: number,
  seed: number,
  amplitude: number,
  passes: number,
): string {
  const rng = createRng(seed);
  const l = pad;
  const t = pad;
  const r = width - pad;
  const b = height - pad;
  const rad = Math.max(0, Math.min(radius, (r - l) / 2, (b - t) / 2));
  const perimeter = buildRoundedRectPerimeter(l, t, r, b, rad);

  const pass = (scale: number) =>
    smooth(
      perimeter.map((sample) =>
        clampPerimeterPoint(
          jitterPerimeterPoint(sample, rng, amplitude * scale),
          sample.edge,
          l,
          t,
          r,
          b,
          rad,
          amplitude * scale,
        ),
      ),
      true,
      1 / 9,
    );

  // First pass at full amplitude; any extra passes are fainter (lower
  // amplitude) for the layered hand-drawn feel.
  const drawn: string[] = [];
  for (let i = 0; i < passes; i += 1) drawn.push(pass(i === 0 ? 1 : 0.35));
  return drawn.join(' ');
}

/** Hand-drawn open circle that overshoots its start (two passes). */
function sketchCirclePath(
  cx: number,
  cy: number,
  radius: number,
  seed: number,
  amplitude: number,
): string {
  const rng = createRng(seed);
  const samples = 14;

  const loop = (startAngle: number) => {
    const points: Point[] = [];
    const turns = 1.08;
    for (let i = 0; i <= samples; i++) {
      const angle = startAngle + (i / samples) * Math.PI * 2 * turns;
      const rr = radius + (rng() * 2 - 1) * amplitude;
      points.push([cx + Math.cos(angle) * rr, cy + Math.sin(angle) * rr]);
    }
    return smooth(points, false);
  };

  return `${loop(-0.35)} ${loop(0.12)}`;
}

/**
 * Single-pass closed wobbly disc, meant to be filled. Unlike
 * {@link sketchCirclePath} it does not overshoot or double back, so small radii
 * stay legible instead of collapsing into a scribble.
 */
function sketchBlobPath(
  cx: number,
  cy: number,
  radius: number,
  seed: number,
  amplitude: number,
): string {
  const rng = createRng(seed);
  const samples = 10;
  const points: Point[] = [];
  for (let i = 0; i < samples; i += 1) {
    const angle = (i / samples) * Math.PI * 2;
    const rr = radius + (rng() * 2 - 1) * amplitude;
    points.push([cx + Math.cos(angle) * rr, cy + Math.sin(angle) * rr]);
  }
  return smooth(points, true);
}

/** Hand-drawn check tick (two passes). */
function sketchTickPath(seed: number, amplitude: number): string {
  const rng = createRng(seed);
  const base: Point[] = [
    [11.5, 21],
    [18, 27.5],
    [29, 12.5],
  ];
  const jittered = () =>
    smooth(
      base.map(([x, y]) => [
        x + (rng() * 2 - 1) * amplitude,
        y + (rng() * 2 - 1) * amplitude,
      ]),
      false,
    );
  return `${jittered()} ${jittered()}`;
}

/** Measure a positioned element and keep its size in sync on resize. */
function useElementSize() {
  const ref = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      setSize((prev) =>
        prev && prev.w === rect.width && prev.h === rect.height
          ? prev
          : { w: rect.width, h: rect.height },
      );
    };

    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, size] as const;
}

/**
 * Hand-drawn rectangle that traces the card's outer contour. It measures the
 * positioned parent and regenerates the border on resize.
 */
export function SketchFrame({
  className,
  color = 'var(--ink-4)',
  sloppiness = 'medium',
  strokeStyle = 'solid',
  strokeWidth = 'medium',
  seed = 1,
  pad = 4,
  radius = 0,
}: Omit<SketchProps, 'strokeWidth'> & {
  seed?: number;
  pad?: number;
  radius?: number;
  sloppiness?: Sloppiness;
  strokeStyle?: StrokeStyle;
  strokeWidth?: StrokeWidthLevel;
}) {
  const clipId = useId();
  const [ref, size] = useElementSize();

  const amplitude = SLOPPINESS_AMPLITUDE[sloppiness];
  const baseWidth = STROKE_WIDTH_PX[strokeWidth];
  const isSolid = strokeStyle === 'solid';
  // Solid keeps the layered two-pass look; dashed/dotted use one clean pass so
  // dashes stay legible, with a small width bump to offset the lost overlap.
  const passes = isSolid ? 2 : 1;
  const renderWidth = isSolid ? baseWidth : baseWidth + 0.4;
  const dasharray = dashArrayFor(strokeStyle, baseWidth);

  const path = useMemo(() => {
    if (!size || size.w <= 0 || size.h <= 0) return '';
    return radius > 0
      ? sketchRoundedRectPath(
          size.w,
          size.h,
          pad,
          radius,
          seed,
          amplitude,
          passes,
        )
      : sketchRectPath(size.w, size.h, pad, seed, amplitude, passes);
  }, [size, pad, seed, amplitude, radius, passes]);

  const clipRadius =
    size && radius > 0
      ? Math.max(
          0,
          Math.min(radius, (size.w - pad * 2) / 2, (size.h - pad * 2) / 2),
        )
      : 0;

  return (
    <svg
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full overflow-hidden ${className ?? ''}`}
      viewBox={size ? `0 0 ${size.w} ${size.h}` : undefined}
      fill="none"
    >
      {size ? (
        <defs>
          <clipPath id={clipId}>
            {clipRadius > 0 ? (
              <rect
                x={pad}
                y={pad}
                width={size.w - pad * 2}
                height={size.h - pad * 2}
                rx={clipRadius}
                ry={clipRadius}
              />
            ) : (
              <rect
                x={pad}
                y={pad}
                width={size.w - pad * 2}
                height={size.h - pad * 2}
              />
            )}
          </clipPath>
        </defs>
      ) : null}
      {path ? (
        <path
          d={path}
          clipPath={size ? `url(#${clipId})` : undefined}
          stroke={color}
          strokeWidth={renderWidth}
          strokeDasharray={dasharray}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
    </svg>
  );
}

/** Wobbly emphasis underline that stretches to the width of its parent. */
export function SketchUnderline({
  className,
  color = 'var(--brick)',
  strokeWidth = 2.6,
}: SketchProps) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none ${className ?? ''}`}
      viewBox="0 0 120 14"
      preserveAspectRatio="none"
      fill="none"
    >
      <path
        d="M3 8.4 C 27 3.1, 51 11.2, 73 6.3 S 103 2.8, 117 7.4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Curved hand-drawn arrow, pointing right. */
export function SketchArrow({
  className,
  color = 'var(--ink-4)',
  strokeWidth = 1.8,
}: SketchProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 72 40"
      fill="none"
    >
      <path
        d="M5 25 Q 37 5, 65 17"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g transform="rotate(40 65 17)">
        <path
          d="M65 17 L 54 15.5 M65 17 L 58.5 25.5"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

/** Small inline hand-drawn arrow used after annotation labels. */
export function SketchArrowGlyph({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 30 16"
      fill="none"
    >
      <path
        d="M2 9 Q 14 4, 26 8 M26 8 L 20 3.6 M26 8 L 21 13.2"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Hand-drawn check-mark inside a sloppy circle. Generated once at module load
 * with the original sketch generator (fixed seeds → stable, distinct variants).
 */
const SKETCH_CHECK_VARIANTS = [3, 17, 28].map((seed) => ({
  circle: sketchCirclePath(20, 20, 16, seed, 1.4),
  tick: sketchTickPath(seed + 91, 1),
}));

export function SketchCheck({
  className,
  color = 'var(--brick)',
  variant = 0,
}: SketchProps & { variant?: number }) {
  const marks =
    SKETCH_CHECK_VARIANTS[variant % SKETCH_CHECK_VARIANTS.length] ??
    SKETCH_CHECK_VARIANTS[0];

  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 40 40"
      fill="none"
    >
      <path
        d={marks.circle}
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={marks.tick}
        stroke={color}
        strokeWidth={2.1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Hand-drawn polyline (open or closed) that wobbles deterministic of a seed.
 */
function sketchPolylinePath(
  base: Point[],
  seed: number,
  amplitude: number,
  closed = false,
): string {
  const rng = createRng(seed);
  const jittered = (scale: number) =>
    smooth(
      base.map(([x, y]) => [
        x + (rng() * 2 - 1) * amplitude * scale,
        y + (rng() * 2 - 1) * amplitude * scale,
      ]),
      closed,
    );
  return `${jittered(1.0)} ${jittered(0.35)}`;
}

const SKETCH_START_READING_VARIANTS = [3, 17, 28].map((seed) => {
  const amp = 0.55;
  const playTriangle = [[7, 5] as Point, [19, 12] as Point, [7, 19] as Point];

  return {
    triangle: sketchPolylinePath(playTriangle, seed + 82, amp, true),
  };
});

export function SketchStartReadingIcon({
  className,
  color = 'currentColor',
  size = 24,
  variant = 0,
}: SketchProps & { size?: number; variant?: number }) {
  const marks =
    SKETCH_START_READING_VARIANTS[
      variant % SKETCH_START_READING_VARIANTS.length
    ] ?? SKETCH_START_READING_VARIANTS[0];

  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d={marks.triangle}
        stroke={color}
        strokeWidth={2.0}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

const SKETCH_FIND_ROOM_VARIANTS = [3, 17, 28].map((seed) => {
  const amp = 0.4;
  // A magnifying glass with a large lens (upper-left) and a handle trailing to
  // the lower-right, with two little figures framed inside the lens.
  const handle = [[14.8, 14.8] as Point, [21, 21] as Point];
  const shouldersLeft = [
    [5.6, 12.8] as Point,
    [5.9, 11] as Point,
    [7.9, 10] as Point,
    [9.9, 11] as Point,
    [10.2, 12.8] as Point,
  ];
  const shouldersRight = [
    [10.4, 13.2] as Point,
    [10.7, 11.4] as Point,
    [12.6, 10.4] as Point,
    [14.5, 11.4] as Point,
    [14.8, 13.2] as Point,
  ];

  return {
    lens: sketchCirclePath(10, 10, 7, seed, amp),
    handle: sketchPolylinePath(handle, seed + 1, amp),
    headLeft: sketchBlobPath(7.9, 8, 1.6, seed + 2, amp * 0.6),
    shouldersLeft: sketchPolylinePath(shouldersLeft, seed + 3, amp * 0.7),
    headRight: sketchBlobPath(12.6, 8.4, 1.4, seed + 4, amp * 0.6),
    shouldersRight: sketchPolylinePath(shouldersRight, seed + 5, amp * 0.7),
  };
});

export function SketchFindRoomIcon({
  className,
  color = 'currentColor',
  size = 24,
  variant = 0,
}: SketchProps & { size?: number; variant?: number }) {
  const marks =
    SKETCH_FIND_ROOM_VARIANTS[variant % SKETCH_FIND_ROOM_VARIANTS.length] ??
    SKETCH_FIND_ROOM_VARIANTS[0];

  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d={marks.shouldersLeft}
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d={marks.headLeft} fill={color} stroke="none" />
      <path
        d={marks.shouldersRight}
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d={marks.headRight} fill={color} stroke="none" />
      <path
        d={marks.lens}
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={marks.handle}
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// "Free to start" → a hand-drawn price tag (the "no cost, no catch" metaphor),
// pointing up-left with its string, plus the punch hole near the tip.
const SKETCH_FREE_START_VARIANTS = [3, 17, 28].map((seed) => {
  const amp = 0.45;
  // Tag body: a pentagon with the point at the upper-left and the hole there.
  const tagBase = [
    [13, 13],
    [22, 13],
    [31, 22],
    [22, 31],
    [13, 22],
  ] as Point[];
  // String looping out of the hole toward the top-left corner.
  const stringBase = [
    [15, 15],
    [11, 11],
    [8, 9],
  ] as Point[];

  return {
    tag: sketchPolylinePath(tagBase, seed, amp, true),
    string: sketchPolylinePath(stringBase, seed + 7, amp),
    hole: sketchBlobPath(17, 17, 1.8, seed + 14, amp * 0.5),
  };
});

export function SketchFreeStartIcon({
  className,
  color = 'currentColor',
  variant = 0,
}: SketchProps & { variant?: number }) {
  const marks =
    SKETCH_FREE_START_VARIANTS[variant % SKETCH_FREE_START_VARIANTS.length] ??
    SKETCH_FREE_START_VARIANTS[0];

  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 40 40"
      fill="none"
    >
      <path
        d={marks.tag}
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={marks.string}
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d={marks.hole} fill={color} stroke="none" />
    </svg>
  );
}

// "Bring your people" → three smiling faces clustered together: a hand-drawn
// circle for each face, two filled eye dots, and an upturned mouth.
type SketchFace = {
  outline: string;
  eyeLeft: string;
  eyeRight: string;
  smile: string;
};

function sketchFace(
  cx: number,
  cy: number,
  r: number,
  seed: number,
  amp: number,
): SketchFace {
  return {
    outline: sketchCirclePath(cx, cy, r, seed, amp),
    eyeLeft: sketchBlobPath(
      cx - r * 0.38,
      cy - r * 0.22,
      r * 0.14,
      seed + 1,
      0,
    ),
    eyeRight: sketchBlobPath(
      cx + r * 0.38,
      cy - r * 0.22,
      r * 0.14,
      seed + 2,
      0,
    ),
    // Upturned mouth: dips at the centre, lifts at both corners.
    smile: sketchPolylinePath(
      [
        [cx - r * 0.45, cy + r * 0.28],
        [cx, cy + r * 0.58],
        [cx + r * 0.45, cy + r * 0.28],
      ],
      seed + 3,
      amp * 0.5,
    ),
  };
}

const SKETCH_BRING_PEOPLE_VARIANTS = [3, 17, 28].map((seed) => ({
  // A friendly trio: one up top, two below — spaced so the circles never
  // overlap, so the icon stays clean on any background.
  faces: [
    sketchFace(20, 12.5, 6, seed, 0.4),
    sketchFace(11, 26, 6, seed + 10, 0.4),
    sketchFace(29, 26, 6, seed + 20, 0.4),
  ],
}));

export function SketchBringPeopleIcon({
  className,
  color = 'currentColor',
  variant = 0,
}: SketchProps & { variant?: number }) {
  const marks =
    SKETCH_BRING_PEOPLE_VARIANTS[
      variant % SKETCH_BRING_PEOPLE_VARIANTS.length
    ] ?? SKETCH_BRING_PEOPLE_VARIANTS[0];

  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 40 40"
      fill="none"
    >
      {marks.faces.map((face, i) => (
        <g key={i}>
          <path
            d={face.outline}
            stroke={color}
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d={face.eyeLeft} fill={color} stroke="none" />
          <path d={face.eyeRight} fill={color} stroke="none" />
          <path
            d={face.smile}
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ))}
    </svg>
  );
}

// "Real book data" → an open book: two pages meeting at a central spine, with
// a couple of catalogued text lines ruled across each page.
const SKETCH_BOOK_DATA_VARIANTS = [3, 17, 28].map((seed) => {
  const amp = 0.4;
  return {
    // Outline of the spread (closed): outer corners dip down to the spine.
    pages: sketchPolylinePath(
      [
        [6, 13],
        [20, 16],
        [34, 13],
        [34, 29],
        [20, 32],
        [6, 29],
      ],
      seed,
      amp,
      true,
    ),
    // Central spine, top to bottom.
    spine: sketchPolylinePath(
      [
        [20, 16],
        [20, 32],
      ],
      seed + 1,
      amp,
    ),
    lineLeftTop: sketchPolylinePath(
      [
        [10, 20],
        [16, 21],
      ],
      seed + 2,
      amp,
    ),
    lineLeftBottom: sketchPolylinePath(
      [
        [10, 24],
        [16, 25],
      ],
      seed + 3,
      amp,
    ),
    lineRightTop: sketchPolylinePath(
      [
        [24, 21],
        [30, 20],
      ],
      seed + 4,
      amp,
    ),
    lineRightBottom: sketchPolylinePath(
      [
        [24, 25],
        [30, 24],
      ],
      seed + 5,
      amp,
    ),
  };
});

export function SketchBookDataIcon({
  className,
  color = 'currentColor',
  variant = 0,
}: SketchProps & { variant?: number }) {
  const marks =
    SKETCH_BOOK_DATA_VARIANTS[variant % SKETCH_BOOK_DATA_VARIANTS.length] ??
    SKETCH_BOOK_DATA_VARIANTS[0];

  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 40 40"
      fill="none"
    >
      <path
        d={marks.pages}
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={marks.spine}
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {[
        marks.lineLeftTop,
        marks.lineLeftBottom,
        marks.lineRightTop,
        marks.lineRightBottom,
      ].map((d, i) => (
        <path
          key={i}
          d={d}
          stroke={color}
          strokeWidth={1.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

/**
 * Handwritten margin note in the Gloria Hallelujah hand font (terracotta).
 * Matches the design reference: 22px / line-height 1.4 / #d07a4e.
 */
export function Annotation({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      style={{ fontFamily: 'var(--font-hand)' }}
      className={`text-[22px] font-normal leading-[1.4] text-[color:var(--hand)] ${className ?? ''}`}
    >
      {children}
    </span>
  );
}
