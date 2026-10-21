import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type AppPropertyClickableValueProps = {
  children: ReactNode;
  onClick: () => void;
  ariaLabel?: string;
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>;

export function AppPropertyClickableValue({
  children,
  onClick,
  ariaLabel,
  className = '',
}: AppPropertyClickableValueProps) {
  return (
    <button
      aria-label={ariaLabel}
      className={[
        'group inline-flex items-center gap-1.5 rounded px-1 py-0.5 text-left text-brick transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brick',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      type="button"
      onClick={onClick}
    >
      <span className="text-app-label font-medium">{children}</span>
    </button>
  );
}
