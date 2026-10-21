import type { PointerEvent as ReactPointerEvent } from 'react';

import {
  CapsuleActionGroup,
  type CapsuleActionTone,
  type IconName,
} from '../primitives';

export type HeaderChromeAction = {
  ariaLabel: string;
  badgeCount?: number;
  badgeMax?: number;
  disabled?: boolean;
  iconName: IconName;
  onClick: () => void;
  tabIndex?: number;
  tone?: CapsuleActionTone;
};

export type HeaderChromeCloseAction = {
  ariaLabel: string;
  disabled?: boolean;
  onClick: () => void;
};

export type HeaderActionCapsuleProps = {
  className?: string;
  close?: HeaderChromeCloseAction;
  leading?: HeaderChromeAction;
  primary?: HeaderChromeAction;
};

function blurHeaderControlAfterTouch(
  event: ReactPointerEvent<HTMLButtonElement>,
) {
  if (event.pointerType === 'mouse') {
    return;
  }

  const target = event.currentTarget;
  window.requestAnimationFrame(() => {
    target.blur();
  });
}

/**
 * Single composer for panel/dialog header icon chrome.
 * Maps leading + primary + trailing close onto CapsuleActionGroup (max 3 slots).
 *
 * Contract:
 * - Icon header chrome = this composer only (via Dialog / OverlayPanelHeader structured props).
 * - Footer labeled buttons = DialogActions (Cancel/Save), never this capsule.
 * - Non-icon header extras = headerAccessory on Dialog / shells, never raw icon Button rows.
 */
export function HeaderActionCapsule({
  className = 'app-mobile-header__actions',
  close,
  leading,
  primary,
}: HeaderActionCapsuleProps) {
  if (leading == null && primary == null && close == null) {
    return null;
  }

  return (
    <CapsuleActionGroup
      className={className}
      leadingBadgeCount={leading?.badgeCount}
      leadingBadgeMax={leading?.badgeMax}
      leadingButtonProps={
        leading
          ? {
              'aria-label': leading.ariaLabel,
              disabled: leading.disabled,
              onClick: leading.onClick,
              onPointerUp: blurHeaderControlAfterTouch,
              tabIndex: leading.tabIndex,
            }
          : undefined
      }
      leadingIconName={leading?.iconName}
      leadingTone={leading?.tone ?? 'default'}
      primaryBadgeCount={primary?.badgeCount}
      primaryBadgeMax={primary?.badgeMax}
      primaryIconName={primary?.iconName ?? 'search'}
      previewButtonProps={
        close
          ? {
              'aria-label': close.ariaLabel,
              disabled: close.disabled,
              onClick: close.onClick,
              onPointerUp: blurHeaderControlAfterTouch,
            }
          : undefined
      }
      previewIconName={close ? 'x' : undefined}
      searchButtonProps={
        primary
          ? {
              'aria-label': primary.ariaLabel,
              disabled: primary.disabled,
              onClick: primary.onClick,
              onPointerUp: blurHeaderControlAfterTouch,
              tabIndex: primary.tabIndex,
            }
          : undefined
      }
    />
  );
}
