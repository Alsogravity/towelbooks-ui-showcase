import type { IllustrationProps } from './svgBase';

/**
 * Curated catalog — an open book with a chunky magnifying glass revealing a
 * glowing star, in the playful filled 3D illustration style.
 */
export function CatalogIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 256 256"
      aria-hidden="true"
      className={[className, 'overflow-visible'].filter(Boolean).join(' ')}
    >
      <defs>
        <linearGradient id="cat_cover" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffdf99" />
          <stop offset="100%" stopColor="#d29a3e" />
        </linearGradient>
        <linearGradient id="cat_coral" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff8a70" />
          <stop offset="100%" stopColor="#e1402b" />
        </linearGradient>
        <linearGradient id="cat_star" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff3bf" />
          <stop offset="50%" stopColor="#ffd43b" />
          <stop offset="100%" stopColor="#f59f00" />
        </linearGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="128" cy="208" rx="92" ry="13" fill="#101112" opacity="0.1" />

      {/* Open book */}
      <g>
        <path
          d="M128 170 C104 154 70 153 44 170 V202 C70 186 104 187 128 203 C152 187 186 186 212 202 V170 Z"
          fill="#b9802e"
        />
        <path
          d="M128 164 C104 148 70 147 44 164 V198 C70 182 104 183 128 199 C152 183 186 182 212 198 V164 Z"
          fill="url(#cat_cover)"
          stroke="#101112"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <path
          d="M128 160 C106 144 76 144 50 158 L50 192 C76 178 106 178 128 194 Z"
          fill="#fbf7ee"
          stroke="#101112"
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        <path
          d="M128 160 C150 144 180 144 206 158 L206 192 C180 178 150 178 128 194 Z"
          fill="#fbf7ee"
          stroke="#101112"
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        <path d="M128 160 L128 194" stroke="#101112" strokeWidth="4" />
        <path
          d="M64 164 H104"
          stroke="#101112"
          strokeWidth="3.2"
          strokeLinecap="round"
          opacity="0.3"
        />
        <path
          d="M62 174 H102"
          stroke="#101112"
          strokeWidth="3.2"
          strokeLinecap="round"
          opacity="0.3"
        />
      </g>

      {/* Magnifying glass */}
      <g>
        {/* Handle */}
        <line
          x1="170"
          y1="106"
          x2="198"
          y2="138"
          stroke="#101112"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <line
          x1="170"
          y1="106"
          x2="198"
          y2="138"
          stroke="url(#cat_coral)"
          strokeWidth="11"
          strokeLinecap="round"
        />
        {/* Rim */}
        <circle cx="150" cy="86" r="40" fill="#101112" />
        <circle cx="150" cy="86" r="37" fill="url(#cat_coral)" />
        {/* Glass */}
        <circle
          cx="150"
          cy="86"
          r="29"
          fill="#d3f0ff"
          stroke="#101112"
          strokeWidth="4"
        />
        {/* Star inside */}
        <path
          d="M150 68 L154 80 L167 80 L156 88 L160 101 L150 93 L140 101 L144 88 L133 80 L146 80 Z"
          fill="url(#cat_star)"
          stroke="#101112"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Glass shine */}
        <path
          d="M132 78 Q130 88 136 96"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
      </g>

      {/* Sparkles */}
      <path
        d="M72 70 Q72 76 78 76 Q72 76 72 82 Q72 76 66 76 Q72 76 72 70 Z"
        fill="#ffd43b"
        stroke="#101112"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M204 92 Q204 96 208 96 Q204 96 204 100 Q204 96 200 96 Q204 96 204 92 Z"
        fill="#ffffff"
      />
      <circle
        cx="80"
        cy="120"
        r="3.2"
        fill="#ff8a70"
        stroke="#101112"
        strokeWidth="1.5"
      />
    </svg>
  );
}
