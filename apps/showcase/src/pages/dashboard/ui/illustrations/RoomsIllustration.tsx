export function RoomsIllustration({
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
      fill="none"
      className={[className, 'overflow-visible'].filter(Boolean).join(' ')}
      role="img"
      aria-label="Cozy colorful book room hand drawn illustration"
    >
      <defs>
        {/* Table cloth gradient */}
        <linearGradient id="tableCloth" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4fc3f7" />
          <stop offset="100%" stopColor="#0288d1" />
        </linearGradient>

        {/* Character gradients */}
        <linearGradient id="bunnyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffb3ba" />
          <stop offset="100%" stopColor="#ff8b94" />
        </linearGradient>
        <linearGradient id="bearGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#20c997" />
          <stop offset="100%" stopColor="#087f5b" />
        </linearGradient>
        <linearGradient id="owlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#b19ffb" />
          <stop offset="100%" stopColor="#748ffc" />
        </linearGradient>

        {/* Book cover & page gradients */}
        <linearGradient id="catalogCover" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff4b5c" />
          <stop offset="100%" stopColor="#cc0033" />
        </linearGradient>
        <linearGradient id="glowingStar" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff3bf" />
          <stop offset="40%" stopColor="#ffd43b" />
          <stop offset="100%" stopColor="#f59f00" />
        </linearGradient>
      </defs>

      {/* --- BACKGROUND CHARACTERS (Behind table) --- */}

      {/* LEFT: Cute Bunny Character */}
      <g>
        {/* Bunny floppy ears */}
        <path
          d="M 64,115 C 50,75 70,70 70,110"
          stroke="#101112"
          strokeWidth="5"
          fill="#ffb3ba"
          strokeLinecap="round"
        />
        <path
          d="M 86,115 C 100,75 80,70 80,110"
          stroke="#101112"
          strokeWidth="5"
          fill="#ffb3ba"
          strokeLinecap="round"
        />
        {/* Inner ears */}
        <path d="M 64,115 C 55,85 67,82 67,110" fill="#ff8b94" opacity="0.6" />
        <path d="M 86,115 C 95,85 83,82 83,110" fill="#ff8b94" opacity="0.6" />
        {/* Head */}
        <circle
          cx="75"
          cy="128"
          r="26"
          fill="url(#bunnyGrad)"
          stroke="#101112"
          strokeWidth="5.5"
        />
        {/* Happy closed eyes */}
        <path
          d="M 62,126 Q 67,121 72,126"
          stroke="#101112"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 78,126 Q 83,121 88,126"
          stroke="#101112"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Big cute round glasses */}
        <circle
          cx="67"
          cy="125"
          r="11"
          stroke="#101112"
          strokeWidth="4"
          fill="none"
        />
        <circle
          cx="83"
          cy="125"
          r="11"
          stroke="#101112"
          strokeWidth="4"
          fill="none"
        />
        <line
          x1="71.5"
          y1="125"
          x2="78.5"
          y2="125"
          stroke="#101112"
          strokeWidth="4.5"
        />
        {/* Cute blush cheeks */}
        <ellipse cx="57" cy="133" rx="4" ry="2" fill="#cc0033" opacity="0.3" />
        <ellipse cx="93" cy="133" rx="4" ry="2" fill="#cc0033" opacity="0.3" />
        {/* Muzzle nose */}
        <polygon points="75,130 73,133 77,130" fill="#101112" />
        {/* Joyful open mouth */}
        <path
          d="M 72,135 Q 75,139 78,135 Z"
          fill="#cc0033"
          stroke="#101112"
          strokeWidth="2.5"
        />
      </g>

      {/* RIGHT: Beanie Bear Character */}
      <g>
        {/* Bear ears */}
        <circle
          cx="162"
          cy="108"
          r="11"
          fill="url(#bearGrad)"
          stroke="#101112"
          strokeWidth="5"
        />
        <circle
          cx="200"
          cy="108"
          r="11"
          fill="url(#bearGrad)"
          stroke="#101112"
          strokeWidth="5"
        />
        <circle cx="162" cy="108" r="5" fill="#087f5b" opacity="0.4" />
        <circle cx="200" cy="108" r="5" fill="#087f5b" opacity="0.4" />
        {/* Head */}
        <circle
          cx="181"
          cy="128"
          r="26"
          fill="url(#bearGrad)"
          stroke="#101112"
          strokeWidth="5.5"
        />
        {/* Orange Beanie Hat */}
        <path
          d="M 160,118 C 160,94 202,94 202,118 Z"
          fill="#ffd43b"
          stroke="#101112"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        {/* Beanie pompom */}
        <circle
          cx="181"
          cy="92"
          r="7"
          fill="#f59f00"
          stroke="#101112"
          strokeWidth="4.5"
        />
        {/* Smiling Face */}
        <circle cx="171" cy="124" r="3" fill="#101112" />
        <circle cx="191" cy="124" r="3" fill="#101112" />
        <path
          d="M 175,132 Q 181,138 187,132 Z"
          fill="#ffffff"
          stroke="#101112"
          strokeWidth="3"
        />
        {/* Cheeks */}
        <ellipse
          cx="166"
          cy="129"
          rx="3"
          ry="1.5"
          fill="#ffd43b"
          opacity="0.4"
        />
        <ellipse
          cx="196"
          cy="129"
          rx="3"
          ry="1.5"
          fill="#ffd43b"
          opacity="0.4"
        />
      </g>

      {/* CENTER: Wise Owl Character */}
      <g>
        {/* Owl feather tufts (ears) */}
        <polygon
          points="106,94 116,80 122,90"
          fill="#748ffc"
          stroke="#101112"
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        <polygon
          points="150,94 140,80 134,90"
          fill="#748ffc"
          stroke="#101112"
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        {/* Head */}
        <circle
          cx="128"
          cy="112"
          r="28"
          fill="url(#owlGrad)"
          stroke="#101112"
          strokeWidth="5.5"
        />
        {/* Huge adorable round white eyes */}
        <circle
          cx="117"
          cy="108"
          r="11"
          fill="#ffffff"
          stroke="#101112"
          strokeWidth="4.5"
        />
        <circle
          cx="139"
          cy="108"
          r="11"
          fill="#ffffff"
          stroke="#101112"
          strokeWidth="4.5"
        />
        {/* Pupils with glossy catchlights */}
        <circle cx="117" cy="108" r="5" fill="#101112" />
        <circle cx="139" cy="108" r="5" fill="#101112" />
        <circle cx="119" cy="106" r="1.5" fill="#ffffff" />
        <circle cx="141" cy="106" r="1.5" fill="#ffffff" />
        {/* Orange Beak */}
        <polygon
          points="125,112 131,112 128,119"
          fill="#f59f00"
          stroke="#101112"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Wise eyebrow bridges */}
        <path
          d="M 104,98 Q 117,95 125,101"
          stroke="#101112"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 152,98 Q 139,95 131,101"
          stroke="#101112"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Owl body chest feathers */}
        <path
          d="M 120,132 Q 124,136 128,132"
          stroke="#101112"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 124,137 Q 128,141 132,137"
          stroke="#101112"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* --- FOREGROUND TABLE (Luminous Sky Blue 3D Tablecloth) --- */}
      <g>
        {/* 3D Extrusion rim (dark blue) */}
        <ellipse
          cx="128"
          cy="180"
          rx="96"
          ry="44"
          fill="#01579b"
          stroke="#003554"
          strokeWidth="6"
        />
        {/* Tabletop Surface */}
        <ellipse
          cx="128"
          cy="174"
          rx="96"
          ry="44"
          fill="url(#tableCloth)"
          stroke="#003554"
          strokeWidth="6"
        />
        {/* Table Cloth Rim Sheen */}
        <ellipse
          cx="128"
          cy="172"
          rx="92"
          ry="40"
          fill="none"
          stroke="#e0f7fa"
          strokeWidth="3"
          opacity="0.3"
        />
      </g>

      {/* --- STEAMING HOT COZY CUPS (On the table left/right) --- */}
      <g>
        {/* Left Coffee Cup (Red/Coral) */}
        <rect
          x="52"
          y="164"
          width="12"
          height="16"
          rx="4"
          fill="#ff4b5c"
          stroke="#101112"
          strokeWidth="3.5"
        />
        <path
          d="M 52,168 H 47 C 44,168 44,174 47,174 H 52"
          fill="none"
          stroke="#101112"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Steaming air wave */}
        <path
          d="M 58,154 Q 55,148 59,144"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />

        {/* Right Green Cup */}
        <rect
          x="192"
          y="164"
          width="12"
          height="16"
          rx="4"
          fill="#20c997"
          stroke="#101112"
          strokeWidth="3.5"
        />
        <path
          d="M 204,168 H 209 C 212,168 212,174 209,174 H 204"
          fill="none"
          stroke="#101112"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Steaming air wave */}
        <path
          d="M 198,154 Q 195,148 199,144"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />
      </g>

      {/* --- CANONICAL 3D OPEN BOOK CENTERPIECE --- */}
      <g>
        {/* Red cover extrusion shadow under pages */}
        <path
          d="M 128,158 C 104,142 70,141 44,158 V 194 C 70,178 104,179 128,197 C 152,179 186,178 212,194 V 158 Z"
          fill="#990011"
        />
        {/* Main cover envelope */}
        <path
          d="M 128,154 C 104,138 70,137 44,154 V 190 C 70,174 104,175 128,193 C 152,175 186,174 212,190 V 154 Z"
          fill="url(#catalogCover)"
          stroke="#101112"
          strokeWidth="5"
          strokeLinejoin="round"
        />

        {/* Thick, layered 3D Cream/White book pages */}
        {/* Left Page block */}
        <path
          d="M 128,151 C 106,133 74,133 48,149 L 48,185 C 74,169 106,169 128,187 Z"
          fill="#fbf7ee"
          stroke="#101112"
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        {/* Right Page block */}
        <path
          d="M 128,151 C 150,133 182,133 208,149 L 208,185 C 182,169 150,169 128,187 Z"
          fill="#fbf7ee"
          stroke="#101112"
          strokeWidth="4.5"
          strokeLinejoin="round"
        />

        {/* Center book binding line */}
        <path d="M 128,151 L 128,187" stroke="#101112" strokeWidth="4" />

        {/* Book reading lines on left page */}
        <path
          d="M 62,156 H 110"
          stroke="#101112"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.3"
        />
        <path
          d="M 64,166 H 102"
          stroke="#101112"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.3"
        />
        <path
          d="M 60,176 H 108"
          stroke="#101112"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.3"
        />

        {/* Beautiful luminous golden star centered on right page */}
        <path
          d="M 168,151 L 171,158 L 178,159 L 173,164 L 175,171 L 168,167 L 161,171 L 163,164 L 158,159 L 165,158 Z"
          fill="url(#glowingStar)"
          stroke="#101112"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
      </g>

      {/* --- MAGICAL RADIATING DETAILS & SPARKLES --- */}
      <g>
        {/* Luminous floating rays */}
        <path
          d="M 88,40 Q 94,52 86,58"
          stroke="#ffd43b"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />
        <path
          d="M 128,26 L 128,42"
          stroke="#ffd43b"
          strokeWidth="4.5"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M 168,40 Q 162,52 170,58"
          stroke="#ffd43b"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />

        {/* Magical puffy 4-pointed white sparkle glints */}
        <path
          d="M 100,105 Q 100,109 104,109 Q 100,109 100,113 Q 100,109 96,109 Q 100,109 100,105 Z"
          fill="#ffffff"
        />
        <path
          d="M 152,112 Q 152,116 156,116 Q 152,116 152,120 Q 152,116 148,116 Q 152,116 152,112 Z"
          fill="#ffffff"
        />

        {/* Tiny floating golden particles */}
        <circle
          cx="106"
          cy="148"
          r="3.5"
          fill="#f59f00"
          stroke="#101112"
          strokeWidth="1.5"
        />
        <circle
          cx="150"
          cy="144"
          r="3.5"
          fill="#f59f00"
          stroke="#101112"
          strokeWidth="1.5"
        />
      </g>
    </svg>
  );
}
