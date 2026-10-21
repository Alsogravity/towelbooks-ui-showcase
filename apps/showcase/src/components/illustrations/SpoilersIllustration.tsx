import type { IllustrationProps } from './svgBase';

/**
 * Spoiler-aware discussion — a closed book guarded by a friendly chunky padlock
 * with a floating key, in the playful filled 3D illustration style.
 */
export function SpoilersIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 256 256"
      aria-hidden="true"
      className={[className, 'overflow-visible'].filter(Boolean).join(' ')}
    >
      <defs>
        <linearGradient id="spo_cover" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8fa6ff" />
          <stop offset="100%" stopColor="#5566e0" />
        </linearGradient>
        <linearGradient id="spo_lock" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffdf99" />
          <stop offset="100%" stopColor="#e7a92f" />
        </linearGradient>
        <linearGradient id="spo_key" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff8a70" />
          <stop offset="100%" stopColor="#e1402b" />
        </linearGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="124" cy="210" rx="84" ry="13" fill="#101112" opacity="0.1" />

      {/* Closed book */}
      <g transform="rotate(-6 124 128)">
        {/* Page block */}
        <rect
          x="96"
          y="62"
          width="80"
          height="124"
          rx="8"
          fill="#fbf7ee"
          stroke="#101112"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        {/* Cover */}
        <rect
          x="80"
          y="56"
          width="84"
          height="128"
          rx="10"
          fill="url(#spo_cover)"
          stroke="#101112"
          strokeWidth="5.5"
          strokeLinejoin="round"
        />
        {/* Spine */}
        <path
          d="M92 56 L92 184"
          stroke="#101112"
          strokeWidth="4"
          opacity="0.45"
        />
        {/* Title plate */}
        <rect
          x="104"
          y="74"
          width="46"
          height="20"
          rx="6"
          fill="#fff3bf"
          stroke="#101112"
          strokeWidth="3.5"
        />
      </g>

      {/* Padlock */}
      <g>
        {/* Shackle */}
        <path
          d="M108 150 V134 A20 20 0 0 1 148 134 V150"
          fill="none"
          stroke="#101112"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M108 150 V134 A20 20 0 0 1 148 134 V150"
          fill="none"
          stroke="#c7cdd6"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Body */}
        <rect
          x="98"
          y="146"
          width="60"
          height="50"
          rx="12"
          fill="url(#spo_lock)"
          stroke="#101112"
          strokeWidth="5.5"
          strokeLinejoin="round"
        />
        {/* Keyhole */}
        <circle cx="128" cy="166" r="6" fill="#101112" />
        <path d="M125 170 L131 170 L133 184 L123 184 Z" fill="#101112" />
        {/* Sheen */}
        <path
          d="M108 154 Q106 162 110 168"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
      </g>

      {/* Floating key */}
      <g transform="rotate(20 196 76)">
        <circle
          cx="196"
          cy="68"
          r="13"
          fill="url(#spo_key)"
          stroke="#101112"
          strokeWidth="5"
        />
        <circle
          cx="196"
          cy="68"
          r="5"
          fill="#fbf7ee"
          stroke="#101112"
          strokeWidth="3"
        />
        <rect
          x="192"
          y="80"
          width="8"
          height="34"
          rx="3"
          fill="url(#spo_key)"
          stroke="#101112"
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        <rect
          x="200"
          y="100"
          width="9"
          height="7"
          rx="2"
          fill="url(#spo_key)"
          stroke="#101112"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <rect
          x="200"
          y="108"
          width="6"
          height="6"
          rx="2"
          fill="url(#spo_key)"
          stroke="#101112"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
      </g>

      {/* Sparkles */}
      <path
        d="M58 70 Q58 76 64 76 Q58 76 58 82 Q58 76 52 76 Q58 76 58 70 Z"
        fill="#ffd43b"
        stroke="#101112"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M64 150 Q64 154 68 154 Q64 154 64 158 Q64 154 60 154 Q64 154 64 150 Z"
        fill="#ffffff"
      />
    </svg>
  );
}
