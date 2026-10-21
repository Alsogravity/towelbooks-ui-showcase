import {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

import { classNames } from '../className';

export type LiquidActionGroupState = 'joined' | 'separated';
export type LiquidActionGroupSurfaceVariant = 'control' | 'primary';

export interface LiquidActionGroupProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  children: ReactNode;
  state?: LiquidActionGroupState;
}

interface LiquidActionGroupSurfaceOptions {
  state?: LiquidActionGroupState;
  variant?: LiquidActionGroupSurfaceVariant;
}

export interface LiquidActionGroupSurfaceProps
  extends HTMLAttributes<HTMLDivElement>, LiquidActionGroupSurfaceOptions {}

export interface LiquidActionGroupButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    LiquidActionGroupSurfaceOptions {}

function liquidActionSurfaceClassName({
  className = '',
  variant = 'primary',
}: {
  className?: string;
  variant?: LiquidActionGroupSurfaceVariant;
}) {
  return classNames(
    'vui-liquid-action-group__surface',
    `vui-liquid-action-group__surface--${variant}`,
    className,
  );
}

export const LiquidActionGroup = forwardRef<
  HTMLDivElement,
  LiquidActionGroupProps
>(function LiquidActionGroup(
  { className = '', state = 'joined', ...props },
  ref,
) {
  return (
    <div
      {...props}
      ref={ref}
      className={classNames('vui-liquid-action-group', className)}
      data-state={state}
    />
  );
});

export const LiquidActionGroupSurface = forwardRef<
  HTMLDivElement,
  LiquidActionGroupSurfaceProps
>(function LiquidActionGroupSurface(
  { className = '', state = 'joined', variant = 'primary', ...props },
  ref,
) {
  return (
    <div
      {...props}
      ref={ref}
      className={liquidActionSurfaceClassName({ className, variant })}
      data-state={state}
    />
  );
});

export const LiquidActionGroupButton = forwardRef<
  HTMLButtonElement,
  LiquidActionGroupButtonProps
>(function LiquidActionGroupButton(
  { className = '', state = 'joined', variant = 'control', ...props },
  ref,
) {
  return (
    <button
      {...props}
      ref={ref}
      className={liquidActionSurfaceClassName({ className, variant })}
      data-state={state}
    />
  );
});
