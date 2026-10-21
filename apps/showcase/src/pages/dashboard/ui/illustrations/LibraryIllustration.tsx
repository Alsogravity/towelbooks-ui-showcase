export function LibraryIllustration({
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
      aria-label="Cozy 3D-styled library shelf with books"
    >
      <defs>
        {/* Shelf rich wood gradient */}
        <linearGradient id="lib_wood" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d7ad75" />
          <stop offset="100%" stopColor="#8d683f" />
        </linearGradient>

        {/* Book cover warm gold-yellow gradient */}
        <linearGradient id="lib_gold_cover" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffdf99" />
          <stop offset="100%" stopColor="#bd8e3a" />
        </linearGradient>

        {/* Book cover rich forest green gradient */}
        <linearGradient id="lib_sage_cover" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9cc9ab" />
          <stop offset="100%" stopColor="#558a66" />
        </linearGradient>

        {/* Book cover warm brick-red gradient */}
        <linearGradient
          id="lib_brick_cover"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#ff8a70" />
          <stop offset="100%" stopColor="#be3925" />
        </linearGradient>

        {/* Book cover deep indigo-blue gradient */}
        <linearGradient
          id="lib_indigo_cover"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#a5b4fc" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>

        {/* Luminous pages cream gradient */}
        <linearGradient id="lib_pages" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#fffdf2" />
        </linearGradient>
      </defs>

      {/* --- WOODEN SHELF --- */}
      {/* 3D Under-Shadow */}
      <ellipse
        cx="128"
        cy="188"
        rx="100"
        ry="12"
        fill="#101112"
        opacity="0.1"
      />
      {/* Shelf Extrusion Base */}
      <rect
        x="36"
        y="174"
        width="184"
        height="12"
        rx="3"
        fill="#6d4c2b"
        stroke="#101112"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* Shelf Top Board */}
      <rect
        x="28"
        y="162"
        width="200"
        height="14"
        rx="4"
        fill="url(#lib_wood)"
        stroke="#101112"
        strokeWidth="5"
        strokeLinejoin="round"
      />

      {/* --- BOOK 1 (Left, Tall Upright, Gold/Yellow) --- */}
      <g>
        <rect
          x="50"
          y="82"
          width="34"
          height="82"
          rx="4"
          fill="url(#lib_gold_cover)"
          stroke="#101112"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <circle
          cx="67"
          cy="112"
          r="5"
          fill="#fbf7ee"
          stroke="#101112"
          strokeWidth="2.5"
        />
        <line
          x1="50"
          y1="94"
          x2="84"
          y2="94"
          stroke="#101112"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <line
          x1="50"
          y1="150"
          x2="84"
          y2="150"
          stroke="#101112"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </g>

      {/* --- BOOK 2 (Middle, Sage Green) --- */}
      <g>
        <rect
          x="86"
          y="96"
          width="30"
          height="68"
          rx="4"
          fill="url(#lib_sage_cover)"
          stroke="#101112"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <line
          x1="86"
          y1="106"
          x2="116"
          y2="106"
          stroke="#101112"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.4"
        />
        <line
          x1="86"
          y1="112"
          x2="116"
          y2="112"
          stroke="#101112"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.4"
        />
        <line
          x1="86"
          y1="146"
          x2="116"
          y2="146"
          stroke="#101112"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.4"
        />
      </g>

      {/* --- BOOK 3 (Right, Leaning, Brick Red) --- */}
      <g transform="rotate(-15 150 164)">
        <rect
          x="134"
          y="78"
          width="28"
          height="86"
          rx="4"
          fill="url(#lib_brick_cover)"
          stroke="#101112"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <line
          x1="134"
          y1="90"
          x2="162"
          y2="90"
          stroke="#101112"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="134"
          y1="148"
          x2="162"
          y2="148"
          stroke="#101112"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>

      {/* --- BOOK 4 (Far Right, Indigo Blue) --- */}
      <g>
        <rect
          x="165"
          y="96"
          width="30"
          height="68"
          rx="4"
          fill="url(#lib_indigo_cover)"
          stroke="#101112"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <line
          x1="165"
          y1="106"
          x2="195"
          y2="106"
          stroke="#101112"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.4"
        />
        <line
          x1="165"
          y1="112"
          x2="195"
          y2="112"
          stroke="#101112"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.4"
        />
        <line
          x1="165"
          y1="146"
          x2="195"
          y2="146"
          stroke="#101112"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.4"
        />
      </g>

      {/* --- RADIATING SPARKLES & RAYS (Warm Gold Theme) --- */}
      <path
        stroke="#bd8e3a"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M 102,61 L 91,48"
      />
      <path
        stroke="#bd8e3a"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M 132,53 L 132,33"
      />
      <path
        stroke="#bd8e3a"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M 162,61 L 173,48"
      />

      {/* Puffy White Sparkle Glints */}
      <path
        d="M 44,116 Q 44,120 48,120 Q 44,120 44,124 Q 44,120 40,120 Q 44,120 44,116 Z"
        fill="#ffffff"
      />
      <path
        d="M 198,110 Q 198,114 202,114 Q 198,114 198,118 Q 198,114 194,114 Q 198,114 198,110 Z"
        fill="#ffffff"
      />
    </svg>
  );
}
