export function OpenBookIllustration({
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
      aria-label="Open book hand drawn icon"
    >
      <defs>
        {/* Book cover warm red-cherry gradient */}
        <linearGradient id="open_coverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff4d6d" />
          <stop offset="100%" stopColor="#c9184a" />
        </linearGradient>

        {/* Luminous pages cream gradient */}
        <linearGradient id="open_pagesGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f8f1e5" />
        </linearGradient>

        {/* Golden star/beam accent */}
        <linearGradient id="open_goldStar" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff3bf" />
          <stop offset="100%" stopColor="#ffd43b" />
        </linearGradient>
      </defs>

      {/* --- BACK COVER 3D EXTRUSION & GLOW --- */}
      {/* Extrusion shadow */}
      <path
        d="M 32,84 C 32,79 35,74 39,71 C 66,53 104,54 127,76 C 150,54 188,53 215,71 C 219,74 222,79 222,84 L 218,206 C 187,192 153,194 127,216 C 101,194 67,192 36,206 Z"
        fill="#800f2f"
      />
      {/* Back Cover Surface (Rich Red) */}
      <path
        d="M 32,80 C 32,75 35,70 39,67 C 66,49 104,50 127,72 C 150,50 188,49 215,67 C 219,70 222,75 222,80 L 218,202 C 187,188 153,190 127,212 C 101,188 67,190 36,202 Z"
        fill="url(#open_coverGrad)"
        stroke="#101112"
        strokeWidth="5"
        strokeLinejoin="round"
      />

      {/* --- PAGE STACK UNDERLAY (For 3D page edge thickness) --- */}
      <path
        d="M 36,83 C 63,65 98,66 123,86 L 123,205 C 98,185 63,184 36,202 Z"
        fill="#eae0d5"
        stroke="#101112"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M 129,86 C 154,66 189,65 216,83 L 216,202 C 189,184 154,185 129,205 Z"
        fill="#eae0d5"
        stroke="#101112"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* --- CANONICAL OPEN PAGES --- */}
      {/* Left Page (Glowing Cream White) */}
      <path
        fill="url(#open_pagesGrad)"
        stroke="#101112"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M126 76C103 54 65 53 38 71c-4 3-7 8-7 13l4 119c28-14 66-13 91 11z"
      />
      {/* Right Page (Glowing Cream White) */}
      <path
        fill="url(#open_pagesGrad)"
        stroke="#101112"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M126 76c25-22 63-23 89-5 5 3 8 8 7 14l-4 118c-29-14-68-13-92 11z"
      />

      {/* center book fold spine */}
      <path
        stroke="#101112"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M126 77c-1 32 0 79 0 137"
      />

      {/* page text marks left */}
      <path
        stroke="#101112"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
        d="M61 100c13-9 28-8 43 1"
      />
      <path
        stroke="#101112"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
        d="M62 132c17-10 31-8 47 1"
      />
      <path
        stroke="#101112"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
        d="M64 163c16-8 31-8 46 2"
      />

      {/* page text marks right */}
      <path
        stroke="#101112"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
        d="M149 101c14-9 29-10 45-1"
      />
      <path
        stroke="#101112"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
        d="M148 133c17-10 32-9 48 1"
      />
      <path
        stroke="#101112"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
        d="M148 164c16-8 31-9 47 1"
      />

      {/* --- EMPHASIS & SPARKS OF DISCOVERY --- */}
      {/* Radiating cozy discovery warm rays (Warm Gold) */}
      <path
        stroke="#bd8e3a"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M74 29l11 13"
      />
      <path
        stroke="#bd8e3a"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M115 18l2 20"
      />
      <path
        stroke="#bd8e3a"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M161 26l-13 16"
      />

      {/* Puffy white sparkle glints */}
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
