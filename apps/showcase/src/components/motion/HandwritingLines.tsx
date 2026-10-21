import { useLayoutEffect, useRef } from 'react';

/**
 * A "handwriting" animation: three curved cursive rows are inked on, one after
 * another, by a small pen whose nib rides the exact tip of the stroke being
 * written. Once the page is full it fades and a *freshly randomised* page is
 * written again — so no two lines, and no two passes, share the same squiggle.
 *
 * Decorative only. It is driven imperatively from `requestAnimationFrame`:
 *  - the pen nib is placed with `getPointAtLength`, so it sits precisely on the
 *    growing tip rather than an approximated path fraction;
 *  - rows that haven't started yet are held at `opacity 0`, so the round
 *    line-caps of dash-hidden paths never leak a stray dot into the pill;
 *  - each cycle regenerates the three row paths with new amplitudes/widths.
 *
 * Everything is set via SVG presentation attributes (`d`, `stroke-dashoffset`,
 * `opacity`, `transform`) — never the `style` property — because the app ships
 * a strict `style-src 'self'` CSP that drops inline styles in production.
 *
 * When `playState` is `paused` (offscreen or reduced-motion) it renders one
 * static, fully-inked page with no pen, mirroring the portal's frozen flow.
 */

const CYCLE_MS = 6000;

// Baseline y for each row in the pill's 150×74 design space.
const ROW_Y = [26, 40, 54] as const;

// When each row draws, as a fraction of the cycle. The gaps between windows are
// "carriage moves" where the pen glides from one line's end to the next's start.
const ROW_WINDOW: ReadonlyArray<readonly [number, number]> = [
  [0.0, 0.18],
  [0.22, 0.4],
  [0.44, 0.58],
];
// After the last line: a beat at rest, then the pen glides back to the start,
// rests there, and finally the whole page fades out and resets.
const REST_AFTER = 0.66;
const RETURN_END = 0.8;
const HOLD_END = 0.85;
const FADE_END = 0.95;

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Builds one cursive row as alternating quadratic humps with randomised
 * amplitude, segment width and baseline jitter — so it reads as real
 * handwriting and differs on every call. `long` rows span the pill; the short
 * row trails off early, like a paragraph's last line.
 */
