import { forwardRef } from 'react';
import type { LucideProps } from 'lucide-react';

const LUCIDE_VIEWBOX_WIDTH = 24;

/** Canonical viewBox for all TowelBooks custom icons. Matches Lucide's 24x24 grid. */
export const CUSTOM_ICON_VIEWBOX = '0 0 24 24';

function hasA11yProp(props: Record<string, unknown>) {
  return Object.keys(props).some(
    (prop) => prop.startsWith('aria-') || prop === 'role' || prop === 'title',
  );
}

function getViewBoxWidth(viewBox: string) {
  const width = Number(viewBox.trim().split(/\s+/)[2]);

  return Number.isFinite(width) && width > 0 ? width : LUCIDE_VIEWBOX_WIDTH;
}

function calculateStrokeWidth(
  strokeWidth: number | string,
  size: number | string,
  viewBoxWidth: number,
  absoluteStrokeWidth: boolean,
) {
  const normalizedStrokeWidth =
    Number(strokeWidth) * (viewBoxWidth / LUCIDE_VIEWBOX_WIDTH);

  if (!absoluteStrokeWidth) {
    return normalizedStrokeWidth;
  }

  const renderedSize = Number(size);

  return Number.isFinite(renderedSize) && renderedSize > 0
    ? normalizedStrokeWidth * (LUCIDE_VIEWBOX_WIDTH / renderedSize)
    : normalizedStrokeWidth;
}

/**
 * Creates a TowelBooks custom icon component compatible with Lucide props.
 *
 * Custom icons must draw artwork in `0 0 24 24` coordinates and fill the Lucide
 * optical inset (~2px margin; primary ink roughly x/y 2–22). Do not pass a
 * custom viewBox for new icons.
 */
export function createCustomIcon(
  displayName: string,
  paths: React.ReactNode,
  viewBox: string = CUSTOM_ICON_VIEWBOX,
) {
  if (
    process.env.NODE_ENV !== 'production' &&
    viewBox !== CUSTOM_ICON_VIEWBOX
  ) {
    console.warn(
      `[createCustomIcon] ${displayName} uses a non-standard viewBox (${viewBox}). ` +
        `Custom icons must use ${CUSTOM_ICON_VIEWBOX} coordinates.`,
    );
  }

  const viewBoxWidth = getViewBoxWidth(viewBox);

  const Component = forwardRef<SVGSVGElement, LucideProps>((props, ref) => {
    const {
      size = 24,
      strokeWidth = 2,
      absoluteStrokeWidth = false,
      className = '',
      color = 'currentColor',
      ...rest
    } = props;

    const calculatedStrokeWidth = calculateStrokeWidth(
      strokeWidth,
      size,
      viewBoxWidth,
      absoluteStrokeWidth,
    );

    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox={viewBox}
        fill="none"
        stroke={color}
        strokeWidth={calculatedStrokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`shrink-0 ${className}`}
        {...(!hasA11yProp(rest) && { 'aria-hidden': 'true' })}
        {...rest}
      >
        {paths}
      </svg>
    );
  });

  Component.displayName = displayName;
  return Component;
}
