import type { IllustrationProps } from './svgBase';

/**
 * Reading rooms — three friendly characters (bunny, owl, bear) huddled together
 * under a heart speech bubble, in the playful filled 3D illustration style.
 */
export function RoomsIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 256 256"
      aria-hidden="true"
      className={[className, 'overflow-visible'].filter(Boolean).join(' ')}
    >
      <defs>
        <linearGradient id="room_bunny" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffb3ba" />
          <stop offset="100%" stopColor="#ff7d8a" />
        </linearGradient>
        <linearGradient id="room_owl" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#b9a3ff" />
          <stop offset="100%" stopColor="#7c6bf0" />
        </linearGradient>
        <linearGradient id="room_bear" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#69d39c" />
          <stop offset="100%" stopColor="#2f9e6b" />
        </linearGradient>
        <linearGradient id="room_heart" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff7a93" />
          <stop offset="100%" stopColor="#e5294f" />
        </linearGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="128" cy="212" rx="98" ry="14" fill="#101112" opacity="0.1" />

      {/* LEFT — Bunny */}
      <g>
        {/* Ears */}
        <path
          d="M62 150 C46 100 70 96 72 142"
          fill="url(#room_bunny)"
          stroke="#101112"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <path
          d="M86 150 C100 100 78 96 78 142"
          fill="url(#room_bunny)"
          stroke="#101112"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        {/* Head */}
        <circle
          cx="74"
          cy="160"
          r="30"
          fill="url(#room_bunny)"
          stroke="#101112"
          strokeWidth="5.5"
        />
        {/* Glasses */}
        <circle
          cx="65"
          cy="157"
          r="10"
          fill="none"
          stroke="#101112"
          strokeWidth="4"
        />
        <circle
          cx="85"
          cy="157"
          r="10"
          fill="none"
          stroke="#101112"
          strokeWidth="4"
        />
        <line
          x1="74"
          y1="157"
          x2="76"
          y2="157"
          stroke="#101112"
          strokeWidth="4.5"
        />
        {/* Happy eyes */}
        <path
          d="M61 158 Q65 154 69 158"
          stroke="#101112"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M81 158 Q85 154 89 158"
          stroke="#101112"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Cheeks + nose + smile */}
        <ellipse cx="56" cy="167" rx="4" ry="2" fill="#e5294f" opacity="0.3" />
        <ellipse cx="92" cy="167" rx="4" ry="2" fill="#e5294f" opacity="0.3" />
        <path
          d="M70 168 Q74 173 78 168 Z"
          fill="#e5294f"
          stroke="#101112"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </g>

      {/* RIGHT — Bear with beanie */}
      <g>
        {/* Ears */}
        <circle
          cx="164"
          cy="142"
          r="11"
          fill="url(#room_bear)"
          stroke="#101112"
          strokeWidth="5"
        />
        <circle
          cx="200"
          cy="142"
          r="11"
          fill="url(#room_bear)"
          stroke="#101112"
          strokeWidth="5"
        />
        {/* Head */}
        <circle
          cx="182"
          cy="160"
          r="30"
          fill="url(#room_bear)"
          stroke="#101112"
          strokeWidth="5.5"
        />
        {/* Beanie */}
        <path
          d="M158 150 C158 122 206 122 206 150 Z"
          fill="#ffd43b"
          stroke="#101112"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <circle
          cx="182"
          cy="120"
          r="7"
          fill="#f59f00"
          stroke="#101112"
          strokeWidth="4.5"
        />
        {/* Face */}
        <circle cx="172" cy="157" r="3.2" fill="#101112" />
        <circle cx="192" cy="157" r="3.2" fill="#101112" />
        <path
          d="M176 165 Q182 171 188 165 Z"
          fill="#ffffff"
          stroke="#101112"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <ellipse
          cx="166"
          cy="163"
          rx="3.5"
          ry="2"
          fill="#ffd43b"
          opacity="0.5"
        />
        <ellipse
          cx="198"
          cy="163"
          rx="3.5"
          ry="2"
          fill="#ffd43b"
          opacity="0.5"
        />
      </g>

      {/* CENTER — Owl (front) */}
      <g>
        {/* Ear tufts */}
        <polygon
          points="106,126 117,108 124,122"
          fill="#7c6bf0"
          stroke="#101112"
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        <polygon
          points="150,126 139,108 132,122"
          fill="#7c6bf0"
          stroke="#101112"
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        {/* Head */}
        <circle
          cx="128"
          cy="158"
          r="36"
          fill="url(#room_owl)"
          stroke="#101112"
          strokeWidth="5.5"
        />
        {/* Eyes */}
        <circle
          cx="114"
          cy="152"
          r="13"
          fill="#ffffff"
          stroke="#101112"
          strokeWidth="4.5"
        />
        <circle
          cx="142"
          cy="152"
          r="13"
          fill="#ffffff"
          stroke="#101112"
          strokeWidth="4.5"
        />
        <circle cx="114" cy="153" r="6" fill="#101112" />
        <circle cx="142" cy="153" r="6" fill="#101112" />
        <circle cx="116" cy="150" r="2" fill="#ffffff" />
        <circle cx="144" cy="150" r="2" fill="#ffffff" />
        {/* Beak */}
        <polygon
          points="123,162 133,162 128,171"
          fill="#f59f00"
          stroke="#101112"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Chest feathers */}
        <path
          d="M120 180 Q124 184 128 180"
          stroke="#101112"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M124 186 Q128 190 132 186"
          stroke="#101112"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Heart speech bubble */}
      <g>
        <rect
          x="98"
          y="40"
          width="60"
          height="44"
          rx="16"
          fill="#ffffff"
          stroke="#101112"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <path
          d="M120 82 L126 96 L134 82 Z"
          fill="#ffffff"
          stroke="#101112"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <path
          d="M128 52 C123 45 112 46 112 55 C112 62 125 70 128 71 C131 70 144 62 144 55 C144 46 133 45 128 52 Z"
          fill="url(#room_heart)"
          stroke="#101112"
          strokeWidth="4"
          strokeLinejoin="round"
        />
      </g>

      {/* Sparkles */}
      <path
        d="M70 86 Q70 91 75 91 Q70 91 70 96 Q70 91 65 91 Q70 91 70 86 Z"
        fill="#ffd43b"
        stroke="#101112"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M186 96 Q186 100 190 100 Q186 100 186 104 Q186 100 182 100 Q186 100 186 96 Z"
        fill="#ffffff"
      />
    </svg>
  );
}
