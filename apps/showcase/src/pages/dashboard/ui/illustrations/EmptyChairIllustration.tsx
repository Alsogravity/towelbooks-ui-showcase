import { useEffectiveTheme } from '../../../../features/theme/ThemeContext';

export function EmptyChairIllustration({
  className,
  width = 92,
  height = 92,
}: {
  className?: string;
  width?: number;
  height?: number;
}) {
  const effectiveTheme = useEffectiveTheme();

  return (
    <svg
      viewBox="0 0 256 256"
      width={width}
      height={height}
      className={[className, 'overflow-visible'].filter(Boolean).join(' ')}
      role="img"
      aria-label="Creative hand-drawn colorful cozy reading scene with empty armchair, sleeping cat, tea table, stack of books, and floor lamp"
    >
      <defs>
        {/* Armchair gradients */}
        <linearGradient id="chair_fabric" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#20c997" />
          <stop offset="100%" stopColor="#087f5b" />
        </linearGradient>

        {/* Lamp shade crimson gradient */}
        <linearGradient
          id="chair_lampShade"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#ff4d6d" />
          <stop offset="100%" stopColor="#c9184a" />
        </linearGradient>

        {/* Sleeping ginger cat gradient */}
        <linearGradient id="chair_catGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff9f43" />
          <stop offset="100%" stopColor="#ee5253" />
        </linearGradient>

        {/* Rug salmon-pink gradient */}
        <linearGradient id="chair_rugGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff8787" />
          <stop offset="100%" stopColor="#ffb3ba" />
        </linearGradient>

        {/* Golden brass gradient */}
        <linearGradient id="chair_brass" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop
            offset="0%"
            stopColor={effectiveTheme === 'light' ? '#c49b38' : '#ffe066'}
          />
          <stop
            offset="100%"
            stopColor={effectiveTheme === 'light' ? '#8b6914' : '#f59f00'}
          />
        </linearGradient>

        {/* Glowing lamp beam */}
        <linearGradient id="chair_lampBeam" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop
            offset="0%"
            stopColor={effectiveTheme === 'light' ? '#d4a843' : '#ffe066'}
            stopOpacity={effectiveTheme === 'light' ? 0.3 : 0.15}
          />
          <stop
            offset="100%"
            stopColor={effectiveTheme === 'light' ? '#8b6914' : '#f59f00'}
            stopOpacity="0.0"
          />
        </linearGradient>
      </defs>

      {/* --- CARPET / RUG FLOOR BASE --- */}
      {/* 3D Oval Rug */}
      <ellipse
        cx="120"
        cy="192"
        rx="104"
        ry="28"
        fill="url(#chair_rugGrad)"
        fillOpacity="0.22"
        stroke="#101112"
        strokeWidth="4"
        strokeDasharray="3 3"
      />

      {/* --- LAMP LIGHT BEAM PROJECTED POOL --- */}
      {/* Projected cozy warm cone of light */}
      <path d="M 116,48 L 38,192 H 166 Z" fill="url(#chair_lampBeam)" />

      {/* --- STACK OF BOOKS ON THE FLOOR (Left) --- */}
      <g>
        {/* Shadow */}
        <rect
          x="44"
          y="181"
          width="22"
          height="10"
          rx="4"
          fill="#101112"
          opacity="0.1"
        />
        {/* Bottom Book (Electric Blue) */}
        <rect
          x="42"
          y="176"
          width="22"
          height="10"
          rx="4"
          fill="#339af0"
          stroke="#101112"
          strokeWidth="3"
        />
        {/* Book spine sheets line */}
        <line
          x1="56"
          y1="181"
          x2="62"
          y2="181"
          stroke="#101112"
          strokeWidth="2"
        />

        {/* Top Leaning Book (Vibrant Ruby) */}
        <g transform="rotate(-12 50 176)">
          <rect
            x="42"
            y="168"
            width="20"
            height="10"
            rx="4"
            fill="#ff4b5c"
            stroke="#101112"
            strokeWidth="3"
          />
          <line
            x1="54"
            y1="173"
            x2="60"
            y2="173"
            stroke="#101112"
            strokeWidth="2"
          />
        </g>
      </g>

      {/* --- STOOL SIDE TABLE & COZY MUG (Right) --- */}
      <g>
        {/* Stool legs (Golden Wood) */}
        <path
          d="M 158,169 L 154,192"
          stroke="url(#chair_brass)"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <path
          d="M 174,169 L 178,192"
          stroke="url(#chair_brass)"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        {/* Table Top (Volumetric wooden stool top) */}
        <rect
          x="150"
          y="162"
          width="28"
          height="8"
          rx="4"
          fill="#9e5012"
          stroke="#101112"
          strokeWidth="4"
        />
        <rect
          x="150"
          y="160"
          width="28"
          height="6"
          rx="4"
          fill="url(#chair_brass)"
          stroke="#101112"
          strokeWidth="4"
        />

        {/* Cozy Steaming Mug (Coral Red) */}
        <rect
          x="158"
          y="148"
          width="12"
          height="13"
          rx="3"
          fill="#ff6b6b"
          stroke="#101112"
          strokeWidth="3.5"
        />
        <path
          d="M 170,151 C 173,151 173,156 170,156"
          fill="none"
          stroke="#101112"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Steam curls */}
        <path
          d="M 162,143 Q 160,138 164,134"
          stroke={effectiveTheme === 'light' ? '#a0752a' : '#ffffff'}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />
        <path
          d="M 166,143 Q 164,138 168,134"
          stroke={effectiveTheme === 'light' ? '#a0752a' : '#ffffff'}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />
      </g>

      {/* --- COZY 3D ARMCHAIR --- */}
      <g>
        {/* Armchair wooden pegs / legs */}
        <path
          d="M 78,158 L 72,188"
          stroke="url(#chair_brass)"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
        <path
          d="M 130,158 L 136,188"
          stroke="url(#chair_brass)"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
        <path
          d="M 88,158 L 86,182"
          stroke="url(#chair_brass)"
          strokeWidth="4.5"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M 120,158 L 122,182"
          stroke="url(#chair_brass)"
          strokeWidth="4.5"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Cozy Backrest (Deep Volumetric Green) */}
        {/* Backrest 3D thick border block */}
        <path
          d="M 80,148 C 80,92 128,92 128,148"
          fill="#065f3e"
          stroke="#101112"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Backrest Face */}
        <path
          d="M 80,144 C 80,88 128,88 128,144"
          fill="url(#chair_fabric)"
          stroke="#101112"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Cute Yellow Pillow inside chair */}
        <path
          d="M 94,139 C 102,126 110,126 118,139 Z"
          fill="#ffd43b"
          stroke="#101112"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Left armrest 3D cushion cylinder */}
        <path
          d="M 68,148 C 56,148 56,120 71,120 Q 80,120 80,148"
          fill="#065f3e"
          stroke="#101112"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Right armrest 3D cushion cylinder */}
        <path
          d="M 140,148 C 152,148 152,120 137,120 Q 128,120 128,148"
          fill="#065f3e"
          stroke="#101112"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Seat cushion base (Volumetric cylinder block) */}
        <path
          d="M 68,148 C 68,140 140,140 140,148 C 140,156 68,156 68,148 Z"
          fill="url(#chair_fabric)"
          stroke="#101112"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* --- GINGER CURLY SLEEPING CAT --- */}
      <g>
        {/* Cat Tail wrapped snugly around bottom right */}
        <path
          d="M 120,135 C 126,135 128,143 116,143 C 106,143 102,141 102,141"
          fill="none"
          stroke="#101112"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M 120,135 C 126,135 128,143 116,143 C 106,143 102,141 102,141"
          fill="none"
          stroke="url(#chair_catGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Cat Plump Body (Slightly flattened 3D sleeping bean/loaf shape) */}
        <ellipse
          cx="108"
          cy="133"
          rx="17"
          ry="11"
          fill="url(#chair_catGrad)"
          stroke="#101112"
          strokeWidth="4.5"
        />

        {/* Stripes on body */}
        <path
          d="M 112,122 Q 115,126 110,130"
          stroke="#9e5012"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 118,124 Q 120,128 116,132"
          stroke="#9e5012"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Cat Head (overlapping body on left, shifted slightly up) */}
        <circle
          cx="94"
          cy="130"
          r="9"
          fill="url(#chair_catGrad)"
          stroke="#101112"
          strokeWidth="4.5"
        />

        {/* Cute Ears sticking up from the head */}
        <polygon
          points="88,124 84,114 91,121"
          fill="#ee5253"
          stroke="#101112"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <polygon
          points="96,123 98,113 101,120"
          fill="#ee5253"
          stroke="#101112"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Sleeping cozy eyes (~ ~) */}
        <path
          d="M 87,130 Q 89,132 91,129"
          stroke="#101112"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 95,130 Q 97,132 99,129"
          stroke="#101112"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Tiny nose */}
        <polygon
          points="92,132 94,132 93,134"
          fill="#ee5253"
          stroke="#101112"
          strokeWidth="1"
        />

        {/* Whiskers */}
        <path
          d="M 86,133 H 81"
          stroke="#101112"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 87,136 L 82,138"
          stroke="#101112"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 100,133 H 105"
          stroke="#101112"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 99,136 L 103,138"
          stroke="#101112"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>

      {/* --- COZY FLOOR READING LAMP (Brass tube) --- */}
      <g>
        {/* Base (Gold) */}
        <path
          d="M 180,192 L 206,192"
          stroke="url(#chair_brass)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Curved stem (Extending up, then curving down gracefully over the armchair) */}
        <path
          d="M 193,192 C 193,110 193,42 118,42"
          fill="none"
          stroke="url(#chair_brass)"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Lamp Shade (Retro Ruby Red Dome) */}
        {/* Dome body */}
        <path
          d="M 104,34 C 110,26 124,38 128,46 C 124,51 120,53 116,54 C 110,46 107,40 104,34 Z"
          fill="url(#chair_lampShade)"
          stroke="#101112"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Glowing warm beams float lines */}
        <path
          d="M 100,66 L 82,82"
          stroke={effectiveTheme === 'light' ? '#8b6914' : '#ffd43b'}
          strokeWidth="4.5"
          strokeLinecap="round"
          opacity={effectiveTheme === 'light' ? 0.7 : 0.6}
        />
        <path
          d="M 116,72 L 108,102"
          stroke={effectiveTheme === 'light' ? '#8b6914' : '#ffd43b'}
          strokeWidth="4.5"
          strokeLinecap="round"
          opacity={effectiveTheme === 'light' ? 0.7 : 0.6}
        />
        <path
          d="M 132,68 L 132,90"
          stroke={effectiveTheme === 'light' ? '#8b6914' : '#ffd43b'}
          strokeWidth="4.5"
          strokeLinecap="round"
          opacity={effectiveTheme === 'light' ? 0.7 : 0.6}
        />
      </g>
    </svg>
  );
}
