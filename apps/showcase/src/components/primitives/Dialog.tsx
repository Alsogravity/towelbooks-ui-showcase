import { forwardRef, useId, type ReactNode, type Ref } from 'react';

import {
  HeaderActionCapsule,
  type HeaderChromeAction,
} from '../overlay/HeaderActionCapsule';

import { ModalLayer, type ModalInitialFocus } from './modal/ModalLayer';
import { MODAL_OVERLAY_SCRIM_CLASS_NAME } from './modal/modalOverlayStyles';

export const DEFAULT_DIALOG_OVERLAY_CLASS_NAME = `app-dialog-overlay fixed inset-0 z-50 flex items-center justify-center p-4 ${MODAL_OVERLAY_SCRIM_CLASS_NAME}`;

const DEFAULT_OVERLAY_CLASS_NAME = DEFAULT_DIALOG_OVERLAY_CLASS_NAME;

const SIZE_TO_MAX_WIDTH: Record<DialogSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
};

const EXIT_ANIMATION_DURATION_MS = 200;

export type DialogSize = 'sm' | 'md' | 'lg';
export type DialogInitialFocus = ModalInitialFocus;

export interface DialogProps {
  children:
    | ReactNode
    | ((controls: { close: (afterClose?: () => void) => void }) => ReactNode);
  closeButtonDisabled?: boolean;
  closeButtonLabel?: string;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  getReturnFocusElement?: () => HTMLElement | null;
  /**
   * Non-icon content rendered before the header action capsule.
   * Icon chrome must use `leadingAction` / `primaryAction` (and `showCloseButton`).
   */
  headerAccessory?: ReactNode;
  /** Leading content rendered before the header title (e.g. a back button). */
  headerLeading?: ReactNode;
  initialFocus?: DialogInitialFocus;
  /** Structured leading icon action inside the header capsule. */
  leadingAction?: HeaderChromeAction;
  onClose: () => void;
  onOpenAutoFocus?: () => void;
  overlayClassName?: string;
  panelClassName?: string;
  panelRef?: Ref<HTMLDivElement>;
  /** Structured primary icon action inside the header capsule. */
  primaryAction?: HeaderChromeAction;
  showCloseButton?: boolean;
  size?: DialogSize;
  title?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

export interface DialogBodyProps {
  children: ReactNode;
  className?: string;
  disableDefaultSpacing?: boolean;
}

export const DialogBody = forwardRef<HTMLDivElement, DialogBodyProps>(
  function DialogBody(
    { children, className, disableDefaultSpacing = false },
    ref,
  ) {
    const composed = [
      'flex min-h-0 flex-1 flex-col overflow-y-auto',
      disableDefaultSpacing ? null : 'gap-6 px-6 py-6',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={composed}>
        {children}
      </div>
    );
  },
);

export interface DialogActionsProps {
  children: ReactNode;
  className?: string;
  stackOnMobile?: boolean;
}

/**
 * Footer action row for labeled primary/secondary buttons (Cancel/Save).
 * Not for icon header chrome — use `leadingAction` / `primaryAction` on `Dialog`.
 */
export function DialogActions({
  children,
  className,
  stackOnMobile = false,
}: DialogActionsProps) {
  const layoutClassName = stackOnMobile
    ? 'flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:justify-end'
    : 'flex flex-wrap justify-end gap-3';

  const composed = [layoutClassName, 'px-6 pt-4 pb-6', className]
    .filter(Boolean)
    .join(' ');

  return <div className={composed}>{children}</div>;
}

export interface DialogHeaderProps {
  closeButtonDisabled?: boolean;
  closeButtonLabel?: string;
  headerAccessory?: ReactNode;
  headerLeading?: ReactNode;
  leadingAction?: HeaderChromeAction;
  onClose?: () => void;
  primaryAction?: HeaderChromeAction;
  showCloseButton?: boolean;
  title: string;
  titleId: string;
}

export function DialogHeader({
  closeButtonDisabled = false,
  closeButtonLabel,
  headerAccessory,
  headerLeading,
  leadingAction,
  onClose,
  primaryAction,
  showCloseButton = false,
  title,
  titleId,
}: DialogHeaderProps) {
  if (
    process.env.NODE_ENV !== 'production' &&
    showCloseButton &&
    !closeButtonLabel
  ) {
    console.warn(
      'DialogHeader: `closeButtonLabel` is required when `showCloseButton` is true. ' +
        'Pass a localized label (e.g. t("common.close")).',
    );
  }

  const showClose = Boolean(showCloseButton && onClose && closeButtonLabel);
  const showCapsule =
    leadingAction != null || primaryAction != null || showClose;

  return (
    <header className="flex items-center justify-between gap-4 px-6 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {headerLeading}
        <h2
          id={titleId}
          className="app-text-dialog-title min-w-0 truncate text-ink"
        >
          {title}
        </h2>
      </div>
      {headerAccessory || showCapsule ? (
        <div className="flex shrink-0 items-center gap-2">
          {headerAccessory}
          {showCapsule ? (
            <HeaderActionCapsule
              leading={leadingAction}
              primary={primaryAction}
              close={
                showClose
                  ? {
                      ariaLabel: closeButtonLabel!,
                      disabled: closeButtonDisabled,
                      onClick: onClose!,
                    }
                  : undefined
              }
            />
          ) : null}
        </div>
      ) : null}
    </header>
  );
}

function getPanelClassName(size: DialogSize) {
  return [
    'app-dialog-panel relative flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-xl border border-paper-3 bg-paper shadow-2xl outline-none',
    SIZE_TO_MAX_WIDTH[size],
  ].join(' ');
}

export function Dialog({
  children,
  closeButtonDisabled,
  closeButtonLabel,
  closeOnBackdrop = true,
  closeOnEscape = true,
  getReturnFocusElement,
  headerAccessory,
  headerLeading,
  initialFocus = 'first-focusable',
  leadingAction,
  onClose,
  onOpenAutoFocus,
  overlayClassName = DEFAULT_OVERLAY_CLASS_NAME,
  panelClassName,
  panelRef: panelRefProp,
  primaryAction,
  showCloseButton = false,
  size = 'md',
  title,
  'aria-labelledby': ariaLabelledByProp,
  'aria-describedby': ariaDescribedBy,
}: DialogProps) {
  const generatedTitleId = useId();
  const titleId = title ? generatedTitleId : ariaLabelledByProp;

  if (process.env.NODE_ENV !== 'production' && !titleId) {
    console.warn(
      'Dialog: provide either `title` or `aria-labelledby` so assistive technologies can label the dialog.',
    );
  }

  const resolvedPanelClassName = panelClassName ?? getPanelClassName(size);

  return (
    <ModalLayer
      aria-labelledby={titleId}
      aria-describedby={ariaDescribedBy}
      closeOnBackdrop={closeOnBackdrop}
      closeOnEscape={closeOnEscape}
      exitAnimationDurationMs={EXIT_ANIMATION_DURATION_MS}
      getReturnFocusElement={getReturnFocusElement}
      initialFocus={initialFocus}
      onClose={onClose}
      onOpenAutoFocus={onOpenAutoFocus}
      overlayClassName={overlayClassName}
      panelClassName={resolvedPanelClassName}
      panelRef={panelRefProp}
    >
      {({ close }) => (
        <>
          {title && titleId ? (
            <DialogHeader
              closeButtonDisabled={closeButtonDisabled}
              closeButtonLabel={closeButtonLabel}
              headerAccessory={headerAccessory}
              headerLeading={headerLeading}
              leadingAction={leadingAction}
              onClose={() => close()}
              primaryAction={primaryAction}
              showCloseButton={showCloseButton}
              title={title}
              titleId={titleId}
            />
          ) : null}
          {typeof children === 'function' ? children({ close }) : children}
        </>
      )}
    </ModalLayer>
  );
}
