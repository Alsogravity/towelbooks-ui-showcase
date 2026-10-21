'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';

import { classNames } from '../className';
import {
  createDialogEntryId,
  isTopmostDialog,
  popDialog,
  pushDialog,
  type DialogStackEntry,
} from './dialogStack';

export type DialogInitialFocus = 'first' | 'panel';

export interface DialogProps {
  children: ReactNode;
  /** Close when the backdrop is activated. Defaults to true. */
  closeOnBackdrop?: boolean;
  /** Close on Escape. Defaults to true. */
  closeOnEscape?: boolean;
  /** Optional dialog description, wired to the panel via aria-describedby. */
  description?: ReactNode;
  descriptionClassName?: string;
  /**
   * Element focused when the dialog opens: the first focusable descendant
   * (`'first'`, default) or the panel itself (`'panel'`).
   */
  initialFocus?: DialogInitialFocus;
  /** Emitted when the dialog requests to open or close. */
  onOpenChange?: (open: boolean) => void;
  /** Whether the dialog is open. Controlled. */
  open: boolean;
  /** Optional class name for the full-viewport backdrop element. */
  backdropClassName?: string;
  panelClassName?: string;
  /** Additional attributes for the dialog panel element. */
  panelProps?: HTMLAttributes<HTMLDivElement>;
  /**
   * Suppresses Escape and backdrop dismissal, e.g. while an async action is
   * pending. The dialog stays open until the consumer flips `open`.
   */
  preventClose?: boolean;
  /** Dialog title, wired to the panel via aria-labelledby. */
  title?: ReactNode;
  titleClassName?: string;
}

/**
 * How long a closed dialog stays mounted to play its exit animation. Must match
 * the CSS out-animation duration in `src/styles/dialog.css`, which uses
 * `var(--motion-duration-base)` — 200ms, defined in
 * `packages/design-tokens/src/global.css` (the token is not exported at
 * runtime, so the value is mirrored here).
 */
export const DIALOG_EXIT_DURATION_MS = 200;

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'summary',
  // `contenteditable` with no value (and `""`) defaults to true, and
  // `plaintext-only` is the other editable keyword; only `"false"` is not
  // focusable.
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"]):not([disabled])',
].join(',');

/**
 * Whether the element is actually rendered: the `hidden` attribute, computed
 * `display: none` / `visibility: hidden`, or (in real browsers) no layout
 * geometry all disqualify it. jsdom performs no layout, so geometry checks
 * always report empty rects / a null offsetParent there and are skipped.
 */
function isRendered(element: HTMLElement): boolean {
  if (element.hidden) {
    return false;
  }

  const view = element.ownerDocument.defaultView;

  if (view) {
    const computed = view.getComputedStyle(element);

    if (computed.display === 'none' || computed.visibility === 'hidden') {
      return false;
    }
  }

  if (
    typeof navigator !== 'undefined' &&
    navigator.userAgent.includes('jsdom')
  ) {
    return true;
  }

  return element.offsetParent !== null || element.getClientRects().length > 0;
}

function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) {
    return [];
  }

  return [...container.querySelectorAll<HTMLElement>(focusableSelector)].filter(
    (element) =>
      element.getAttribute('aria-hidden') !== 'true' && isRendered(element),
  );
}

/*
 * Body scroll lock. A module-scoped refcount keeps the scroll lock intact
 * while more than one dialog is open and restores the original overflow value
 * only when the last dialog closes.
 */
let bodyScrollLockCount = 0;
let bodyOverflowBeforeLock: string | null = null;

