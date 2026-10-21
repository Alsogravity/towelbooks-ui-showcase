import type { ComponentType } from 'react';

/**
 * Shy, hand-drawn reading doodles for the "Everything a reading life needs"
 * band. They peek in from the edges of the warm-paper section at low opacity —
 * little books, cups, glasses and sparkles loitering behind the cards to make
 * the surface feel playful rather than flat. Each glyph strokes with
 * `currentColor`, so colour + opacity are set by the placement wrapper.
 *
 * Purely decorative: the layer is `aria-hidden` and never intercepts pointers.
 */

type DoodleProps = { className?: string };

const STROKE = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function OpenBookDoodle({ className }: DoodleProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 36"
      fill="none"
      aria-hidden="true"
    >
      <path d="M24 8 V31" strokeWidth={1.7} {...STROKE} />
      <path
        d="M24 8 C 18 4, 9 4, 4 7 C 4 14, 4 22, 4 28 C 9 25, 18 25, 24 31"
        strokeWidth={1.7}
        {...STROKE}
      />
      <path
        d="M24 8 C 30 4, 39 4, 44 7 C 44 14, 44 22, 44 28 C 39 25, 30 25, 24 31"
        strokeWidth={1.7}
        {...STROKE}
      />
      <path d="M9 12 C 13 11, 17 12, 20 12" strokeWidth={1.2} {...STROKE} />
      <path d="M28 12 C 31 12, 35 11, 39 12" strokeWidth={1.2} {...STROKE} />
    </svg>
  );
}

function CoffeeDoodle({ className }: DoodleProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path d="M16 4 C 14 7, 18 9, 16 12" strokeWidth={1.3} {...STROKE} />
      <path d="M24 4 C 22 7, 26 9, 24 12" strokeWidth={1.3} {...STROKE} />
      <path
        d="M8 16 L 31 16 L 29 33 C 29 35, 27 36, 24 36 L 15 36 C 12 36, 10 35, 10 33 Z"
        strokeWidth={1.7}
        {...STROKE}
      />
      <path d="M31 19 C 37 18, 37 27, 30 27" strokeWidth={1.7} {...STROKE} />
    </svg>
  );
}

function GlassesDoodle({ className }: DoodleProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 50 26"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M13 4 C 7 4, 4 8, 4 13 C 4 18, 7 21, 12 21 C 17 21, 20 17, 20 12 C 20 8, 18 4, 13 4 Z"
        strokeWidth={1.6}
        {...STROKE}
      />
      <path
        d="M37 4 C 31 4, 28 8, 28 13 C 28 18, 31 21, 36 21 C 41 21, 44 17, 44 12 C 44 8, 42 4, 37 4 Z"
        strokeWidth={1.6}
        {...STROKE}
      />
      <path d="M20 10 C 23 8, 27 8, 29 10" strokeWidth={1.6} {...STROKE} />
    </svg>
  );
}

function BookmarkDoodle({ className }: DoodleProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 38"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 4 C 5 3, 6 3, 7 3 L 18 3 C 19 3, 19 4, 19 5 L 19 34 L 12 27 L 5 34 Z"
        strokeWidth={1.7}
        {...STROKE}
      />
    </svg>
  );
}

function StackDoodle({ className }: DoodleProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 44 36"
      fill="none"
      aria-hidden="true"
    >
      <path d="M6 11 H 33 V 18 H 6 Z" strokeWidth={1.6} {...STROKE} />
      <path d="M9 18 H 36 V 25 H 9 Z" strokeWidth={1.6} {...STROKE} />
      <path d="M5 25 H 38 V 32 H 5 Z" strokeWidth={1.6} {...STROKE} />
      <path
        d="M28 11 V 18 M14 18 V 25 M30 25 V 32"
        strokeWidth={1.1}
        {...STROKE}
      />
    </svg>
  );
}

function QuillDoodle({ className }: DoodleProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M31 4 C 19 7, 11 15, 6 30 C 14 28, 20 24, 24 19 C 28 14, 30 9, 31 4 Z"
        strokeWidth={1.6}
        {...STROKE}
      />
      <path d="M28 7 L 11 25" strokeWidth={1.2} {...STROKE} />
      <path d="M6 30 L 2 34" strokeWidth={1.7} {...STROKE} />
    </svg>
  );
}

