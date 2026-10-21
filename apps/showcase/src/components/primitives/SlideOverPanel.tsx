import { forwardRef, type ReactNode, type Ref } from 'react';

import { Button } from './Button';
import {
  ModalLayer,
  type ModalInitialFocus,
  type ModalLayerControls,
} from './modal/ModalLayer';

const EXIT_ANIMATION_DURATION_MS = 300;

export type SlideOverPanelChrome = 'immersive' | 'shell';
export type SlideOverPanelDesktopVisibility = 'hidden' | 'visible';
export type SlideOverPanelSide = 'left' | 'right';
export type SlideOverPanelViewport = 'app-shell' | 'viewport';

export interface SlideOverPanelProps {
  children: ReactNode | ((controls: ModalLayerControls) => ReactNode);
  chrome?: SlideOverPanelChrome;
  desktopVisibility?: SlideOverPanelDesktopVisibility;
  getReturnFocusElement?: () => HTMLElement | null;
  initialFocus?: ModalInitialFocus;
  onClose: () => void;
  onOpenAutoFocus?: () => void;
  overlayClassName?: string;
  panelClassName?: string;
  panelRef?: Ref<HTMLDivElement>;
  side?: SlideOverPanelSide;
  titleId: string;
  viewport?: SlideOverPanelViewport;
  'aria-describedby'?: string;
}

export interface SlideOverPanelHeaderProps {
  actions?: ReactNode;
  backLabel?: string;
  children: ReactNode;
  className?: string;
  closeLabel: string;
  leadingClose?: 'back';
  onClose: () => void;
}

export interface SlideOverPanelBodyProps {
  children: ReactNode;
  className?: string;
}

export interface SlideOverPanelFooterProps {
  children: ReactNode;
  className?: string;
  disableDefaultSpacing?: boolean;
  stackOnMobile?: boolean;
}

function resolveChrome(
  viewport: SlideOverPanelViewport,
  chrome: SlideOverPanelChrome | undefined,
) {
  if (chrome) {
    return chrome;
  }

  return viewport === 'app-shell' ? 'shell' : 'immersive';
}

export function SlideOverPanel({
  children,
  chrome,
  desktopVisibility = 'visible',
  getReturnFocusElement,
  initialFocus = 'first-focusable',
  onClose,
  onOpenAutoFocus,
  overlayClassName,
  panelClassName,
  panelRef,
  side = 'right',
  titleId,
  viewport = 'viewport',
  'aria-describedby': ariaDescribedBy,
}: SlideOverPanelProps) {
  const resolvedChrome = resolveChrome(viewport, chrome);
  const useShellOffsets =
    viewport === 'app-shell' && resolvedChrome === 'shell';

  return (
    <ModalLayer
      aria-labelledby={titleId}
      aria-describedby={ariaDescribedBy}
      exitAnimationDurationMs={EXIT_ANIMATION_DURATION_MS}
      getReturnFocusElement={getReturnFocusElement}
      initialFocus={initialFocus}
      onClose={onClose}
      onOpenAutoFocus={onOpenAutoFocus}
      overlayClassName={[
        'app-slide-over-overlay fixed inset-x-0 top-0 flex',
        side === 'left' ? 'justify-start' : 'justify-end',
        viewport === 'app-shell'
          ? [
              'z-10 bg-ink/20',
              '[--app-mobile-header-height:4rem]',
              '[--app-mobile-nav-height:48px]',
            ].join(' ')
          : 'bottom-0 z-50 bg-night/70 backdrop-blur-[2px]',
        useShellOffsets
          ? 'bottom-[calc(var(--app-mobile-nav-height)+env(safe-area-inset-bottom))]'
          : 'bottom-0',
        desktopVisibility === 'hidden' ? 'lg:hidden' : '',
        overlayClassName,
      ]
        .filter(Boolean)
        .join(' ')}
      panelClassName={[
        'app-slide-over-panel relative flex h-full w-full flex-col overflow-hidden bg-paper shadow-2xl outline-none',
        side === 'left'
          ? 'app-slide-over-panel--left'
          : 'app-slide-over-panel--right',
        useShellOffsets ? 'pt-[var(--app-mobile-header-height)]' : '',
        panelClassName,
      ]
        .filter(Boolean)
        .join(' ')}
      panelRef={panelRef}
    >
      {children}
    </ModalLayer>
  );
}

export function SlideOverPanelHeader({
  actions,
  backLabel,
  children,
  className,
  closeLabel,
  leadingClose,
  onClose,
}: SlideOverPanelHeaderProps) {
  if (leadingClose === 'back') {
    return (
      <header
        className={[
          'flex shrink-0 items-center justify-between gap-4 px-5 py-4',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Button
            aria-label={backLabel ?? closeLabel}
            className="shrink-0"
            icon="chevron-left"
            size="sm"
            type="button"
            variant="ghost"
            onClick={onClose}
          />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </header>
    );
  }

  return (
    <header
      className={[
        'flex shrink-0 items-center justify-between gap-4 px-6 py-5',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="min-w-0 flex-1">{children}</div>
      <div className="flex shrink-0 items-start gap-2">
        {actions}
        <Button
          variant="ghost"
          size="sm"
          icon="x"
          aria-label={closeLabel}
          onClick={onClose}
        />
      </div>
    </header>
  );
}

export const SlideOverPanelBody = forwardRef<
  HTMLDivElement,
  SlideOverPanelBodyProps
>(function SlideOverPanelBody({ children, className }, ref) {
  return (
    <div
      ref={ref}
      className={[
        'flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 pb-6',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
});

export function SlideOverPanelFooter({
  children,
  className,
  disableDefaultSpacing = false,
  stackOnMobile = false,
}: SlideOverPanelFooterProps) {
  const layoutClassName = stackOnMobile
    ? 'flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-end'
    : 'flex flex-wrap justify-end gap-2';

  return (
    <footer
      className={[
        layoutClassName,
        'shrink-0',
        disableDefaultSpacing ? undefined : 'px-6 pt-4 pb-6',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </footer>
  );
}
