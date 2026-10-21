interface ReadingsStatIconProps {
  size?: number;
  className?: string;
}

export function ReadingsStatIcon({
  size = 16,
  className,
}: ReadingsStatIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="4" width="5" height="17" rx="1" fill="var(--brick)" />
      <rect x="9" y="4" width="5" height="17" rx="1" fill="var(--ink-3)" />
      <g transform="rotate(-15 14 4.6)">
        <rect x="14" y="4.6" width="5" height="17" rx="1" fill="var(--gold)" />
      </g>
    </svg>
  );
}
