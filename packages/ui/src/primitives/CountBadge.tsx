import { classNames } from '../className';

export interface CountBadgeProps {
  count?: number | null;
  max?: number;
  className?: string;
}

const DEFAULT_MAX = 9;

export function formatCountBadgeLabel(
  count: number | null | undefined,
  max: number = DEFAULT_MAX,
): string | null {
  if (count == null || !Number.isFinite(count) || count <= 0) {
    return null;
  }

  const normalized = Math.floor(count);

  if (normalized <= max) {
    return String(normalized);
  }

  return `${max}+`;
}

export function CountBadge({
  count,
  max = DEFAULT_MAX,
  className = '',
}: CountBadgeProps) {
  const label = formatCountBadgeLabel(count, max);

  if (label === null) {
    return null;
  }

  return (
    <span
      aria-hidden="true"
      className={classNames('vui-count-badge', className)}
    >
      {label}
    </span>
  );
}
