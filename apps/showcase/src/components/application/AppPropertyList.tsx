import type { ReactNode } from 'react';

export type AppPropertyListProps = {
  children: ReactNode;
  className?: string;
};

export function AppPropertyList({
  children,
  className = '',
}: AppPropertyListProps) {
  return (
    <dl className={`divide-y divide-rule text-sm ${className}`.trim()}>
      {children}
    </dl>
  );
}
