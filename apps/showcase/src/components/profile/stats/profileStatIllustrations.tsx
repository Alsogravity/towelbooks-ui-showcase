interface IllustrationProps {
  className?: string;
  width?: number;
  height?: number;
}

export function CatalogReviewsStatIllustration({
  className,
  width = 92,
  height = 92,
}: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 128 128"
      width={width}
      height={height}
      className={className}
    >
      <defs>
        <linearGradient id="parchment_grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fffcf0" />
          <stop offset="100%" stopColor="#ffdca8" />
        </linearGradient>
        <linearGradient id="feather_grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff8787" />
          <stop offset="100%" stopColor="#c92a2a" />
        </linearGradient>
      </defs>

      <rect
        x="24"
        y="94"
        width="80"
        height="18"
        rx="9"
        fill="#1a1714"
        opacity="0.12"
      />
      <rect x="30" y="90" width="68" height="16" rx="8" fill="#b57a32" />
      <rect
        x="30"
        y="18"
        width="68"
        height="14"
        rx="7"
        fill="url(#parchment_grad)"
        stroke="#4e3415"
        strokeWidth="5"
      />
      <rect
        x="34"
        y="25"
        width="60"
        height="66"
        fill="url(#parchment_grad)"
        stroke="#4e3415"
        strokeWidth="5"
      />
      <line
        x1="44"
        y1="42"
        x2="84"
        y2="42"
        stroke="#4e3415"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.2"
      />
      <line
        x1="44"
        y1="52"
        x2="78"
        y2="52"
        stroke="#4e3415"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.2"
      />
      <line
        x1="44"
        y1="62"
        x2="84"
        y2="62"
        stroke="#4e3415"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.2"
      />
      <line
        x1="44"
        y1="72"
        x2="68"
        y2="72"
        stroke="#4e3415"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.2"
      />
      <rect
        x="30"
        y="84"
        width="68"
        height="16"
        rx="8"
        fill="url(#parchment_grad)"
        stroke="#4e3415"
        strokeWidth="5"
      />
      <ellipse cx="94" cy="92" rx="2" ry="4" fill="#4e3415" opacity="0.7" />
      <ellipse cx="34" cy="92" rx="2" ry="4" fill="#4e3415" opacity="0.7" />
      <path
        d="M92 28 C80 40 68 56 56 72 L50 82 L62 78 C74 66 86 52 98 36 Z"
        fill="#1a1714"
        opacity="0.1"
        transform="translate(-4, 6)"
      />
      <path
        d="M96 24 C82 38 68 54 54 70 L48 80 L62 76 C76 62 90 46 104 30 Z"
        fill="#a61e1e"
        transform="translate(0, 3)"
      />
      <path
        d="M96 24 C82 38 68 54 54 70 L48 80 L62 76 C76 62 90 46 104 30 Z"
        fill="url(#feather_grad)"
        stroke="#5c0e10"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M50 78 L98 26"
        stroke="#5c0e10"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M84 38 L76 36 M74 48 L66 46 M64 58 L58 56"
        stroke="#5c0e10"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M40 66 Q40 70 44 70 Q40 70 40 74 Q40 70 36 70 Q40 70 40 66 Z"
        fill="#ffd43b"
      />
    </svg>
  );
}

