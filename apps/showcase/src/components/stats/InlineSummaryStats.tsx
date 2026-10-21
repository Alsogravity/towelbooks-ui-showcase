import { type ReactNode } from 'react';

export const summaryStatValueClassName =
  'text-app-body leading-app-compact font-semibold text-ink';
export const summaryStatLabelClassName =
  'text-app-body leading-app-compact font-normal text-ink-3';

export type InlineSummaryStatItem = {
  key: string;
  label: ReactNode;
  value?: ReactNode;
  leading?: ReactNode;
  onClick?: () => void;
  actionLabel?: string;
};

export type InlineSummaryStatsProps = {
  className?: string;
  items: InlineSummaryStatItem[];
};

export function InlineSummaryStats({
  className,
  items,
}: InlineSummaryStatsProps) {
  return (
    <ul
      className={['flex flex-wrap gap-x-6 gap-y-2', className]
        .filter(Boolean)
        .join(' ')}
    >
      {items.map((item) => (
        <li key={item.key} className="flex items-center gap-1.5">
          {item.onClick ? (
            <button
              type="button"
              aria-label={item.actionLabel}
              onClick={item.onClick}
              className="inline-flex items-center gap-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick/40 focus-visible:rounded-sm"
            >
              <InlineSummaryStatContent item={item} />
            </button>
          ) : (
            <InlineSummaryStatContent item={item} />
          )}
        </li>
      ))}
    </ul>
  );
}

function InlineSummaryStatContent({ item }: { item: InlineSummaryStatItem }) {
  return (
    <>
      {item.leading ? (
        <span className="inline-flex shrink-0 items-center">
          {item.leading}
        </span>
      ) : null}
      {item.value != null ? (
        <span className={summaryStatValueClassName}>{item.value}</span>
      ) : null}
      <span className={summaryStatLabelClassName}>{item.label}</span>
    </>
  );
}
