import type { LucideProps } from 'lucide-react';

import { iconCatalog } from '../icons/catalog';

export type IconName = keyof typeof iconCatalog;

export interface IconProps extends Omit<LucideProps, 'ref'> {
  name: IconName;
}

export function Icon({
  name,
  size = 18,
  strokeWidth = 1.75,
  className = '',
  ...props
}: IconProps) {
  const Component = iconCatalog[name].component;

  return (
    <Component
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      data-icon={name}
      focusable="false"
      size={size}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
}
