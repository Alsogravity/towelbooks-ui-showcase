import type { IllustrationProps } from './svgBase';

/**
 * Find & buy — a cheerful shopping bag with a book popping out and a price tag,
 * in the playful filled 3D illustration style.
 */
export function BuyIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 256 256"
      aria-hidden="true"
      className={[className, 'overflow-visible'].filter(Boolean).join(' ')}
    >
      <defs>
        <linearGradient id="buy_bag" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff8a70" />
          <stop offset="100%" stopColor="#e1402b" />
        </linearGradient>
        <linearGradient id="buy_book" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#69d39c" />
          <stop offset="100%" stopColor="#2f9e6b" />
        </linearGradient>
        <linearGradient id="buy_tag" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffdf99" />
          <stop offset="100%" stopColor="#e7a92f" />
        </linearGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="128" cy="212" rx="80" ry="13" fill="#101112" opacity="0.1" />

      {/* Book popping out (behind bag, peeking) */}
      <g transform="rotate(-8 128 100)">
        <rect
          x="110"
          y="70"
          width="36"
          height="58"
          rx="5"
          fill="#fbf7ee"
          stroke="#101112"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <rect
          x="106"
          y="66"
          width="36"
          height="58"
          rx="5"
          fill="url(#buy_book)"
          stroke="#101112"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <path
          d="M112 66 L112 124"
          stroke="#101112"
          strokeWidth="3.5"
          opacity="0.4"
        />
        <rect x="118" y="80" width="18" height="4" rx="2" fill="#fff3bf" />
      </g>

      {/* Shopping bag */}
      <g>
        {/* Body */}
        <path
          d="M82 118 L174 118 L182 192 Q183 200 175 200 L81 200 Q73 200 74 192 Z"
          fill="url(#buy_bag)"
          stroke="#101112"
          strokeWidth="5.5"
          strokeLinejoin="round"
        />
        {/* Inner top shadow */}
        <path
          d="M84 120 Q128 134 172 120 L170 128 Q128 140 86 128 Z"
          fill="#a82817"
        />
        {/* Handles */}
        <path
          d="M96 122 C92 88 122 88 120 122"
          fill="none"
          stroke="#101112"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M136 122 C134 88 164 88 160 122"
          fill="none"
          stroke="#101112"
          strokeWidth="7"
          strokeLinecap="round"
        />
        {/* Heart emblem */}
        <path
          d="M128 152 C123 145 112 146 112 155 C112 163 125 171 128 173 C131 171 144 163 144 155 C144 146 133 145 128 152 Z"
          fill="#fff3bf"
          stroke="#101112"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {/* Sheen */}
        <path
          d="M92 150 Q88 170 96 188"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.45"
        />
      </g>

      {/* Price tag */}
      <g transform="rotate(18 196 96)">
        <path
          d="M178 84 L200 84 L214 98 L196 116 L178 116 Z"
          fill="url(#buy_tag)"
          stroke="#101112"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <circle
          cx="188"
          cy="94"
          r="4.5"
          fill="#fbf7ee"
          stroke="#101112"
          strokeWidth="3"
        />
        <path
          d="M178 84 L168 74"
          stroke="#101112"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <path
          d="M196 100 Q196 105 201 105 Q196 105 196 110 Q196 105 191 105 Q196 105 196 100 Z"
          fill="#ffffff"
        />
      </g>

      {/* Sparkles */}
      <path
        d="M60 96 Q60 102 66 102 Q60 102 60 108 Q60 102 54 102 Q60 102 60 96 Z"
        fill="#ffd43b"
        stroke="#101112"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle
        cx="66"
        cy="150"
        r="3.2"
        fill="#ff8a70"
        stroke="#101112"
        strokeWidth="1.5"
      />
    </svg>
  );
}
