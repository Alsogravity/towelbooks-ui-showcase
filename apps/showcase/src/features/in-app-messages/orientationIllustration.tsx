import type { ReactElement } from 'react';
import type { OrientationIllustrationKey } from '@towelbooks/schemas';

/**
 * Calm, literary orientation illustrations. Each is a two-tone line drawing: the
 * main strokes inherit the surrounding text color (the renderer tints them
 * `brick`) via `currentColor`, with warm `gold` accents and soft `currentColor`
 * fills for depth. Color comes from `currentColor` and Tailwind `fill-*`/`text-*`
 * classes only — never inline styles — so the app's `style-src 'self'` CSP never
 * drops them, and they adapt to light/dark themes.
 */

type SceneProps = { className?: string };

const SVG_BASE = {
  'aria-hidden': true as const,
  fill: 'none' as const,
  stroke: 'currentColor' as const,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  strokeWidth: 3,
  viewBox: '0 0 120 96',
};

const SOFT_FILL = 'fill-current opacity-[0.07]';
const GOLD_SOFT = 'fill-gold opacity-[0.18]';

/** A shared open book, drawn from a horizontal baseline `y` at center x=60. */
function OpenBook({ y }: { y: number }) {
  const left = `M60 ${y} C52 ${y - 6} 43 ${y - 6} 35 ${y - 3} L35 ${y - 17} C43 ${y - 20} 52 ${y - 20} 60 ${y - 15} Z`;
  const right = `M60 ${y} C68 ${y - 6} 77 ${y - 6} 85 ${y - 3} L85 ${y - 17} C77 ${y - 20} 68 ${y - 20} 60 ${y - 15} Z`;

  return (
    <>
      <path d={left} className={SOFT_FILL} />
      <path d={left} />
      <path d={right} className={SOFT_FILL} />
      <path d={right} />
      <path d={`M60 ${y - 15} V${y}`} strokeWidth={2.5} />
    </>
  );
}

/** Create reading rooms — a cozy room arch with a hanging lamp over a book. */
function RoomScene({ className }: SceneProps) {
  return (
    <svg {...SVG_BASE} className={className}>
      {/* warm glow filling the room */}
      <circle cx="60" cy="58" r="30" className="fill-gold opacity-[0.12]" />
      {/* room arch */}
      <path d="M28 86 V52 Q28 22 60 22 Q92 22 92 52 V86" />
      <line x1="17" y1="86" x2="103" y2="86" />
      {/* hanging reading lamp */}
      <line x1="60" y1="22" x2="60" y2="34" strokeWidth={2.5} />
      <path d="M51 44 L69 44 L65 34 L55 34 Z" className="fill-gold" />
      {/* open book on the floor */}
      <OpenBook y={82} />
    </svg>
  );
}

/** Read together — an open book under two discussion bubbles. */
function ReadTogetherScene({ className }: SceneProps) {
  return (
    <svg {...SVG_BASE} className={className}>
      {/* left bubble */}
      <path
        d="M20 14 H50 A6 6 0 0 1 56 20 V31 A6 6 0 0 1 50 37 H34 L27 44 V37 H20 A6 6 0 0 1 14 31 V20 A6 6 0 0 1 20 14 Z"
        className={SOFT_FILL}
      />
      <path d="M20 14 H50 A6 6 0 0 1 56 20 V31 A6 6 0 0 1 50 37 H34 L27 44 V37 H20 A6 6 0 0 1 14 31 V20 A6 6 0 0 1 20 14 Z" />
      <line
        x1="22"
        y1="22"
        x2="48"
        y2="22"
        strokeWidth={2.5}
        className="opacity-60"
      />
      <line
        x1="22"
        y1="29"
        x2="40"
        y2="29"
        strokeWidth={2.5}
        className="opacity-60"
      />
      {/* right bubble, warm */}
      <path
        d="M70 10 H100 A6 6 0 0 1 106 16 V25 A6 6 0 0 1 100 31 H88 L82 38 V31 H70 A6 6 0 0 1 64 25 V16 A6 6 0 0 1 70 10 Z"
        className={GOLD_SOFT}
      />
      <path d="M70 10 H100 A6 6 0 0 1 106 16 V25 A6 6 0 0 1 100 31 H88 L82 38 V31 H70 A6 6 0 0 1 64 25 V16 A6 6 0 0 1 70 10 Z" />
      <line
        x1="72"
        y1="18"
        x2="98"
        y2="18"
        strokeWidth={2.5}
        className="opacity-60"
      />
      <line
        x1="72"
        y1="24"
        x2="90"
        y2="24"
        strokeWidth={2.5}
        className="opacity-60"
      />
      {/* shared open book */}
      <OpenBook y={86} />
    </svg>
  );
}

/**
 * Manage your room — a laptop showing the room: a shelf of books and an open
 * book to read on the left, members and an open seat to invite on the right,
 * with an invitation envelope arriving at the corner.
 */
