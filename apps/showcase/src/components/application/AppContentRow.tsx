import type { ReactNode } from 'react';

export type AppContentRowMobileLayout = 'stacked' | 'inline';

export type AppContentRowProps = {
  action?: ReactNode;
  className?: string;
  leading?: ReactNode;
  meta?: ReactNode;
  mobileLayout?: AppContentRowMobileLayout;
  title: ReactNode;
};

export function AppContentRow({
  action,
  className = '',
  leading,
  meta,
  mobileLayout = 'stacked',
  title,
}: AppContentRowProps) {
  const isInlineMobileLayout = mobileLayout === 'inline';

  return (
    <div
      className={[
        isInlineMobileLayout
          ? 'flex flex-row items-center justify-between gap-3 py-4 sm:gap-6'
          : 'flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        {leading ? <div className="shrink-0">{leading}</div> : null}
        <div className="min-w-0">
          <p className="app-text-row-title truncate text-ink">{title}</p>
          {meta ? (
            <p className="meta mt-0.5 truncate text-ink-3">{meta}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
