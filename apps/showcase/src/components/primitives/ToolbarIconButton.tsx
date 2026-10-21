import { forwardRef, type ButtonHTMLAttributes } from 'react';

import {
  BUTTON_ICON_SIZE,
  CountBadge,
  buttonClassName,
  formatCountBadgeLabel,
  type IconName,
} from '@towelbooks/ui';

import { Icon } from './Icon';

export type ToolbarIconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> & {
  'aria-label': string;
  badgeCount?: number;
  badgeMax?: number;
  icon: IconName;
  iconSize?: number;
  isActive?: boolean;
  showActiveDot?: boolean;
};

export const ToolbarIconButton = forwardRef<
  HTMLButtonElement,
  ToolbarIconButtonProps
>(function ToolbarIconButton(
  {
    badgeCount,
    badgeMax,
    className = '',
    icon,
    iconSize = BUTTON_ICON_SIZE,
    isActive = false,
    showActiveDot = false,
    title,
    type = 'button',
    ...buttonProps
  },
  ref,
) {
  const hasBadge = formatCountBadgeLabel(badgeCount, badgeMax) !== null;
  const ariaLabel = buttonProps['aria-label'];

  return (
    <button
      {...buttonProps}
      ref={ref}
      type={type}
      title={title ?? ariaLabel}
      className={buttonClassName({
        className: [
          'vui-button--icon-only',
          isActive ? '!text-brick' : '',
          className,
        ]
          .filter(Boolean)
          .join(' '),
        size: 'md',
        variant: 'icon',
      })}
    >
      <span className="vui-count-badge-anchor">
        <Icon name={icon} size={iconSize} className="vui-button__icon" />
        {hasBadge ? <CountBadge count={badgeCount} max={badgeMax} /> : null}
        {showActiveDot && !hasBadge ? (
          <span
            aria-hidden
            className="pointer-events-none absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-brick shadow-sm"
          />
        ) : null}
      </span>
    </button>
  );
});
