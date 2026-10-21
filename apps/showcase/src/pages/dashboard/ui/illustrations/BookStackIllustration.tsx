export function BookStackIllustration({
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
      aria-label="Playful hand-drawn colorful flying saucer trying to abduct an open book from the floor"
    >
      <defs>
        {/* UFO body silver gradient */}
        <linearGradient id="ufo_silver" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e0f7fa" />
          <stop offset="40%" stopColor="#b2ebf2" />
          <stop offset="100%" stopColor="#4fc3f7" />
        </linearGradient>

        {/* Tractor beam golden gradient */}
        <linearGradient id="ufo_tractorBeam" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fff3bf" stopOpacity="0.75" />
          <stop offset="30%" stopColor="#ffd43b" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#f59f00" stopOpacity="0.1" />
        </linearGradient>

        {/* Book cover & page gradients */}
        <linearGradient
          id="ufo_catalogCover"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#ff4b5c" />
          <stop offset="100%" stopColor="#cc0033" />
        </linearGradient>

        {/* Alien skin green */}
        <linearGradient id="ufo_alienGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a8f387" />
          <stop offset="100%" stopColor="#51cf66" />
        </linearGradient>
      </defs>

      {/* --- FLOOR GROUND LINE --- */}
      <path
        stroke="#101112"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.25"
        d="M 30,225 Q 128,232 226,225"
      />

      {/* --- UFO TRACTOR / ABDUCTION BEAM --- */}
      {/* Golden semi-transparent light cone */}
      <path
        d="M 104,71 L 52,216 Q 128,224 204,216 L 152,71 Z"
        fill="url(#ufo_tractorBeam)"
      />

      {/* Tractor beam dashed outer borders */}
      <path
        stroke="#ffd43b"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="6 8"
        opacity="0.6"
        d="M 104,71 L 52,216"
      />
      <path
        stroke="#ffd43b"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="6 8"
        opacity="0.6"
        d="M 152,71 L 204,216"
      />

      {/* Upward sucking tractor wave lines (Chevrons pointing UP in Gold) */}
      <path
        stroke="#ffd43b"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
        d="M 120,150 L 128,143 L 136,150"
      />
      <path
        stroke="#ffd43b"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
        d="M 117,110 L 128,103 L 139,110"
      />
      <path
        stroke="#ffd43b"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
        d="M 122,190 L 128,183 L 134,190"
      />

      {/* Floating/fluttering pages drifting up into the beam */}
      {/* Drifting Page 1 (Lower) */}
      <g transform="translate(0, 0)">
        {/* Shadow */}
        <path
          d="M 96,163 C 88,154 110,146 106,158 C 104,164 92,165 96,163 Z"
          fill="#101112"
          opacity="0.15"
        />
        {/* Page */}
        <path
          stroke="#101112"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="#ffffff"
          d="M 94,159 C 86,150 108,142 104,154 C 102,160 90,161 94,159 Z"
        />
        {/* Tiny line */}
        <path
          d="M 94,154 Q 98,150 101,153"
          stroke="#101112"
          strokeWidth="2"
          opacity="0.3"
        />
      </g>

      {/* Drifting Page 2 (Higher) */}
      <g transform="translate(10, -32)">
        {/* Shadow */}
        <path
          d="M 134,163 C 126,154 148,146 144,158 C 142,164 130,165 134,163 Z"
          fill="#101112"
          opacity="0.15"
        />
        {/* Page */}
        <path
          stroke="#101112"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="#ffffff"
          d="M 132,159 C 124,150 146,142 142,154 C 140,160 128,161 132,159 Z"
        />
        {/* Tiny line */}
        <path
          d="M 132,154 Q 136,150 139,153"
          stroke="#101112"
          strokeWidth="2"
          opacity="0.3"
        />
      </g>

      {/* --- THE OPEN BOOK (on the floor in Vellum & Red Cover) --- */}
      <g>
        {/* Left/Right Cover shadows on ground */}
        <path
          d="M 128,206 C 114,192 95,192 80,203 L 80,217 C 95,206 114,206 128,216 C 142,206 161,206 176,217 L 176,203 C 161,192 142,192 128,206 Z"
          fill="#990011"
        />
        {/* Book Spine cover underlay */}
        <path
          d="M 80,217 C 97,206 116,206 128,216 C 140,206 159,206 176,217"
          stroke="url(#ufo_catalogCover)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Open Pages */}
        {/* Left page fill */}
        <path
          fill="#fbf7ee"
          stroke="#101112"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M 128,202 C 114,186 92,186 66,202 L 66,212 C 92,196 114,196 128,212 Z"
        />
        {/* Right page fill */}
        <path
          fill="#fbf7ee"
          stroke="#101112"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M 128,202 C 142,186 164,186 190,202 L 190,212 C 164,196 142,196 128,212 Z"
        />

        {/* Center spine line */}
        <path
          stroke="#101112"
          strokeWidth="3.5"
          strokeLinecap="round"
          d="M 128,202 V 212"
        />

        {/* Book Text Marks */}
        <path
          stroke="#101112"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.35"
          d="M 80,201 H 108"
        />
        <path
          stroke="#101112"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.35"
          d="M 82,207 H 98"
        />
        <path
          stroke="#101112"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.35"
          d="M 148,201 H 176"
        />
        <path
          stroke="#101112"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.35"
          d="M 152,207 H 168"
        />
      </g>

      {/* --- THE RETRO HOVERING FLYING SAUCER (UFO) --- */}
      <g>
        {/* Glass cockpit dome background (Transparent Vellum) */}
        <path
          fill="#e0f7fa"
          fillOpacity="0.25"
          d="M 96,55 C 96,20 160,20 160,55 Z"
        />

        {/* Cute little alien head inside the dome */}
        <ellipse
          cx="128"
          cy="44"
          rx="9"
          ry="7.5"
          fill="url(#ufo_alienGrad)"
          stroke="#101112"
          strokeWidth="3.5"
        />
        {/* Alien shiny black eyes */}
        <ellipse cx="124.5" cy="43" rx="2" ry="3.5" fill="#101112" />
        <ellipse cx="131.5" cy="43" rx="2" ry="3.5" fill="#101112" />
        {/* Eye specular dots */}
        <circle cx="124" cy="41" r="0.8" fill="#ffffff" />
        <circle cx="131" cy="41" r="0.8" fill="#ffffff" />
        {/* Alien neck */}
        <path stroke="#101112" strokeWidth="3" d="M 128,49 V 54" />

        {/* Glass dome outline (Glowing Aqua Cyan) */}
        <path
          stroke="#00acc1"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M 96,55 C 96,20 160,20 160,55 Z"
        />

        {/* Outer Rim (The Saucer Ring) */}
        {/* Base Extrusion (Thick 3D bottom block) */}
        <path
          fill="#005662"
          d="M 60,65 Q 128,84 196,65 L 192,72 Q 128,91 64,72 Z"
        />
        {/* Rim Surface */}
        <path
          fill="url(#ufo_silver)"
          stroke="#101112"
          strokeWidth="5"
          d="M 60,65 Q 128,80 196,65 Q 128,50 60,65 Z"
        />

        {/* Lower under-saucer base metal block (Teal Cyan Extrusion) */}
        <path
          stroke="#101112"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="#006064"
          d="M 104,71 C 104,80 152,79 152,71 Z"
        />

        {/* Glowing Round Saucer Lights along the rim */}
        {/* Light 1: Red */}
        <circle
          cx="80"
          cy="64"
          r="3"
          fill="#ff4b5c"
          stroke="#101112"
          strokeWidth="2.5"
        />
        {/* Light 2: Gold */}
        <circle
          cx="104"
          cy="67"
          r="3"
          fill="#ffd43b"
          stroke="#101112"
          strokeWidth="2.5"
        />
        {/* Light 3: Green */}
        <circle
          cx="128"
          cy="68"
          r="3.5"
          fill="#20c997"
          stroke="#101112"
          strokeWidth="2.5"
        />
        {/* Light 4: Gold */}
        <circle
          cx="152"
          cy="67"
          r="3"
          fill="#ffd43b"
          stroke="#101112"
          strokeWidth="2.5"
        />
        {/* Light 5: Red */}
        <circle
          cx="176"
          cy="64"
          r="3"
          fill="#ff4b5c"
          stroke="#101112"
          strokeWidth="2.5"
        />
      </g>

      {/* --- COZY SPARKS & GLINTS --- */}
      <g>
        {/* Puffy white sparkle glints */}
        <path
          d="M 84,115 Q 84,119 88,119 Q 84,119 84,123 Q 84,119 80,119 Q 84,119 84,115 Z"
          fill="#ffffff"
        />
        <path
          d="M 174,130 Q 174,134 178,134 Q 174,134 174,138 Q 174,134 170,134 Q 174,134 174,130 Z"
          fill="#ffffff"
        />
        {/* Golden floating dust */}
        <circle
          cx="94"
          cy="165"
          r="2.5"
          fill="#f59f00"
          stroke="#101112"
          strokeWidth="1.5"
        />
        <circle cx="160" cy="115" r="2.2" fill="#ffd43b" />
      </g>
    </svg>
  );
}
