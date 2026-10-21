/**
 * Renders text with each letter cycling through a playful palette that echoes
 * the colorful reading-room illustration. The visible letters are decorative
 * (`aria-hidden`); the full string is exposed once to assistive tech.
 */

const PLAYFUL_COLORS = [
  '#df4f2c', // coral
  '#c98412', // gold
  '#15827a', // jade
  '#3f8fbf', // blue
  '#e0628a', // sakura pink
  '#d62828', // lantern red
] as const;

export function PlayfulText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  let letterIndex = 0;

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {Array.from(text).map((char, index) => {
          if (char === ' ') {
            return <span key={index}>{'\u00A0'}</span>;
          }

          const color = PLAYFUL_COLORS[letterIndex % PLAYFUL_COLORS.length];
          const tilt = letterIndex % 2 === 0 ? -3 : 3;
          letterIndex += 1;

          return (
            <span
              key={index}
              style={{
                color,
                display: 'inline-block',
                transform: `rotate(${tilt}deg)`,
              }}
            >
              {char}
            </span>
          );
        })}
      </span>
    </span>
  );
}
