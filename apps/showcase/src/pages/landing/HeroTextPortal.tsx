import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { HandwritingLines } from '../../components/motion/HandwritingLines';
import { useI18n } from '../../i18n';

/**
 * Decorative "editorial portal": the reading-themed ribbon copy is a single
 * continuous string riding a fixed curve that descends from the top into a
 * centered pill "portal" (with a small CSS waveform reading as it being
 * transcribed) and rises back to the top on the far side. Plain marginalia
 * enters on the left; as the string crosses the pill it becomes editorial serif
 * italic on a dark band exiting to the right.
 *
 * The curve is an SVG `<textPath>`, but — unlike the previous cord — the flow
 * speed is normalised: the marquee shifts `startOffset` by exactly one measured
 * phrase repeat over a duration derived from that same length, so the arc-speed
 * is a fixed constant and is identical in Chrome and Firefox regardless of how
 * each lays out the text. The loop is seamless (one whole repeat per cycle).
 *
 * Purely decorative: hidden from assistive tech, non-interactive, frozen under
 * `prefers-reduced-motion`, and paused while outside the viewport.
 */

// Fixed flow curve, in the 2000×240 design space the rail fills the viewport
// width from: top-left → down to the pill at the bottom-centre → back to top.
export const PORTAL_PATH =
  'M-280 60C160 60 440 200 720 200C1000 200 1280 60 1720 60';

// Approximate curve length plus a small safety buffer, in the same design units.
// Used only to avoid rendering unnecessary duplicate phrases.
const PORTAL_TEXT_COVERAGE = 2200;
const MIN_PHRASE_REPEATS = 2;
const MAX_PHRASE_REPEATS = 8;

// Constant scroll speed, in design units per second. Browser-independent: the
// measured repeat length only sets how *far* one cycle shifts, while the
// duration scales with it so the on-screen speed never changes.
const FLOW_SPEED = 48;

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  return reduced;
}

function useElementInViewport(
  ref: React.RefObject<HTMLElement | null>,
): boolean {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (
      !element ||
      typeof window === 'undefined' ||
      !('IntersectionObserver' in window)
    ) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(Boolean(entry?.isIntersecting)),
      {
        // Start the animation shortly before the hero becomes visible and stop
        // shortly after it leaves, avoiding a visible cold-start at the edge.
        rootMargin: '160px 0px',
        threshold: 0,
      },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return visible;
}

/** Measures one phrase repeat's advance using a hidden text element. */
function usePhraseUnit(
  ref: React.RefObject<SVGTextElement | null>,
  phrase: string,
): number {
  const [unit, setUnit] = useState(0);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || typeof window === 'undefined') {
      return;
    }

    let cancelled = false;
    let animationFrame = 0;

    const measureNow = () => {
      animationFrame = 0;
      if (cancelled || typeof element.getComputedTextLength !== 'function') {
        return;
      }

      // Measure the unconstrained length of a single phrase.
      const length = element.getComputedTextLength();
      setUnit((previous) =>
        Math.abs(previous - length) > 0.5
          ? length > 0
            ? length
            : 0
          : previous,
      );
    };

    const scheduleMeasure = () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
      animationFrame = window.requestAnimationFrame(measureNow);
    };

    const fonts = document.fonts;
    if (fonts && typeof fonts.ready?.then === 'function') {
      fonts.ready.then(scheduleMeasure).catch(scheduleMeasure);
    } else {
      scheduleMeasure();
    }

    scheduleMeasure();

    let lastWidth = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        scheduleMeasure();
      }
    };

    window.addEventListener('resize', onResize);
    return () => {
      cancelled = true;
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
      window.removeEventListener('resize', onResize);
    };
  }, [ref, phrase]);

  return unit;
}

function getPhraseRepeatCount(unit: number): number {
  if (unit <= 0) {
    return MIN_PHRASE_REPEATS;
  }

  return Math.min(
    MAX_PHRASE_REPEATS,
    Math.max(MIN_PHRASE_REPEATS, Math.ceil(PORTAL_TEXT_COVERAGE / unit) + 1),
  );
}

