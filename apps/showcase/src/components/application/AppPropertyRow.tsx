import { appRowLabelClassName } from './appUiTypography';

import type { ReactNode } from 'react';

export type AppPropertyRowMobileLayout = 'stacked' | 'inline';

export type AppPropertyRowProps = {
  label: ReactNode;
  value: ReactNode;
  mobileLayout?: AppPropertyRowMobileLayout;
};

export function AppPropertyRow({
  label,
  value,
  mobileLayout = 'stacked',
}: AppPropertyRowProps) {
  const isInlineMobileLayout = mobileLayout === 'inline';

  return (
    <div
      className={[
        isInlineMobileLayout
          ? 'flex flex-row items-center justify-between gap-3 py-4 sm:gap-6'
          : 'flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between',
      ].join(' ')}
    >
      <dt className={appRowLabelClassName}>{label}</dt>
      <dd
        className={[
          'text-ink',
          isInlineMobileLayout ? 'min-w-0 text-right' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {value}
      </dd>
    </div>
  );
}
