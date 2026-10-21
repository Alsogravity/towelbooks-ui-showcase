import { lineSvgBase, type IllustrationProps } from './svgBase';

/** Gather a room — two readers side by side. */
export function GatherRoomGlyph({ className }: IllustrationProps) {
  return (
    <svg
      {...lineSvgBase}
      viewBox="0 0 32 32"
      strokeWidth={2.2}
      className={className}
    >
      <circle cx="12" cy="11" r="3.6" />
      <path d="M5.5 25 C5.5 19.5 9 17.5 12 17.5 C15 17.5 18.5 19.5 18.5 25" />
      <circle cx="22" cy="13" r="3" />
      <path d="M17.2 25.5 C17.2 21 19.6 19.5 22 19.5 C24.4 19.5 27 21 27 25.5" />
    </svg>
  );
}