function FlowingTextPath({
  text,
  unit,
  active,
}: {
  text: string;
  unit: number;
  active: boolean;
}) {
  const animate = active && unit > 0;
  return (
    <textPath href="#hero-portal-curve" startOffset={animate ? -unit : 0}>
      {text}
      {animate ? (
        <animate
          attributeName="startOffset"
          from={`${-unit}`}
          to="0"
          dur={`${(unit / FLOW_SPEED).toFixed(2)}s`}
          repeatCount="indefinite"
        />
      ) : null}
    </textPath>
  );
}

export function HeroTextPortal() {
  const { t } = useI18n();
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const visible = useElementInViewport(rootRef);

  const phrase = t('landing.hero.ribbon');

  // Measure the phrase accurately using a hidden <text> element.
  // Measuring the <textPath> directly is unreliable because browsers
  // often cap the measured length to the path's own length.
  const measureRef = useRef<SVGTextElement>(null);
  const masterUnit = usePhraseUnit(measureRef, phrase);
  const phraseRepeats = getPhraseRepeatCount(masterUnit);
  const text = useMemo(
    () => Array.from({ length: phraseRepeats }, () => phrase).join(''),
    [phrase, phraseRepeats],
  );
  const active = visible && !reduced;

  return (
    <div ref={rootRef} aria-hidden="true" className="landing-hero-portal">
      <div className="landing-hero-portal__rail">
        <svg
          className="landing-hero-portal__svg"
          viewBox="-280 0 2000 240"
          preserveAspectRatio="none"
          fill="none"
        >
          <defs>
            <path id="hero-portal-curve" d={PORTAL_PATH} />
            {/* Hidden measurement text: unconstrained, used to find true unit length. */}
            <text
              ref={measureRef}
              aria-hidden="true"
              className="landing-hero-portal__text landing-hero-portal__text--plain"
              style={{ visibility: 'hidden', whiteSpace: 'pre' }}
            >
              {phrase}
            </text>
            {/* Edge-to-edge fill: only the centre crossfades plain→editorial;
                the string runs to both screen edges with no side fade. The fully
                hidden gap is covered by the pill, so font-metric differences do
                not read as a visible discontinuity. */}
            <linearGradient
              id="hero-portal-left"
              gradientUnits="userSpaceOnUse"
              x1="-280"
              y1="0"
              x2="1720"
              y2="0"
            >
              <stop offset="0" stopColor="#fff" />
              <stop offset="0.445" stopColor="#fff" />
              <stop offset="0.475" stopColor="#000" />
            </linearGradient>
            <linearGradient
              id="hero-portal-right"
              gradientUnits="userSpaceOnUse"
              x1="-280"
              y1="0"
              x2="1720"
              y2="0"
            >
              <stop offset="0.525" stopColor="#000" />
              <stop offset="0.555" stopColor="#fff" />
              <stop offset="1" stopColor="#fff" />
            </linearGradient>
            <mask
              id="hero-portal-left-mask"
              maskUnits="userSpaceOnUse"
              x="-280"
              y="-160"
              width="2000"
              height="680"
            >
              <rect
                x="-280"
                y="-160"
                width="2000"
                height="680"
                fill="url(#hero-portal-left)"
              />
            </mask>
            <mask
              id="hero-portal-right-mask"
              maskUnits="userSpaceOnUse"
              x="-280"
              y="-160"
              width="2000"
              height="680"
            >
              <rect
                x="-280"
                y="-160"
                width="2000"
                height="680"
                fill="url(#hero-portal-right)"
              />
            </mask>
          </defs>

          {/* Dark editorial ribbon: a thick stroke revealed right of the pill. */}
          <use
            href="#hero-portal-curve"
            className="landing-hero-portal__band"
            mask="url(#hero-portal-right-mask)"
          />

          {/* Editorial serif italic, riding the band on the right. */}
          <text
            className="landing-hero-portal__text landing-hero-portal__text--editorial"
            mask="url(#hero-portal-right-mask)"
          >
            <FlowingTextPath text={text} unit={masterUnit} active={active} />
          </text>

          {/* Plain marginalia, dissolving into the pill on the left. */}
          <text
            className="landing-hero-portal__text landing-hero-portal__text--plain"
            mask="url(#hero-portal-left-mask)"
          >
            <FlowingTextPath text={text} unit={masterUnit} active={active} />
          </text>
        </svg>

        <div className="landing-hero-portal__pill">
          <HandwritingLines playState={active ? 'running' : 'paused'} />
        </div>
      </div>
    </div>
  );
}
