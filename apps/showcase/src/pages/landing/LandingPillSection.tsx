import type { ReactNode } from 'react';

type CapTone = 'paper' | 'page' | 'forest';
type SurfaceTone = 'pill' | 'forest';

/**
 * Guest-landing "reading room" shell — a dark editorial pill (vellum surface)
 * that floats on the page. The paper-caps fill the rounded-corner gaps with a
 * neighbour colour, so the pill blends seamlessly into the band above/below
 * instead of leaving a hard line or a stray gutter. Set each cap's tone to
 * match its neighbour: `paper` for the warm cream band, `page` for the dark
 * surface, `forest` for the green band. Reused by every landing pill so the
 * colours stay in one place.
 */
export function LandingPillSection({
  children,
  sectionClassName = '',
  shellClassName = '',
  topCapTone = 'paper',
  bottomCapTone = 'paper',
  surfaceTone = 'pill',
}: {
  children: ReactNode;
  /** Utility classes for the inner <section> (rounding, padding, layout). */
  sectionClassName?: string;
  /** Utility classes for the outer shell wrapper. */
  shellClassName?: string;
  topCapTone?: CapTone;
  bottomCapTone?: CapTone;
  surfaceTone?: SurfaceTone;
}) {
  const capToneClass = (tone: CapTone) =>
    tone === 'paper' ? '' : ` landing-pill-shell__paper-cap--${tone}`;

  const surfaceToneClass =
    surfaceTone === 'forest' ? ' landing-pill-shell--forest' : '';

  return (
    <div className={`landing-pill-shell${surfaceToneClass} ${shellClassName}`}>
      <div
        className={`landing-pill-shell__paper-cap${capToneClass(topCapTone)}`}
        aria-hidden="true"
      />
      <section
        className={`landing-pill-section overflow-visible ${sectionClassName}`}
      >
        {children}
      </section>
      <div
        className={`landing-pill-shell__paper-cap landing-pill-shell__paper-cap--bottom${capToneClass(
          bottomCapTone,
        )}`}
        aria-hidden="true"
      />
    </div>
  );
}