function makeRowPath(
  yBase: number,
  long: boolean,
  fixedStart: boolean,
): string {
  const x0 = fixedStart ? 28 : 28 + rand(-1, 2);
  const startY = fixedStart ? yBase : yBase + rand(-1, 1);
  const xEnd = (long ? 116 : 84) + rand(-3, 3);
  const segments = long ? 6 : 3;
  const width = (xEnd - x0) / segments;

  let x = x0;
  let dir = Math.random() < 0.5 ? 1 : -1;
  let d = `M${x0.toFixed(1)} ${startY.toFixed(1)}`;

  for (let i = 0; i < segments; i += 1) {
    const cx = x + width * rand(0.4, 0.6);
    const cy = yBase + dir * rand(5, 9);
    const ex = x + width;
    const ey = yBase + rand(-1.5, 1.5);
    d += ` Q${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
    x = ex;
    dir = -dir;
  }

  return d;
}

export function HandwritingLines({
  className = '',
  playState = 'running',
}: {
  className?: string;
  playState?: 'running' | 'paused';
}) {
  const paused = playState === 'paused';
  const pageRef = useRef<SVGGElement>(null);
  const penRef = useRef<SVGGElement>(null);
  const rowRefs = useRef<(SVGPathElement | null)[]>([]);

  useLayoutEffect(() => {
    const rows = rowRefs.current.filter(Boolean) as SVGPathElement[];
    if (rows.length !== ROW_Y.length) {
      return;
    }

    // Paused: lay down one static, fully-inked page and stop.
    if (paused) {
      pageRef.current?.setAttribute('opacity', '1');
      penRef.current?.setAttribute('opacity', '0');
      rows.forEach((el, i) => {
        el.setAttribute('d', makeRowPath(ROW_Y[i], i < 2, i === 0));
        el.setAttribute('stroke-dasharray', 'none');
        el.setAttribute('stroke-dashoffset', '0');
        el.setAttribute('opacity', '1');
      });
      return;
    }

    const totals = [0, 0, 0];
    const starts = ROW_Y.map(() => ({ x: 0, y: 0 }));
    const ends = ROW_Y.map(() => ({ x: 0, y: 0 }));

    // Fresh, hidden page: new squiggles, primed for the draw-on reveal. Row 0's
    // start is pinned so the pen's return lands exactly where it resumes.
    const regenerate = () => {
      rows.forEach((el, i) => {
        el.setAttribute('d', makeRowPath(ROW_Y[i], i < 2, i === 0));
        const total = el.getTotalLength();
        totals[i] = total;
        starts[i] = el.getPointAtLength(0);
        ends[i] = el.getPointAtLength(total);
        el.setAttribute('stroke-dasharray', String(total));
        el.setAttribute('stroke-dashoffset', String(total));
        el.setAttribute('opacity', '0');
      });
    };

    let frame = 0;
    let start = performance.now();
    let cycleIndex = -1;

    const tick = (now: number) => {
      const elapsed = now - start;
      const index = Math.floor(elapsed / CYCLE_MS);
      const progress = (elapsed % CYCLE_MS) / CYCLE_MS;

      if (index !== cycleIndex) {
        cycleIndex = index;
        regenerate();
      }

      // Whole-page fade during the reset window.
      const pageOpacity =
        progress <= HOLD_END
          ? 1
          : progress >= FADE_END
            ? 0
            : 1 - (progress - HOLD_END) / (FADE_END - HOLD_END);
      pageRef.current?.setAttribute('opacity', pageOpacity.toFixed(3));

      // Reveal each row: hidden before its turn, inking through its window,
      // then held fully drawn. The pen position is resolved separately so it can
      // glide continuously through the gaps.
      let penX = starts[0].x;
      let penY = starts[0].y;
      rows.forEach((el, i) => {
        const [from, to] = ROW_WINDOW[i];
        const total = totals[i];

        if (progress < from) {
          // Not started: kept invisible so no round-cap dot leaks out.
          el.setAttribute('opacity', '0');
          el.setAttribute('stroke-dashoffset', String(total));
        } else if (progress < to) {
          // Inking: reveal up to the tip; the pen rides that exact tip.
          const drawn = ((progress - from) / (to - from)) * total;
          el.setAttribute('opacity', '1');
          el.setAttribute('stroke-dashoffset', String(total - drawn));
          const tip = el.getPointAtLength(drawn);
          penX = tip.x;
          penY = tip.y;
        } else {
          // Inked: held fully drawn.
          el.setAttribute('opacity', '1');
          el.setAttribute('stroke-dashoffset', '0');
        }
      });

      // Continuous carriage moves between the writing windows: line-end → next
      // line's start, then last-line-end → back to the start to begin again.
      if (progress >= ROW_WINDOW[0][1] && progress < ROW_WINDOW[1][0]) {
        const k =
          (progress - ROW_WINDOW[0][1]) / (ROW_WINDOW[1][0] - ROW_WINDOW[0][1]);
        penX = lerp(ends[0].x, starts[1].x, k);
        penY = lerp(ends[0].y, starts[1].y, k);
      } else if (progress >= ROW_WINDOW[1][1] && progress < ROW_WINDOW[2][0]) {
        const k =
          (progress - ROW_WINDOW[1][1]) / (ROW_WINDOW[2][0] - ROW_WINDOW[1][1]);
        penX = lerp(ends[1].x, starts[2].x, k);
        penY = lerp(ends[1].y, starts[2].y, k);
      } else if (progress >= ROW_WINDOW[2][1] && progress < REST_AFTER) {
        penX = ends[2].x;
        penY = ends[2].y;
      } else if (progress >= REST_AFTER && progress < RETURN_END) {
        const k = (progress - REST_AFTER) / (RETURN_END - REST_AFTER);
        penX = lerp(ends[2].x, starts[0].x, k);
        penY = lerp(ends[2].y, starts[0].y, k);
      } else if (progress >= RETURN_END) {
        penX = starts[0].x;
        penY = starts[0].y;
      }

      penRef.current?.setAttribute(
        'transform',
        `translate(${penX.toFixed(2)} ${penY.toFixed(2)})`,
      );
      penRef.current?.setAttribute('opacity', '1');

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paused]);

  return (
    <svg
      className={`handwriting-lines ${className}`}
      viewBox="0 0 150 74"
      fill="none"
      aria-hidden="true"
    >
      <g ref={pageRef} className="handwriting-lines__page">
        {ROW_Y.map((_, index) => (
          <path
            key={index}
            ref={(el) => {
              rowRefs.current[index] = el;
            }}
            className="handwriting-lines__row"
          />
        ))}
      </g>
      <g ref={penRef} className="handwriting-lines__pen" opacity="0">
        {/* Nib sits at the group origin (0,0); body slants up-right. */}
        <path className="handwriting-lines__pen-body" d="M1 -0.5 L4.5 -12" />
        <path
          className="handwriting-lines__pen-nib"
          d="M0 0 L1.5 -5 L3 -0.5 Z"
        />
      </g>
    </svg>
  );
}
