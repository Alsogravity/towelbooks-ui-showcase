export function BookmarkBooksIllustration({
  className,
  width = 92,
  height = 92,
}: {
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <svg
      viewBox="0 0 256 256"
      width={width}
      height={height}
      className={[className, 'overflow-visible'].filter(Boolean).join(' ')}
      role="img"
      aria-label="Cozy 3D-styled stack of books with bookmark"
    >
      <defs>
        {/* Book cover rich forest green gradient */}
        <linearGradient
          id="stack_forest_cover"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#9cc9ab" />
          <stop offset="100%" stopColor="#558a66" />
        </linearGradient>

        {/* Book cover warm gold-bronze gradient */}
        <linearGradient
          id="stack_gold_cover"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#ffdf99" />
          <stop offset="100%" stopColor="#bd8e3a" />
        </linearGradient>

        {/* Book cover warm brick-red gradient */}
        <linearGradient
          id="stack_brick_cover"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#ff8a70" />
          <stop offset="100%" stopColor="#be3925" />
        </linearGradient>

        {/* Luminous pages cream gradient */}
        <linearGradient id="stack_pages" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#fffdf2" />
        </linearGradient>

        {/* Book cover deep indigo-blue gradient */}
        <linearGradient
          id="stack_indigo_cover"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#a5b4fc" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>

        {/* Book cover teal gradient */}
        <linearGradient
          id="stack_teal_cover"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
      </defs>

      {/* --- BOTTOM BOOK (Forest Green) --- */}
      {/* 3D Under-Shadow */}
      <ellipse cx="128" cy="204" rx="76" ry="12" fill="#101112" opacity="0.1" />
      {/* Main Cover */}
      <rect
        x="52"
        y="164"
        width="152"
        height="26"
        rx="6"
        fill="url(#stack_forest_cover)"
        stroke="#101112"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* Page Edges */}
      <rect
        x="68"
        y="169"
        width="132"
        height="15"
        rx="2"
        fill="url(#stack_pages)"
        stroke="#101112"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Page Line details */}
      <path
        d="M 76,176 H 188"
        stroke="#101112"
        strokeWidth="2.5"
        opacity="0.15"
        strokeLinecap="round"
      />

      {/* --- MIDDLE BOOK (Warm Gold, slightly offset to the left) --- */}
      {/* Main Cover */}
      <rect
        x="44"
        y="138"
        width="152"
        height="26"
        rx="6"
        fill="url(#stack_gold_cover)"
        stroke="#101112"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* Page Edges */}
      <rect
        x="60"
        y="143"
        width="132"
        height="15"
        rx="2"
        fill="url(#stack_pages)"
        stroke="#101112"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Page Line details */}
      <path
        d="M 68,150 H 180"
        stroke="#101112"
        strokeWidth="2.5"
        opacity="0.15"
        strokeLinecap="round"
      />

      {/* --- TOP BOOK (Brick Red, slightly offset to the right) --- */}
      {/* Main Cover */}
      <rect
        x="60"
        y="112"
        width="144"
        height="26"
        rx="6"
        fill="url(#stack_brick_cover)"
        stroke="#101112"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* Page Edges */}
      <rect
        x="76"
        y="117"
        width="124"
        height="15"
        rx="2"
        fill="url(#stack_pages)"
        stroke="#101112"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Page Line details */}
      <path
        d="M 84,124 H 188"
        stroke="#101112"
        strokeWidth="2.5"
        opacity="0.15"
        strokeLinecap="round"
      />

      {/* --- FOURTH BOOK (Indigo Blue, offset to the left) --- */}
      {/* Main Cover */}
      <rect
        x="46"
        y="86"
        width="140"
        height="26"
        rx="6"
        fill="url(#stack_indigo_cover)"
        stroke="#101112"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* Page Edges */}
      <rect
        x="62"
        y="91"
        width="112"
        height="15"
        rx="2"
        fill="url(#stack_pages)"
        stroke="#101112"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Page Line details */}
      <path
        d="M 70,98 H 178"
        stroke="#101112"
        strokeWidth="2.5"
        opacity="0.15"
        strokeLinecap="round"
      />

      {/* --- FIFTH BOOK (Teal, offset to the right) --- */}
      {/* Main Cover */}
      <rect
        x="58"
        y="60"
        width="136"
        height="26"
        rx="6"
        fill="url(#stack_teal_cover)"
        stroke="#101112"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* Page Edges */}
      <rect
        x="74"
        y="65"
        width="108"
        height="15"
        rx="2"
        fill="url(#stack_pages)"
        stroke="#101112"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Page Line details */}
      <path
        d="M 82,72 H 180"
        stroke="#101112"
        strokeWidth="2.5"
        opacity="0.15"
        strokeLinecap="round"
      />

      {/* --- RADIATING SPARKLES & RAYS (Warm Gold Theme) --- */}
      <path
        stroke="#bd8e3a"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M 102,46 L 91,33"
      />
      <path
        stroke="#bd8e3a"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M 132,38 L 132,18"
      />
      <path
        stroke="#bd8e3a"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M 162,46 L 173,33"
      />

      {/* Puffy White Sparkle Glints */}
      <path
        d="M 52,106 Q 52,110 56,110 Q 52,110 52,114 Q 52,110 48,110 Q 52,110 52,106 Z"
        fill="#ffffff"
      />
      <path
        d="M 200,120 Q 200,124 204,124 Q 200,124 200,128 Q 200,124 196,124 Q 200,124 200,120 Z"
        fill="#ffffff"
      />
    </svg>
  );
}
