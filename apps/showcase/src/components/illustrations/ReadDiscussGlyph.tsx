import { lineSvgBase, type IllustrationProps } from './svgBase';

/** Read & discuss — a speech bubble with two lines. */
export function ReadDiscussGlyph({ className }: IllustrationProps) {
  return (
    <svg
      {...lineSvgBase}
      viewBox="0 0 32 32"
      strokeWidth={2.2}
      className={className}
    >
      <path d="M8 7 H24 A3 3 0 0 1 27 10 V17 A3 3 0 0 1 24 20 H13 L9 24 V20 H8 A3 3 0 0 1 5 17 V10 A3 3 0 0 1 8 7 Z" />
      <line x1="10" y1="11.5" x2="22" y2="11.5" />
      <line x1="10" y1="15" x2="19" y2="15" />
    </svg>
  );
}
