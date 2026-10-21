import { type HTMLAttributes } from 'react';

import { classNames } from '../className';

export type CardVariant = 'base' | 'bookplate' | 'spine';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  padding?: boolean;
  variant?: CardVariant;
}

export function Card({
  children,
  className = '',
  interactive = false,
  padding = true,
  variant = 'base',
  ...props
}: CardProps) {
  return (
    <div
      className={classNames(
        'vui-card',
        `vui-card--${variant}`,
        padding && 'vui-card--padded',
        interactive && 'vui-card--interactive',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