function lockBodyScroll() {
  if (bodyScrollLockCount === 0) {
    bodyOverflowBeforeLock = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  bodyScrollLockCount += 1;
}

function unlockBodyScroll() {
  bodyScrollLockCount = Math.max(0, bodyScrollLockCount - 1);

  if (bodyScrollLockCount === 0) {
    document.body.style.overflow = bodyOverflowBeforeLock ?? '';
    bodyOverflowBeforeLock = null;
  }
}

/*
 * Background isolation and the global Escape/Tab listener are owned by the
 * central dialog stack (./dialogStack): the topmost open dialog is the only
 * one that traps keyboard input, and every body child outside its portal —
 * including lower dialogs' portals — is isolated while it is open.
 */
type DialogLifecycleProps = {
  closeOnEscape: boolean;
  initialFocus: DialogInitialFocus;
  onOpenChange?: (open: boolean) => void;
  preventClose: boolean;
};

/**
 * The Escape/Tab handler of one dialog instance, registered on the stack. The
 * closure is created once per instance and reads dismissal props and the panel
 * from refs at event time, so `preventClose` flips while the dialog is open
 * are honored without re-creating the handler.
 */
function createDialogKeydownHandler(
  lifecyclePropsRef: RefObject<DialogLifecycleProps>,
  panelRef: RefObject<HTMLDivElement | null>,
) {
  return (event: globalThis.KeyboardEvent) => {
    const { closeOnEscape, onOpenChange, preventClose } =
      lifecyclePropsRef.current;

    if (event.key === 'Escape') {
      if (closeOnEscape && !preventClose) {
        event.preventDefault();
        onOpenChange?.(false);
      }

      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const panelNode = panelRef.current;

    if (!panelNode) {
      return;
    }

    const focusableElements = getFocusableElements(panelNode);

    if (focusableElements.length === 0) {
      event.preventDefault();
      panelNode.focus();
      return;
    }

    const firstElement = focusableElements[0]!;
    const lastElement = focusableElements[focusableElements.length - 1]!;
    const activeElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const focusIsInside =
      activeElement !== null && panelNode.contains(activeElement);

    if (event.shiftKey) {
      if (!focusIsInside || activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }

      return;
    }

    if (!focusIsInside || activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };
}

export function Dialog({
  children,
  closeOnBackdrop = true,
  closeOnEscape = true,
  description,
  descriptionClassName,
  initialFocus = 'first',
  onOpenChange,
  open,
  backdropClassName,
  panelClassName,
  panelProps,
  preventClose = false,
  title,
  titleClassName,
}: DialogProps) {
  const generatedId = useId();
  const titleId = title ? `${generatedId}-title` : undefined;
  const descriptionId = description ? `${generatedId}-description` : undefined;
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [contentRendered, setContentRendered] = useState(open);

  /*
   * Latest props for the lifecycle effect. The modal effect must only re-run
   * when `open`/`contentRendered` change; otherwise its cleanup would restore
   * focus and release scroll in the middle of an open dialog.
   */
  const lifecyclePropsRef = useRef<DialogLifecycleProps>({
    closeOnEscape,
    initialFocus,
    onOpenChange,
    preventClose,
  });

  useEffect(() => {
    lifecyclePropsRef.current = {
      closeOnEscape,
      initialFocus,
      onOpenChange,
      preventClose,
    };
  });

  /*
   * Stack registration. The entry is created once per instance (the handler
   * closure reads props and the panel from refs at event time) and is pushed
   * while the dialog is open, popped as soon as a close request lands — the
   * portal may stay mounted for the exit animation, but the dialog must stop
   * owning Escape/Tab and isolation immediately.
   */
  const stackEntryRef = useRef<DialogStackEntry | null>(null);

  if (stackEntryRef.current === null) {
    stackEntryRef.current = {
      id: createDialogEntryId(),
      wrapperRef,
      keydownHandler: createDialogKeydownHandler(lifecyclePropsRef, panelRef),
    };
  }

  useEffect(() => {
    if (!open || !contentRendered) {
      return;
    }

    // The entry is created during the first render, before this effect runs.
    pushDialog(stackEntryRef.current!);

    return () => popDialog(stackEntryRef.current!.id);
  }, [contentRendered, open]);

  // Keep the portal mounted during the exit animation after a close request,
  // then unmount it (and cancel the timer if the dialog reopens in between).
  useEffect(() => {
    if (open) {
      setContentRendered(true);
      return;
    }

    if (!contentRendered) {
      return;
    }

    const exitTimer = window.setTimeout(() => {
      setContentRendered(false);
    }, DIALOG_EXIT_DURATION_MS);

    return () => window.clearTimeout(exitTimer);
  }, [contentRendered, open]);

  // Modal lifecycle: capture the focus origin, move focus in (only while
  // topmost), lock scroll, and undo everything on close or unmount (including
  // navigation while open). Escape/Tab trapping and background isolation are
  // handled by the central stack.
  useEffect(() => {
    if (!open || !contentRendered) {
      return;
    }

    const { initialFocus } = lifecyclePropsRef.current;
    const panel = panelRef.current;
    const ownerDocument = panel?.ownerDocument ?? document;

    if (
      ownerDocument.activeElement instanceof HTMLElement &&
      !panel?.contains(ownerDocument.activeElement)
    ) {
      previousFocusRef.current = ownerDocument.activeElement;
    }

    const focusFrame = window.requestAnimationFrame(() => {
      const panelNode = panelRef.current;

      if (
        !panelNode ||
        // Only the topmost dialog may claim focus: a dialog that opened
        // underneath a higher one must not steal focus from it (the rAF
        // callback may run after the stack changed).
        !isTopmostDialog(stackEntryRef.current!.id) ||
        (ownerDocument.activeElement instanceof HTMLElement &&
          panelNode.contains(ownerDocument.activeElement))
      ) {
        return;
      }

      const focusTarget =
        initialFocus === 'panel'
          ? panelNode
          : (getFocusableElements(panelNode)[0] ?? panelNode);

      focusTarget.focus();
    });

    lockBodyScroll();

    return () => {
      window.cancelAnimationFrame(focusFrame);
      unlockBodyScroll();

      if (previousFocusRef.current?.isConnected) {
        previousFocusRef.current.focus();
      }

      previousFocusRef.current = null;
    };
  }, [contentRendered, open]);

  const {
    className: panelPropsClassName,
    onKeyDown: panelPropsOnKeyDown,
    ...restPanelProps
  } = panelProps ?? {};

  const handlePanelKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      panelPropsOnKeyDown?.(event);
    },
    [panelPropsOnKeyDown],
  );

  const handleBackdropClick = useCallback(() => {
    // Only the topmost dialog's backdrop dismisses: lower dialogs' backdrops
    // are covered by the higher dialog and isolated from interaction.
    if (
      isTopmostDialog(stackEntryRef.current!.id) &&
      closeOnBackdrop &&
      !preventClose
    ) {
      onOpenChange?.(false);
    }
  }, [closeOnBackdrop, onOpenChange, preventClose]);

  if (!contentRendered || typeof document === 'undefined') {
    return null;
  }

  const state = open ? 'open' : 'closed';

  return createPortal(
    <div ref={wrapperRef} className="vui-dialog" data-state={state}>
      <div
        aria-hidden="true"
        className={classNames('vui-dialog__backdrop', backdropClassName)}
        data-state={state}
        onClick={handleBackdropClick}
      />
      <div
        {...restPanelProps}
        ref={panelRef}
        role={open ? 'dialog' : undefined}
        aria-modal={open ? true : undefined}
        aria-labelledby={open ? titleId : undefined}
        aria-describedby={open ? descriptionId : undefined}
        aria-hidden={open ? undefined : true}
        tabIndex={-1}
        data-state={state}
        className={classNames(
          'vui-dialog__panel',
          panelClassName,
          panelPropsClassName,
        )}
        onKeyDown={handlePanelKeyDown}
      >
        {title ? (
          <h2
            id={titleId}
            className={classNames('vui-dialog__title', titleClassName)}
          >
            {title}
          </h2>
        ) : null}
        {description ? (
          <p
            id={descriptionId}
            className={classNames(
              'vui-dialog__description',
              descriptionClassName,
            )}
          >
            {description}
          </p>
        ) : null}
        {children}
      </div>
    </div>,
    document.body,
  );
}
