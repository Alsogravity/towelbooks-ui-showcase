interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  height?: number | string;
  width?: number | string;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  color = 'var(--forest)',
  height = 4,
  width = '100%',
  className = '',
}: ProgressBarProps) {
  const safeMax = max > 0 ? max : 100;
  const normalizedValue = Math.max(0, Math.min(safeMax, value));
  const sizeClassName =
    typeof height === 'number' && height <= 2
      ? 'app-progress--sm'
      : typeof height === 'number' && height <= 3
        ? 'app-progress--xs'
        : 'app-progress--md';
  const toneClassName =
    color === 'bg-rule' || color === 'var(--rule)'
      ? 'app-progress--rule'
      : color === 'bg-brick' || color === 'var(--brick)'
        ? 'app-progress--brick'
        : 'app-progress--forest';

  void width;

  return (
    <progress
      className={`app-progress ${sizeClassName} ${toneClassName} w-full ${className}`.trim()}
      max={safeMax}
      value={normalizedValue}
      aria-valuemax={safeMax}
      aria-valuemin={0}
      aria-valuenow={normalizedValue}
    />
  );
}