function CatDoodle({ className }: DoodleProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 34 32"
      fill="none"
      aria-hidden="true"
    >
      <path d="M8 12 L 6 3 L 14 8" strokeWidth={1.6} {...STROKE} />
      <path d="M26 12 L 28 3 L 20 8" strokeWidth={1.6} {...STROKE} />
      <path
        d="M17 7 C 9 7, 4 13, 4 19 C 4 26, 10 30, 17 30 C 24 30, 30 26, 30 19 C 30 13, 25 7, 17 7 Z"
        strokeWidth={1.6}
        {...STROKE}
      />
      <path d="M10 18 C 11 20, 14 20, 15 18" strokeWidth={1.4} {...STROKE} />
      <path d="M19 18 C 20 20, 23 20, 24 18" strokeWidth={1.4} {...STROKE} />
      <path d="M16 22 C 16 23, 18 23, 18 22" strokeWidth={1.2} {...STROKE} />
    </svg>
  );
}

function SparkleDoodle({ className }: DoodleProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 2 C 13 8, 16 11, 22 12 C 16 13, 13 16, 12 22 C 11 16, 8 13, 2 12 C 8 11, 11 8, 12 2 Z"
        strokeWidth={1.5}
        {...STROKE}
      />
    </svg>
  );
}

function PencilDoodle({ className }: DoodleProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M27 5 L 31 9 L 13 27 L 8 28.5 L 9.5 23.5 Z"
        strokeWidth={1.6}
        {...STROKE}
      />
      <path d="M9.5 23.5 L 13 27" strokeWidth={1.3} {...STROKE} />
      <path d="M24 8 L 28 12" strokeWidth={1.3} {...STROKE} />
    </svg>
  );
}

function HeartDoodle({ className }: DoodleProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 30"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M16 27 C 4 18, 2 9, 9 6 C 13 4, 16 8, 16 10 C 16 8, 19 4, 23 6 C 30 9, 28 18, 16 27 Z"
        strokeWidth={1.6}
        {...STROKE}
      />
    </svg>
  );
}

function SpeechDoodle({ className }: DoodleProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 34 30"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 4 L 29 4 C 31 4, 32 5, 32 7 L 32 18 C 32 20, 31 21, 29 21 L 16 21 L 9 27 L 9 21 L 5 21 C 3 21, 2 20, 2 18 L 2 7 C 2 5, 3 4, 5 4 Z"
        strokeWidth={1.6}
        {...STROKE}
      />
      <path
        d="M10 12 H 11 M16 12 H 17 M22 12 H 23"
        strokeWidth={2}
        {...STROKE}
      />
    </svg>
  );
}

function MoonDoodle({ className }: DoodleProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 30 30"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M21 4 C 13 4, 8 10, 8 17 C 8 22, 12 26, 17 26 C 13 24, 11 20, 11 16 C 11 10, 15 5, 21 4 Z"
        strokeWidth={1.6}
        {...STROKE}
      />
      <path
        d="M24 11 L 25 13 L 27 14 L 25 15 L 24 17 L 23 15 L 21 14 L 23 13 Z"
        strokeWidth={1.2}
        {...STROKE}
      />
    </svg>
  );
}

function LeafDoodle({ className }: DoodleProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 28 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M14 3 C 6 9, 4 20, 14 29 C 24 20, 22 9, 14 3 Z"
        strokeWidth={1.6}
        {...STROKE}
      />
      <path d="M14 6 L 14 27" strokeWidth={1.2} {...STROKE} />
      <path d="M14 13 L 19 11 M14 18 L 9 16" strokeWidth={1.1} {...STROKE} />
    </svg>
  );
}

function LightbulbDoodle({ className }: DoodleProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 28 34"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M14 3 C 8 3, 4 7, 4 13 C 4 17, 7 20, 9 22 L 9 25 L 19 25 L 19 22 C 21 20, 24 17, 24 13 C 24 7, 20 3, 14 3 Z"
        strokeWidth={1.6}
        {...STROKE}
      />
      <path d="M10 28 H 18 M11.5 31 H 16.5" strokeWidth={1.5} {...STROKE} />
      <path d="M11 13 L 14 16 L 17 13" strokeWidth={1.2} {...STROKE} />
    </svg>
  );
}

function KeyDoodle({ className }: DoodleProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 34 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 4 C 5 4, 2 7, 2 10 C 2 13, 5 16, 9 16 C 12 16, 14 14, 14 10 L 31 10 L 31 14 M26 10 L 26 13"
        strokeWidth={1.6}
        {...STROKE}
      />
      <path d="M7 10 H 8" strokeWidth={2.2} {...STROKE} />
    </svg>
  );
}

type DoodlePlacement = {
  Doodle: ComponentType<DoodleProps>;
  /** Position, size and rotation. Visibility is set once on the layer overlay. */
  className: string;
};

