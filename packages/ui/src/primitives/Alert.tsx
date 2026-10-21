import { type HTMLAttributes, type ReactNode } from 'react';

import { classNames } from '../className';

export type AlertVariant = 'error' | 'info' | 'success' | 'warning';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant: AlertVariant;
}

export function Alert({
  children,
  className = '',
  variant,
  ...props
}: AlertProps) {
  return (
    <div
      role="alert"
      className={classNames('vui-alert', `vui-alert--${variant}`, className)}
      {...props}
    >
      {children}
    </div>
  );
}
