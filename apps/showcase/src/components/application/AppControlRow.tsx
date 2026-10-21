import {
  appDescriptionClassName,
  appRowLabelClassName,
} from './appUiTypography';

import type { ReactNode } from 'react';

export type AppControlRowMobileLayout = 'stacked' | 'inline';

export type AppControlRowProps = {
  label?: ReactNode;
  description?: ReactNode;
  control?: ReactNode;
  unavailableText?: ReactNode;
  className?: string;
  controlClassName?: string;
  descriptionId?: string;
  labelId?: string;
  mobileLayout?: AppControlRowMobileLayout;
};

export function AppControlRow({
  label,
  description,
  control,
  unavailableText,
  className = '',
  controlClassName = 'flex shrink-0 justify-end',
  descriptionId,
  labelId,
  mobileLayout = 'stacked',
}: AppControlRowProps) {
  const isInlineMobileLayout = mobileLayout === 'inline';
  const content =
    control ??
    (unavailableText ? (
      <span className="meta text-ink-3">{unavailableText}</span>
    ) : null);

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
      <div className="min-w-0 flex-1 space-y-1">
        {label ? (
          <span id={labelId} className={appRowLabelClassName}>
            {label}
          </span>
        ) : null}
        {description ? (
          <p id={descriptionId} className={appDescriptionClassName}>
            {description}
          </p>
        ) : null}
      </div>
      {content ? <div className={controlClassName}>{content}</div> : null}
    </div>
  );
}
