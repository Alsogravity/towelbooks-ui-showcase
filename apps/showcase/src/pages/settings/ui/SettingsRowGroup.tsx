import type { ReactNode } from 'react';

type SettingsRowGroupProps = {
  children: ReactNode;
  className?: string;
};

export function SettingsRowGroup({
  children,
  className = '',
}: SettingsRowGroupProps) {
  return (
    <div className={`divide-y divide-rule ${className}`.trim()}>{children}</div>
  );
}
