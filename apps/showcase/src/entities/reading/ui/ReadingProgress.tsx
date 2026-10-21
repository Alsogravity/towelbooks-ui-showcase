interface ReadingProgressProps {
  className?: string;
  label?: string;
  value?: number;
  max?: number;
  height?: number | string;
  color?: string;
}

export function ReadingProgress({
  className = '',
  label,
  value = 0,
  max = 100,
  height = 4,
  color = 'text-forest',
}: ReadingProgressProps) {
  const safeMax = max > 0 ? max : 100;
  const normalizedValue = Math.max(0, Math.min(safeMax, value));
  const sizeClassName =
    typeof height === 'number' && height <= 2
      ? 'app-progress--sm'
      : typeof height === 'number' && height <= 3
        ? 'app-progress--xs'
        : 'app-progress--md';
  const toneClassName =
    color === 'bg-rule' ? 'app-progress--rule' : 'app-progress--forest';

  return (
    <div className={className}>
      {label && (
        <div className="mb-1 font-display text-xs italic text-ink-3">
          {label}
        </div>
      )}
      <progress
        className={`app-progress ${sizeClassName} ${toneClassName} w-full`.trim()}
        role="progressbar"
        max={safeMax}
        value={normalizedValue}
        aria-valuemax={max}
        aria-valuemin={0}
        aria-valuenow={normalizedValue}
      />
    </div>
  );
}
