import { lineSvgBase, type IllustrationProps } from './svgBase';

/** Build your library — a small stack of books. */
export function BuildLibraryGlyph({ className }: IllustrationProps) {
  return (
    <svg
      {...lineSvgBase}
      viewBox="0 0 32 32"
      strokeWidth={2.2}
      className={className}
    >
      <rect x="6" y="19" width="20" height="5.6" rx="1.6" />
      <rect x="8" y="12.5" width="16" height="5.6" rx="1.6" />
      <rect x="6.5" y="6" width="19" height="5.6" rx="1.6" />
      <line x1="11" y1="20.2" x2="11" y2="23.4" />
      <line x1="13" y1="13.7" x2="13" y2="16.9" />
      <line x1="11.5" y1="7.2" x2="11.5" y2="10.4" />
    </svg>
  );
}
