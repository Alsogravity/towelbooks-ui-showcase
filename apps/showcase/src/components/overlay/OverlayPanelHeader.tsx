import type { ReactNode } from 'react';

import {
  HeaderActionCapsule,
  type HeaderChromeAction,
} from './HeaderActionCapsule';
import { HeaderBackCapsule } from './HeaderBackCapsule';

export type OverlayPanelHeaderBackAction = {
  ariaLabel: string;
  onBack: () => void;
};

export type OverlayPanelHeaderCloseAction = {
  ariaLabel: string;
  onClose: () => void;
};

export type OverlayPanelHeaderProps = {
  /** Non-icon content before the action capsule. Icon chrome uses leading/primary. */
  headerAccessory?: ReactNode;
  back?: OverlayPanelHeaderBackAction;
  close: OverlayPanelHeaderCloseAction;
  leadingAction?: HeaderChromeAction;
  primaryAction?: HeaderChromeAction;
  title: string;
};

/** Single-action capsule footprint (2.5rem) used for header back chrome. */
export const HEADER_BACK_CAPSULE_SLOT_CLASS =
  'h-10 w-10 translate-x-0 opacity-100';

export function OverlayPanelHeader({
  headerAccessory,
  back,
  close,
  leadingAction,
  primaryAction,
  title,
}: OverlayPanelHeaderProps) {
  const hasBack = back != null;
  const showCapsule =
    leadingAction != null || primaryAction != null || close != null;

  return (
    <header className="app-mobile-header sticky top-0 z-20 shrink-0 pt-[env(safe-area-inset-top)] [--app-mobile-header-height:4rem]">
      <div className="relative z-30 flex h-[var(--app-mobile-header-height)] min-h-16 max-h-16 items-center gap-3 overflow-hidden px-4 sm:px-3">
        <div className="min-w-0 flex-1 overflow-visible">
          <span className="flex min-w-0 items-center app-text-mobile-header-title text-ink">
            <span
              className={[
                'flex min-w-0 items-center transition-[gap] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
                hasBack ? 'gap-2' : 'gap-0',
              ].join(' ')}
            >
              <span
                aria-hidden={!hasBack}
                className={[
                  'inline-flex shrink-0 items-center justify-center overflow-visible transition-[width,opacity,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
                  hasBack
                    ? HEADER_BACK_CAPSULE_SLOT_CLASS
                    : 'h-0 w-0 -translate-x-2 opacity-0',
                ].join(' ')}
              >
                {hasBack ? (
                  <HeaderBackCapsule
                    ariaLabel={back.ariaLabel}
                    onClick={back.onBack}
                  />
                ) : null}
              </span>
              <span className="min-w-0 truncate">{title}</span>
            </span>
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {headerAccessory}
          {showCapsule ? (
            <HeaderActionCapsule
              leading={leadingAction}
              primary={primaryAction}
              close={{
                ariaLabel: close.ariaLabel,
                onClick: close.onClose,
              }}
            />
          ) : null}
        </div>
      </div>
    </header>
  );
}