export function BooksReadStatIllustration({
  className,
  width = 92,
  height = 92,
}: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 128 128"
      width={width}
      height={height}
      className={className}
    >
      <defs>
        <linearGradient
          id="books_bottomBook"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#20c997" />
          <stop offset="100%" stopColor="#087f5b" />
        </linearGradient>
        <linearGradient id="books_topBook" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#339af0" />
          <stop offset="100%" stopColor="#1c7ed6" />
        </linearGradient>
        <linearGradient id="books_star" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffd43b" />
          <stop offset="100%" stopColor="#f59f00" />
        </linearGradient>
      </defs>
      <rect
        x="18"
        y="86"
        width="92"
        height="24"
        rx="12"
        fill="#1a1714"
        opacity="0.15"
      />
      <rect x="24" y="66" width="80" height="22" rx="8" fill="#095c3e" />
      <rect
        x="26"
        y="62"
        width="76"
        height="20"
        rx="8"
        fill="#f8f9fa"
        stroke="#102a1e"
        strokeWidth="4.5"
      />
      <line
        x1="30"
        y1="67"
        x2="88"
        y2="67"
        stroke="#dee2e6"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="30"
        y1="73"
        x2="88"
        y2="73"
        stroke="#dee2e6"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="90"
        y1="67"
        x2="96"
        y2="67"
        stroke="#102a1e"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="90"
        y1="73"
        x2="96"
        y2="73"
        stroke="#102a1e"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect
        x="22"
        y="58"
        width="80"
        height="18"
        rx="6"
        fill="url(#books_bottomBook)"
        stroke="#102a1e"
        strokeWidth="4.5"
      />
      <path d="M38 64 V90 L43 84 V64 Z" fill="#e64980" />
      <path d="M43 64 V84 L48 90 V64 Z" fill="#ff6b6b" />
      <path
        d="M38 64 V90 L43 84 L48 90 V64"
        fill="none"
        stroke="#5c0e10"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g transform="rotate(-5 64 42)">
        <rect x="26" y="38" width="76" height="22" rx="8" fill="#115293" />
        <rect
          x="28"
          y="34"
          width="72"
          height="20"
          rx="8"
          fill="#ffffff"
          stroke="#0b1b3d"
          strokeWidth="4.5"
        />
        <line
          x1="32"
          y1="39"
          x2="84"
          y2="39"
          stroke="#dee2e6"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line
          x1="32"
          y1="45"
          x2="84"
          y2="45"
          stroke="#dee2e6"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line
          x1="88"
          y1="39"
          x2="94"
          y2="39"
          stroke="#0b1b3d"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="88"
          y1="45"
          x2="94"
          y2="45"
          stroke="#0b1b3d"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <rect
          x="24"
          y="30"
          width="76"
          height="18"
          rx="6"
          fill="url(#books_topBook)"
          stroke="#0b1b3d"
          strokeWidth="4.5"
        />
        <path
          d="M62 33 L64.2 37.5 L69 38 L65.5 41.5 L66.5 46.2 L62 43.8 L57.5 46.2 L58.5 41.5 L55 38 L59.8 37.5 Z"
          fill="url(#books_star)"
          stroke="#0b1b3d"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <circle
          cx="48"
          cy="39"
          r="8"
          fill="none"
          stroke="#1a1714"
          strokeWidth="3.5"
        />
        <circle
          cx="76"
          cy="39"
          r="8"
          fill="none"
          stroke="#1a1714"
          strokeWidth="3.5"
        />
        <path
          d="M56 39 A 12 12 0 0 1 68 39"
          fill="none"
          stroke="#1a1714"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <line
          x1="44"
          y1="35"
          x2="48"
          y2="39"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.65"
        />
        <line
          x1="72"
          y1="35"
          x2="76"
          y2="39"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.65"
        />
        <path
          d="M40 39 Q36 36 34 32"
          fill="none"
          stroke="#1a1714"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M84 39 Q88 36 90 32"
          fill="none"
          stroke="#1a1714"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
      <path
        d="M106 20 Q106 24 110 24 Q106 24 106 28 Q106 24 102 24 Q106 24 106 20 Z"
        fill="#ffd43b"
      />
      <path
        d="M18 36 Q18 39 21 39 Q18 39 18 42 Q18 39 15 39 Q18 39 18 36 Z"
        fill="#ffd43b"
      />
    </svg>
  );
}

