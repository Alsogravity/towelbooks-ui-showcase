import type { IllustrationProps } from './svgBase';

/**
 * Chapter reflections — a cozy open book with a chunky feather quill writing a
 * sparkling trail of thoughts under a crescent moon, in the playful filled 3D
 * illustration style.
 */
export function ReflectionsIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 256 256"
      aria-hidden="true"
      className={[className, 'overflow-visible'].filter(Boolean).join(' ')}
    >
      <defs>
        <linearGradient id="ref_cover" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#69d39c" />
          <stop offset="100%" stopColor="#2f9e6b" />
        </linearGradient>
        <linearGradient id="ref_feather" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffb3a0" />
          <stop offset="100%" stopColor="#e1402b" />
        </linearGradient>
        <linearGradient id="ref_moon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffe9a8" />
          <stop offset="100%" stopColor="#e7b13c" />
        </linearGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="128" cy="206" rx="92" ry="13" fill="#101112" opacity="0.1" />

      {/* Crescent moon */}
      <path
        d="M58 44 A30 30 0 1 0 96 82 A23 23 0 1 1 58 44 Z"
        fill="url(#ref_moon)"
        stroke="#101112"
        strokeWidth="5"
        strokeLinejoin="round"
      />

      {/* Open book */}
      <g>
        {/* Cover extrusion */}
        <path
          d="M128 168 C104 152 70 151 44 168 V200 C70 184 104 185 128 201 C152 185 186 184 212 200 V168 Z"
          fill="#1f8a59"
        />
        {/* Cover */}
        <path
          d="M128 162 C104 146 70 145 44 162 V196 C70 180 104 181 128 197 C152 181 186 180 212 196 V162 Z"
          fill="url(#ref_cover)"
          stroke="#101112"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        {/* Pages */}
        <path
          d="M128 158 C106 142 76 142 50 156 L50 190 C76 176 106 176 128 192 Z"
          fill="#fbf7ee"
          stroke="#101112"
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        <path
          d="M128 158 C150 142 180 142 206 156 L206 190 C180 176 150 176 128 192 Z"
          fill="#fbf7ee"
          stroke="#101112"
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        <path d="M128 158 L128 192" stroke="#101112" strokeWidth="4" />
        {/* Text lines (left page) */}
        <path
          d="M64 162 H106"
          stroke="#101112"
          strokeWidth="3.2"
          strokeLinecap="round"
          opacity="0.3"
        />
        <path
          d="M62 172 H104"
          stroke="#101112"
          strokeWidth="3.2"
          strokeLinecap="round"
          opacity="0.3"
        />
        <path
          d="M64 182 H100"
          stroke="#101112"
          strokeWidth="3.2"
          strokeLinecap="round"
          opacity="0.3"
        />
      </g>

      {/* Feather quill */}
      <g transform="translate(150 96) rotate(36)">
        <path
          d="M0 -72 C20 -50 20 -8 9 20 L0 30 L-9 20 C-20 -8 -20 -50 0 -72 Z"
          fill="url(#ref_feather)"
          stroke="#101112"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        {/* Spine */}
        <path
          d="M0 -66 L0 56"
          stroke="#101112"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Barbs */}
        <path
          d="M0 -44 L-12 -36 M0 -44 L12 -36"
          stroke="#101112"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.55"
        />
        <path
          d="M0 -22 L-14 -12 M0 -22 L14 -12"
          stroke="#101112"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.55"
        />
        <path
          d="M0 0 L-12 10 M0 0 L12 10"
          stroke="#101112"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.55"
        />
        {/* Nib */}
        <path d="M-5 30 L0 56 L5 30 Z" fill="#101112" />
      </g>

      {/* Sparkling ink trail */}
      <circle
        cx="104"
        cy="150"
        r="3.2"
        fill="#ffd43b"
        stroke="#101112"
        strokeWidth="1.5"
      />
      <circle
        cx="92"
        cy="138"
        r="2.6"
        fill="#ffd43b"
        stroke="#101112"
        strokeWidth="1.5"
      />
      <path
        d="M84 126 Q84 130 88 130 Q84 130 84 134 Q84 130 80 130 Q84 130 84 126 Z"
        fill="#ffffff"
      />

      {/* Stars */}
      <path
        d="M196 56 L200 66 L210 67 L202 74 L205 84 L196 79 L187 84 L190 74 L182 67 L192 66 Z"
        fill="#ffd43b"
        stroke="#101112"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M168 40 Q168 45 173 45 Q168 45 168 50 Q168 45 163 45 Q168 45 168 40 Z"
        fill="#ffffff"
      />
    </svg>
  );
}
