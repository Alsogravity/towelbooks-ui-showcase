import type { ReactNode } from 'react';

export type AppActionGroupProps = {
  children: ReactNode;
  className?: string;
};

export function AppActionGroup({
  children,
  className = '',
}: AppActionGroupProps) {
  return (
    <div
      className={['flex flex-wrap gap-2', className].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  );
}
