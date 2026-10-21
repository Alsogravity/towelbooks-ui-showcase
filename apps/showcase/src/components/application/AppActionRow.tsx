import { Icon, type IconName } from '../primitives';
import { appRowLabelTypographyClassName } from './appUiTypography';

import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export type AppActionRowProps = {
  icon?: IconName;
  label: ReactNode;
  showChevron?: boolean;
} & Omit<ComponentPropsWithoutRef<'button'>, 'children'>;

export function AppActionRow({
  icon,
  label,
  showChevron = true,
  className = '',
  type = 'button',
  ...buttonProps
}: AppActionRowProps) {
  return (
    <button
      type={type}
      className={[
        'flex w-full items-center justify-between gap-3 rounded py-3 text-left text-brick no-underline transition-colors hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brick disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:no-underline',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...buttonProps}
    >
      <span className="flex min-w-0 items-center gap-3">
        {icon ? (
          <Icon name={icon} size={18} className="shrink-0 text-brick" />
        ) : null}
        <span className={appRowLabelTypographyClassName}>{label}</span>
      </span>
      {showChevron ? (
        <Icon name="chevron-right" size={18} className="shrink-0 text-ink-3" />
      ) : null}
    </button>
  );
}
