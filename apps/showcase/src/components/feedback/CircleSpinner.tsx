import type { CSSProperties } from 'react';

export type CircleSpinnerSize = 'sm' | 'md' | 'lg';

type CircleSpinnerProps = {
  className?: string;
  /** Accessible name for standalone loading indicators. Omit when decorative. */
  label?: string;
  size?: CircleSpinnerSize;
};

const SPINNER_SIZE_PX: Record<CircleSpinnerSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

export function CircleSpinner({
  className = '',
  label,
  size = 'md',
}: CircleSpinnerProps) {
  const dimension = SPINNER_SIZE_PX[size];
  const style = {
    height: `${dimension}px`,
    width: `${dimension}px`,
  } satisfies CSSProperties;

  const spinner = (
    <span
      aria-hidden="true"
      className={['app-circle-spinner', 'vui-button__spinner', className]
        .filter(Boolean)
        .join(' ')}
      style={style}
    />
  );

  if (!label) {
    return spinner;
  }

  return (
    <span
      aria-label={label}
      aria-live="polite"
      className="inline-flex"
      role="status"
    >
      {spinner}
    </span>
  );
}
