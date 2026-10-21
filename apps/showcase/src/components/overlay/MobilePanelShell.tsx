import { type FormHTMLAttributes, type ReactNode, type RefObject } from 'react';

import { SlideOverPanel, SlideOverPanelFooter } from '../primitives';
import { useMobileShellOverlayLock } from '../../layouts/app/MobileShellOverlayContext';
import { useIsCompactShellViewport } from '../../layouts/app/shellViewport';

import type { HeaderChromeAction } from './HeaderActionCapsule';
import { OverlayPanelContent } from './OverlayPanelContent';
import {
  OverlayPanelHeader,
  type OverlayPanelHeaderBackAction,
} from './OverlayPanelHeader';
import { overlayPanelFooterClassName } from './overlayPanelStyles';

import type { DialogInitialFocus } from '../primitives/Dialog';
import type {
  SlideOverPanelChrome,
  SlideOverPanelDesktopVisibility,
  SlideOverPanelSide,
  SlideOverPanelViewport,
} from '../primitives/SlideOverPanel';

const shellClassName = 'flex min-h-0 flex-1 flex-col overflow-hidden';

export type MobilePanelShellProps = {
  back?: OverlayPanelHeaderBackAction;
  children: ReactNode;
  chrome?: SlideOverPanelChrome;
  closeLabel: string;
  contentClassName?: string;
  desktopVisibility?: SlideOverPanelDesktopVisibility;
  footer?: ReactNode;
  formProps?: FormHTMLAttributes<HTMLFormElement>;
  getReturnFocusElement?: () => HTMLElement | null;
  /** Non-icon content before the action capsule. */
  headerAccessory?: ReactNode;
  initialFocus?: DialogInitialFocus;
  leadingAction?: HeaderChromeAction;
  onClose: () => void;
  onOpenAutoFocus?: () => void;
  overlayClassName?: string;
  panelClassName?: string;
  primaryAction?: HeaderChromeAction;
  scrollRef?: RefObject<HTMLDivElement | null>;
  showHeader?: boolean;
  side?: SlideOverPanelSide;
  title: string;
  titleId: string;
  viewport?: SlideOverPanelViewport;
  'aria-describedby'?: string;
};

export function MobilePanelShell({
  back,
  children,
  chrome = 'immersive',
  closeLabel,
  contentClassName,
  desktopVisibility = 'visible',
  footer,
  formProps,
  getReturnFocusElement,
  headerAccessory,
  initialFocus,
  leadingAction,
  onClose,
  onOpenAutoFocus,
  overlayClassName,
  panelClassName,
  primaryAction,
  scrollRef,
  showHeader = true,
  side = 'right',
  title,
  titleId,
  viewport = 'viewport',
  'aria-describedby': ariaDescribedBy,
}: MobilePanelShellProps) {
  const isCompactShellViewport = useIsCompactShellViewport();
  useMobileShellOverlayLock(isCompactShellViewport);

  const chromeContent = (
    <>
      <h2 id={titleId} className="sr-only">
        {title}
      </h2>
      {showHeader ? (
        <OverlayPanelHeader
          headerAccessory={headerAccessory}
          back={back}
          close={{ ariaLabel: closeLabel, onClose }}
          leadingAction={leadingAction}
          primaryAction={primaryAction}
          title={title}
        />
      ) : null}
      <OverlayPanelContent ref={scrollRef} className={contentClassName}>
        {children}
      </OverlayPanelContent>
      {footer ? (
        <SlideOverPanelFooter
          className={overlayPanelFooterClassName}
          disableDefaultSpacing
        >
          {footer}
        </SlideOverPanelFooter>
      ) : null}
    </>
  );

  const shell = formProps ? (
    <form
      {...formProps}
      className={[shellClassName, formProps.className]
        .filter(Boolean)
        .join(' ')}
    >
      {chromeContent}
    </form>
  ) : (
    <div className={shellClassName}>{chromeContent}</div>
  );

  return (
    <SlideOverPanel
      chrome={chrome}
      desktopVisibility={desktopVisibility}
      getReturnFocusElement={getReturnFocusElement}
      initialFocus={initialFocus}
      onClose={onClose}
      onOpenAutoFocus={onOpenAutoFocus}
      overlayClassName={overlayClassName}
      panelClassName={panelClassName}
      side={side}
      titleId={titleId}
      viewport={viewport}
      aria-describedby={ariaDescribedBy}
    >
      {shell}
    </SlideOverPanel>
  );
}
