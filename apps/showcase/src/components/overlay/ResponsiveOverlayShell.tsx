import { useId, type ReactNode, type RefObject } from 'react';

import { CollapsibleHeaderSlot } from '../layout';
import { Dialog, DialogBody } from '../primitives';
import {
  useIsBelowSmViewport,
  useIsCompactShellViewport,
} from '../../layouts/app/shellViewport';

import type { HeaderChromeAction } from './HeaderActionCapsule';
import { HeaderBackCapsule } from './HeaderBackCapsule';
import { MobilePanelShell } from './MobilePanelShell';

import type { DialogInitialFocus } from '../primitives/Dialog';
import type { SlideOverPanelChrome } from '../primitives/SlideOverPanel';
import type { SlideOverPanelDesktopVisibility } from '../primitives/SlideOverPanel';

export type ResponsiveOverlayBreakpoint = 'compact' | 'sm';
export type ResponsiveOverlayViewport = 'app-shell' | 'immersive';

export type ResponsiveOverlayShellProps = {
  backLabel?: string;
  bodyClassName?: string;
  breakpoint?: ResponsiveOverlayBreakpoint;
  children: ReactNode;
  chrome?: SlideOverPanelChrome;
  closeLabel: string;
  dialogBodyClassName?: string;
  dialogPanelClassName?: string;
  dialogSize?: 'lg' | 'md' | 'sm';
  footer?: ReactNode;
  getReturnFocusElement?: () => HTMLElement | null;
  /**
   * Non-icon content before the action capsule.
   * Icon chrome: `leadingAction` / `primaryAction` only.
   */
  headerAccessory?: ReactNode;
  headerAccessoryCollapsibleClassName?: string;
  showHeaderAccessory?: boolean;
  initialFocus?: DialogInitialFocus;
  leadingAction?: HeaderChromeAction;
  onBack?: () => void;
  onClose: () => void;
  onOpenAutoFocus?: () => void;
  primaryAction?: HeaderChromeAction;
  scrollRef?: RefObject<HTMLDivElement | null>;
  showBack?: boolean;
  slideOverBodyClassName?: string;
  slideOverDesktopVisibility?: SlideOverPanelDesktopVisibility;
  slideOverPanelClassName?: string;
  title: string;
  viewport?: ResponsiveOverlayViewport;
};

export function ResponsiveOverlayShell({
  backLabel,
  bodyClassName,
  breakpoint = 'sm',
  children,
  chrome,
  closeLabel,
  dialogBodyClassName,
  dialogPanelClassName,
  dialogSize,
  footer,
  getReturnFocusElement,
  headerAccessory,
  headerAccessoryCollapsibleClassName,
  showHeaderAccessory,
  initialFocus,
  leadingAction,
  onBack,
  onClose,
  onOpenAutoFocus,
  primaryAction,
  scrollRef,
  showBack = false,
  slideOverBodyClassName,
  slideOverDesktopVisibility = 'visible',
  slideOverPanelClassName,
  title,
  viewport = 'immersive',
}: ResponsiveOverlayShellProps) {
  const titleId = useId();
  const isBelowSm = useIsBelowSmViewport();
  const isCompactShell = useIsCompactShellViewport();
  const useSlideOver = breakpoint === 'compact' ? isCompactShell : isBelowSm;
  const resolvedChrome =
    chrome ?? (viewport === 'app-shell' ? 'shell' : 'immersive');

  const resolvedShowAccessory = showHeaderAccessory ?? headerAccessory != null;

  const desktopBackButton = (
    <CollapsibleHeaderSlot visible={showBack}>
      <HeaderBackCapsule
        ariaLabel={backLabel ?? closeLabel}
        onClick={() => onBack?.()}
      />
    </CollapsibleHeaderSlot>
  );

  const desktopAccessory =
    headerAccessory != null ? (
      <CollapsibleHeaderSlot
        className={headerAccessoryCollapsibleClassName}
        visible={resolvedShowAccessory}
      >
        {headerAccessory}
      </CollapsibleHeaderSlot>
    ) : null;

  if (useSlideOver) {
    return (
      <MobilePanelShell
        back={
          showBack && backLabel && onBack
            ? { ariaLabel: backLabel, onBack }
            : undefined
        }
        chrome={resolvedChrome}
        closeLabel={closeLabel}
        contentClassName={slideOverBodyClassName ?? bodyClassName}
        desktopVisibility={slideOverDesktopVisibility}
        footer={footer}
        getReturnFocusElement={getReturnFocusElement}
        headerAccessory={headerAccessory}
        initialFocus={initialFocus}
        leadingAction={leadingAction}
        onClose={onClose}
        onOpenAutoFocus={onOpenAutoFocus}
        panelClassName={slideOverPanelClassName}
        primaryAction={primaryAction}
        scrollRef={scrollRef}
        title={title}
        titleId={titleId}
        viewport={viewport === 'app-shell' ? 'app-shell' : 'viewport'}
      >
        {children}
      </MobilePanelShell>
    );
  }

  return (
    <Dialog
      closeButtonLabel={closeLabel}
      getReturnFocusElement={getReturnFocusElement}
      headerAccessory={desktopAccessory}
      headerLeading={desktopBackButton}
      initialFocus={initialFocus}
      leadingAction={leadingAction}
      onClose={onClose}
      onOpenAutoFocus={onOpenAutoFocus}
      panelClassName={dialogPanelClassName}
      primaryAction={primaryAction}
      showCloseButton
      size={dialogSize}
      title={title}
    >
      {footer ? (
        <>
          <DialogBody
            ref={scrollRef}
            className={dialogBodyClassName ?? bodyClassName}
            disableDefaultSpacing={Boolean(
              dialogBodyClassName ?? bodyClassName,
            )}
          >
            {children}
          </DialogBody>
          {footer}
        </>
      ) : (
        <DialogBody
          ref={scrollRef}
          className={dialogBodyClassName ?? bodyClassName}
          disableDefaultSpacing={Boolean(dialogBodyClassName ?? bodyClassName)}
        >
          {children}
        </DialogBody>
      )}
    </Dialog>
  );
}
