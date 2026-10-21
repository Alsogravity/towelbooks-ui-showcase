import type { HTMLAttributes, ReactNode } from 'react';

interface ActionPillProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  children: ReactNode;
}

export function ActionPill({
  children,
  className = '',
  style: _style,
  ...rest
}: ActionPillProps) {
  return (
    <div
      {...rest}
      className={`app-action-pill inline-flex items-center gap-1.5 rounded-full border border-night-fg/15 bg-night p-1 shadow-2 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