export function RatingsStatIllustration({
  className,
  width = 92,
  height = 92,
}: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 128 128"
      width={width}
      height={height}
      className={className}
    >
      <defs>
        <linearGradient
          id="ratings_bubbleGrad"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#00f2fe" />
          <stop offset="100%" stopColor="#4facfe" />
        </linearGradient>
        <linearGradient
          id="ratings_starGrad"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#ffea00" />
          <stop offset="100%" stopColor="#ff7a00" />
        </linearGradient>
      </defs>
      <path
        d="M24 38 C24 26.95 32.95 18 44 12 H84 C95.05 18 104 26.95 104 38 V74 C104 85.05 95.05 94 84 94 H52 L32 110 V94 C27.58 94 24 90.42 24 86 Z"
        fill="#1a1714"
        opacity="0.15"
        transform="translate(4, 8)"
      />
      <path
        d="M24 38 C24 26.95 32.95 18 44 18 H84 C95.05 18 104 26.95 104 38 V74 C104 85.05 95.05 94 84 94 H52 L32 110 V94 C27.58 94 24 90.42 24 86 Z"
        fill="#1c69ab"
      />
      <path
        d="M24 32 C24 20.95 32.95 12 44 12 H84 C95.05 12 104 20.95 104 32 V68 C104 79.05 95.05 88 84 88 H52 L32 104 V88 C27.58 88 24 84.42 24 80 Z"
        fill="url(#ratings_bubbleGrad)"
        stroke="#0a2d54"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M34 24 H94"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M64 28 L69 41 L82 41 L71 50 L75 63 L64 54 L53 63 L57 50 L46 41 L59 41 Z"
        fill="#c2410c"
        transform="translate(0, 4)"
      />
      <path
        d="M64 28 L69 41 L82 41 L71 50 L75 63 L64 54 L53 63 L57 50 L46 41 L59 41 Z"
        fill="url(#ratings_starGrad)"
        stroke="#0a2d54"
        strokeWidth="4.5"
        strokeLinejoin="round"
      />
      <path
        d="M74 34 Q74 38 78 38 Q74 38 74 42 Q74 38 70 38 Q74 38 74 34 Z"
        fill="#ffffff"
      />
    </svg>
  );
}

export function RoomsAlternateStatIllustration({
  className,
  width = 92,
  height = 92,
}: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 128 128"
      width={width}
      height={height}
      className={className}
    >
      <defs>
        <linearGradient
          id="rooms_altGoldCup"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#fff3bf" />
          <stop offset="30%" stopColor="#ffd43b" />
          <stop offset="100%" stopColor="#e67e22" />
        </linearGradient>
        <linearGradient
          id="rooms_altShirtGrad"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#5c7cfa" />
          <stop offset="100%" stopColor="#3b5bdb" />
        </linearGradient>
      </defs>

      <ellipse cx="64" cy="106" rx="44" ry="8" fill="#1a1714" opacity="0.15" />
      <path d="M 18,102 C 18,80 62,80 62,102 Z" fill="#253eaf" />
      <circle cx="40" cy="64" r="12" fill="#ab5200" />
      <path
        d="M 18,98 C 18,76 62,76 62,98 Z"
        fill="url(#rooms_altShirtGrad)"
        stroke="#183153"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <circle
        cx="40"
        cy="60"
        r="12"
        fill="url(#rooms_altGoldCup)"
        stroke="#5c2600"
        strokeWidth="5"
      />
      <path
        d="M 33,56 A 9 9 0 0 1 43,51"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.5"
      />

      <path d="M 66,102 C 66,80 110,80 110,102 Z" fill="#253eaf" />
      <circle cx="88" cy="64" r="12" fill="#ab5200" />
      <path
        d="M 66,98 C 66,76 110,76 110,98 Z"
        fill="url(#rooms_altShirtGrad)"
        stroke="#183153"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <circle
        cx="88"
        cy="60"
        r="12"
        fill="url(#rooms_altGoldCup)"
        stroke="#5c2600"
        strokeWidth="5"
      />
      <path
        d="M 81,56 A 9 9 0 0 1 91,51"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.5"
      />

      <path d="M 34,102 C 34,70 94,70 94,102 Z" fill="#253eaf" />
      <circle cx="64" cy="48" r="16" fill="#ab5200" />
      <path
        d="M 34,98 C 34,66 94,66 94,98 Z"
        fill="url(#rooms_altShirtGrad)"
        stroke="#183153"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <circle
        cx="64"
        cy="44"
        r="16"
        fill="url(#rooms_altGoldCup)"
        stroke="#5c2600"
        strokeWidth="5"
      />
      <path
        d="M 54,39 A 12 12 0 0 1 69,32"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}
