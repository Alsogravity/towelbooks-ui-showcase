import { type ReactNode } from 'react';

import {
  InlineSummaryStats,
  summaryStatLabelClassName,
  summaryStatValueClassName,
} from '../stats/InlineSummaryStats';

export interface ProfileStatItem {
  actionLabel?: string;
  key: string;
  label: ReactNode;
  leading?: ReactNode;
  onClick?: () => void;
  value: ReactNode;
}

export interface ProfileStatsProps {
  className?: string;
  items: ProfileStatItem[];
  variant?: 'inline' | 'stacked';
}

export function ProfileStats({
  className,
  items,
  variant = 'inline',
}: ProfileStatsProps) {
  if (variant === 'inline') {
    return <InlineSummaryStats className={className} items={items} />;
  }

  const listClassName = ['flex w-full items-start gap-6', className]
    .filter(Boolean)
    .join(' ');

  return (
    <ul className={listClassName}>
      {items.map((item) => (
        <li
          key={item.key}
          className="flex min-w-0 flex-col items-center gap-0.5 text-center"
        >
          {item.onClick ? (
            <button
              type="button"
              aria-label={item.actionLabel}
              onClick={item.onClick}
              className="flex min-w-0 flex-col items-center gap-0.5 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick/40 focus-visible:rounded-sm"
            >
              <ProfileStatContent item={item} />
            </button>
          ) : (
            <ProfileStatContent item={item} />
          )}
        </li>
      ))}
    </ul>
  );
}

function ProfileStatContent({ item }: { item: ProfileStatItem }) {
  return (
    <>
      <span className={summaryStatValueClassName}>{item.value}</span>
      <span className={summaryStatLabelClassName}>{item.label}</span>
    </>
  );
}