/**
 * Placements lean on the section edges so the doodles look like they are
 * peeking in. Several are hidden on small screens (`hidden sm:block`) to keep
 * the mobile band uncluttered.
 */
const PLACEMENTS: readonly DoodlePlacement[] = [
  // Always-on (also visible on mobile), spread across the four corners.
  {
    Doodle: OpenBookDoodle,
    className: 'left-[2%] top-[12%] w-16 -rotate-12 text-[#b5560a]',
  },
  {
    Doodle: StackDoodle,
    className: 'right-[3%] bottom-[12%] w-16 rotate-6 text-[#8b6a4a]',
  },
  {
    Doodle: CoffeeDoodle,
    className:
      'right-[4%] top-[8%] hidden w-12 rotate-12 text-[#b8893e] sm:block',
  },
  {
    Doodle: SparkleDoodle,
    className: 'left-[40%] bottom-[7%] hidden w-6 text-[#b8893e] sm:block',
  },
  {
    Doodle: SparkleDoodle,
    className: 'right-[11%] top-[38%] hidden w-5 text-[#b5560a] sm:block',
  },
  {
    Doodle: BookmarkDoodle,
    className:
      'right-[43%] top-[3%] hidden w-7 rotate-[14deg] text-[#b5560a] sm:block',
  },
  {
    Doodle: PencilDoodle,
    className:
      'left-[34%] top-[6%] hidden w-9 -rotate-[20deg] text-[#2f4a36] sm:block',
  },
  // md+ : a denser scatter once there is room.
  {
    Doodle: HeartDoodle,
    className:
      'left-[26%] bottom-[8%] hidden w-7 rotate-[12deg] text-[#b5560a] md:block',
  },
  {
    Doodle: StackDoodle,
    className:
      'left-[3%] top-[78%] hidden w-12 -rotate-3 text-[#b8893e] md:block',
  },
  {
    Doodle: LeafDoodle,
    className:
      'right-[40%] top-[18%] hidden w-7 rotate-[10deg] text-[#2f4a36] md:block',
  },
  {
    Doodle: KeyDoodle,
    className:
      'left-[46%] top-[40%] hidden w-12 -rotate-[8deg] text-[#8b6a4a] md:block',
  },
  // lg+ : the rest fill the gaps between the three card columns.
  {
    Doodle: GlassesDoodle,
    className:
      'left-[15%] bottom-[10%] hidden w-20 -rotate-6 text-[#2f4a36] lg:block',
  },
  {
    Doodle: QuillDoodle,
    className:
      'left-[6%] top-[50%] hidden w-12 rotate-[18deg] text-[#2f4a36] lg:block',
  },
  {
    Doodle: CatDoodle,
    className:
      'right-[17%] top-[2%] hidden w-12 rotate-3 text-[#8b6a4a] lg:block',
  },
  {
    Doodle: SpeechDoodle,
    className:
      'right-[8%] top-[44%] hidden w-12 -rotate-6 text-[#b8893e] lg:block',
  },
  {
    Doodle: MoonDoodle,
    className:
      'right-[28%] bottom-[6%] hidden w-9 -rotate-6 text-[#2f4a36] lg:block',
  },
  {
    Doodle: SparkleDoodle,
    className: 'left-[20%] top-[20%] hidden w-4 text-[#2f4a36] lg:block',
  },
  {
    Doodle: OpenBookDoodle,
    className:
      'right-[34%] bottom-[14%] hidden w-12 rotate-6 text-[#8b6a4a] lg:block',
  },
  {
    Doodle: LightbulbDoodle,
    className:
      'left-[58%] bottom-[16%] hidden w-9 rotate-[6deg] text-[#b8893e] lg:block',
  },
  {
    Doodle: CoffeeDoodle,
    className:
      'left-[10%] bottom-[40%] hidden w-9 -rotate-[10deg] text-[#b5560a] lg:block',
  },
  {
    Doodle: HeartDoodle,
    className:
      'right-[2%] top-[24%] hidden w-6 -rotate-[14deg] text-[#b5560a] lg:block',
  },
  {
    Doodle: SparkleDoodle,
    className: 'right-[46%] bottom-[4%] hidden w-5 text-[#b8893e] lg:block',
  },
];

/**
 * A single layer-level opacity keeps every doodle at a consistent, easily
 * tuned visibility (set it here rather than per placement).
 */
export function ReadingDoodles({ className }: DoodleProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 select-none opacity-[0.45] ${className ?? ''}`}
    >
      {PLACEMENTS.map(({ Doodle, className: placement }, index) => (
        <Doodle key={index} className={`absolute ${placement}`} />
      ))}
    </div>
  );
}