function ManageRoomScene({ className }: SceneProps) {
  return (
    <svg {...SVG_BASE} className={className}>
      {/* laptop screen — the room, on a computer */}
      <rect x="20" y="16" width="80" height="46" rx="7" className={SOFT_FILL} />
      <rect x="20" y="16" width="80" height="46" rx="7" />
      {/* laptop base */}
      <path d="M12 78 L24 62 H96 L108 78 Z" className={SOFT_FILL} />
      <path d="M12 78 L24 62 H96 L108 78 Z" />
      <line x1="14" y1="78" x2="106" y2="78" strokeWidth={2.5} />
      <line
        x1="53"
        y1="70"
        x2="67"
        y2="70"
        strokeWidth={2.5}
        className="opacity-60"
      />

      {/* books on a shelf */}
      <line x1="29" y1="46" x2="50" y2="46" strokeWidth={2.5} />
      <rect
        x="31"
        y="30"
        width="6"
        height="16"
        rx="1.5"
        strokeWidth={2.2}
        className={SOFT_FILL}
      />
      <rect x="31" y="30" width="6" height="16" rx="1.5" strokeWidth={2.2} />
      <rect
        x="39"
        y="27"
        width="6"
        height="19"
        rx="1.5"
        strokeWidth={2.2}
        className={GOLD_SOFT}
      />
      <rect x="39" y="27" width="6" height="19" rx="1.5" strokeWidth={2.2} />

      {/* an open book to read */}
      <path
        d="M42 58 C38 55 33 55 30 56 L30 49 C33 48 38 48 42 50 Z"
        strokeWidth={2.4}
        className={SOFT_FILL}
      />
      <path
        d="M42 58 C38 55 33 55 30 56 L30 49 C33 48 38 48 42 50 Z"
        strokeWidth={2.4}
      />
      <path
        d="M42 58 C46 55 51 55 54 56 L54 49 C51 48 46 48 42 50 Z"
        strokeWidth={2.4}
        className={SOFT_FILL}
      />
      <path
        d="M42 58 C46 55 51 55 54 56 L54 49 C51 48 46 48 42 50 Z"
        strokeWidth={2.4}
      />
      <path d="M42 50 V58" strokeWidth={2} />

      {/* members + an open seat to invite into */}
      <circle cx="68" cy="34" r="5" strokeWidth={2.4} className={SOFT_FILL} />
      <circle cx="68" cy="34" r="5" strokeWidth={2.4} />
      <circle cx="83" cy="34" r="5" strokeWidth={2.4} className={SOFT_FILL} />
      <circle cx="83" cy="34" r="5" strokeWidth={2.4} />
      <circle
        cx="75"
        cy="52"
        r="5"
        strokeWidth={2.4}
        strokeDasharray="2 3"
        className="opacity-70"
      />
      <path d="M75 49.5 V54.5 M72.5 52 H77.5" strokeWidth={2.2} />

      {/* invitation arriving */}
      <circle cx="95" cy="16" r="13" className="fill-gold opacity-[0.14]" />
      <rect
        x="84"
        y="9"
        width="22"
        height="15"
        rx="3"
        className="fill-gold opacity-[0.22]"
      />
      <rect x="84" y="9" width="22" height="15" rx="3" strokeWidth={2.4} />
      <path d="M85.5 11 L95 18 L104.5 11" strokeWidth={2.4} />
    </svg>
  );
}

/** Welcome — an open book with a sparkle; the calm entry point. */
function WelcomeScene({ className }: SceneProps) {
  return (
    <svg {...SVG_BASE} className={className}>
      <circle cx="60" cy="56" r="28" className="fill-gold opacity-[0.10]" />
      <OpenBook y={80} />
      <path
        d="M84 22 Q84 30 92 30 Q84 30 84 38 Q84 30 76 30 Q84 30 84 22 Z"
        className="fill-gold"
        strokeWidth={2}
      />
    </svg>
  );
}

/** Discover — a book behind a magnifying glass. */
function DiscoverScene({ className }: SceneProps) {
  return (
    <svg {...SVG_BASE} className={className}>
      <rect x="24" y="24" width="44" height="56" rx="6" className={SOFT_FILL} />
      <rect x="24" y="24" width="44" height="56" rx="6" />
      <path
        d="M34 38 H58 M34 48 H58 M34 58 H50"
        strokeWidth={2.5}
        className="opacity-70"
      />
      <circle cx="78" cy="56" r="16" className={GOLD_SOFT} />
      <circle cx="78" cy="56" r="16" />
      <path d="M90 68 L100 78" strokeWidth={4} />
    </svg>
  );
}

const SCENE_BY_KEY: Record<
  OrientationIllustrationKey,
  (props: SceneProps) => ReactElement
> = {
  welcome: WelcomeScene,
  discover: DiscoverScene,
  rooms: RoomScene,
  community: ManageRoomScene,
  reading: ReadTogetherScene,
};

export function OrientationIllustration({
  illustration,
  className,
}: {
  illustration: OrientationIllustrationKey;
  className?: string;
}) {
  const Scene = SCENE_BY_KEY[illustration] ?? WelcomeScene;

  return <Scene className={className} />;
}
