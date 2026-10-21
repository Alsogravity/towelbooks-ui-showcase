import type { IllustrationProps } from './svgBase';

/**
 * Personal libraries — a cheerful, chunky stack of lying books topped with a
 * little heart, rendered in the playful filled 3D style shared with the
 * dashboard illustrations.
 */
export function LibrariesIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 256 256"
      aria-hidden="true"
      className={[className, 'overflow-visible'].filter(Boolean).join(' ')}
    >
      <defs>
        <linearGradient id="lib_coral" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff8a70" />
          <stop offset="100%" stopColor="#e1402b" />
        </linearGradient>
        <linearGradient id="lib_gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffdf99" />
          <stop offset="100%" stopColor="#d29a3e" />
        </linearGradient>
        <linearGradient id="lib_green" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#69d39c" />
          <stop offset="100%" stopColor="#2f9e6b" />
        </linearGradient>
        <linearGradient id="lib_blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#b9a3ff" />
          <stop offset="100%" stopColor="#7c6bf0" />
        </linearGradient>
        <linearGradient id="lib_heart" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff7a93" />
          <stop offset="100%" stopColor="#e5294f" />
        </linearGradient>
      </defs>

      {/* Soft ground shadow */}
      <ellipse cx="128" cy="212" rx="92" ry="14" fill="#101112" opacity="0.1" />

      {/* Book 1 — coral (bottom) */}
      <g>
        <rect
          x="38"
          y="184"
          width="180"
          height="16"
          rx="5"
          fill="#fbf7ee"
          stroke="#101112"
          strokeWidth="5"
        />
        <rect
          x="38"
          y="168"
          width="180"
          height="20"
          rx="7"
          fill="url(#lib_coral)"
          stroke="#101112"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <line
          x1="52"
          y1="192"
          x2="204"
          y2="192"
          stroke="#101112"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.3"
        />
        <circle
          cx="196"
          cy="178"
          r="4"
          fill="#fff3bf"
          stroke="#101112"
          strokeWidth="2.5"
        />
      </g>

      {/* Book 2 — gold */}
      <g transform="rotate(-2 128 152)">
        <rect
          x="50"
          y="156"
          width="158"
          height="14"
          rx="5"
          fill="#fbf7ee"
          stroke="#101112"
          strokeWidth="5"
        />
        <rect
          x="50"
          y="142"
          width="158"
          height="18"
          rx="6"
          fill="url(#lib_gold)"
          stroke="#101112"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <circle
          cx="64"
          cy="151"
          r="4"
          fill="#fbf7ee"
          stroke="#101112"
          strokeWidth="2.5"
        />
      </g>

      {/* Book 3 — green */}
      <g transform="rotate(2 128 126)">
        <rect
          x="62"
          y="130"
          width="136"
          height="13"
          rx="5"
          fill="#fbf7ee"
          stroke="#101112"
          strokeWidth="5"
        />
        <rect
          x="62"
          y="116"
          width="136"
          height="18"
          rx="6"
          fill="url(#lib_green)"
          stroke="#101112"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <line
          x1="74"
          y1="125"
          x2="110"
          y2="125"
          stroke="#101112"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.35"
        />
      </g>

      {/* Book 4 — blue (top) */}
      <g transform="rotate(-3 128 100)">
        <rect
          x="78"
          y="104"
          width="112"
          height="12"
          rx="4"
          fill="#fbf7ee"
          stroke="#101112"
          strokeWidth="5"
        />
        <rect
          x="78"
          y="90"
          width="112"
          height="18"
          rx="6"
          fill="url(#lib_blue)"
          stroke="#101112"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <circle
          cx="92"
          cy="99"
          r="4"
          fill="#fff3bf"
          stroke="#101112"
          strokeWidth="2.5"
        />
      </g>

      {/* Chunky heart floating on top */}
      <path
        d="M128 44 C120 30 100 32 100 50 C100 64 124 78 128 80 C132 78 156 64 156 50 C156 32 136 30 128 44 Z"
        fill="url(#lib_heart)"
        stroke="#101112"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M114 48 C113 42 118 40 122 44"
        stroke="#ffffff"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />

      {/* Sparkles + rays */}
      <path
        d="M62 70 Q62 76 68 76 Q62 76 62 82 Q62 76 56 76 Q62 76 62 70 Z"
        fill="#ffd43b"
        stroke="#101112"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M192 58 Q192 63 197 63 Q192 63 192 68 Q192 63 187 63 Q192 63 192 58 Z"
        fill="#ffffff"
      />
      <path
        d="M180 96 L188 88"
        stroke="#ffd43b"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle
        cx="74"
        cy="104"
        r="3.5"
        fill="#ff8a70"
        stroke="#101112"
        strokeWidth="1.5"
      />
    </svg>
  );
}
