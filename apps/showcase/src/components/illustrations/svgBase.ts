export type IllustrationProps = {
  className?: string;
};

/**
 * Shared attributes for line-style custom illustrations. Each illustration sets
 * its own `viewBox` and `strokeWidth` on top of these so it can pick a comfortable
 * coordinate space. Stroke uses `currentColor`, so color is controlled by the
 * surrounding element's text color.
 */
export const lineSvgBase = {
  'aria-hidden': true as const,
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};
