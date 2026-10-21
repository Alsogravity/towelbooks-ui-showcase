import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';

import { assignRef } from '../assignRef';
import { Portal } from '../Portal';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

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

function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) {
    return [];
  }

  return [
    ...container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ].filter(
    (element) =>
      !element.hasAttribute('disabled') &&
      element.getAttribute('aria-hidden') !== 'true',
  );
}

function isFocusInside(container: HTMLElement | null) {
  return (
    container !== null &&
    document.activeElement instanceof HTMLElement &&
    container.contains(document.activeElement)
  );
}

function restoreFocus(target: HTMLElement | null) {
  if (!target || !target.isConnected) {
    return;
  }

  target.focus();

  if (document.activeElement !== target) {
    window.setTimeout(() => {
      if (target.isConnected) {
        target.focus();
      }
    }, 0);
  }
}

function prefersReducedMotion() {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export type ModalInitialFocus = 'first-focusable' | 'panel';

export interface ModalLayerControls {
  close: (afterClose?: () => void) => void;
}

export interface ModalLayerProps {
  children: ReactNode | ((controls: ModalLayerControls) => ReactNode);
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  exitAnimationDurationMs: number;
  getReturnFocusElement?: () => HTMLElement | null;
  initialFocus?: ModalInitialFocus;
  onClose: () => void;
  onOpenAutoFocus?: () => void;
  overlayClassName: string;
  panelClassName: string;
  panelRef?: Ref<HTMLDivElement>;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

export function ModalLayer({
  children,
  closeOnBackdrop = true,
  closeOnEscape = true,
  exitAnimationDurationMs,
  getReturnFocusElement,
  initialFocus = 'first-focusable',
  onClose,
  onOpenAutoFocus,
  overlayClassName,
  panelClassName,
  panelRef: panelRefProp,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
}: ModalLayerProps) {
  const [isClosing, setIsClosing] = useState(false);
  const afterCloseRef = useRef<(() => void) | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const localPanelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const initialOnOpenAutoFocusRef = useRef(onOpenAutoFocus);
  const initialGetReturnFocusElementRef = useRef(getReturnFocusElement);
  const initialFocusRef = useRef(initialFocus);

  const close = useCallback(
    (afterClose?: () => void) => {
      setIsClosing((wasClosing) => {
        if (afterClose && afterCloseRef.current === null) {
          afterCloseRef.current = afterClose;
        }

        if (wasClosing) {
          return wasClosing;
        }

        if (prefersReducedMotion()) {
          onClose();
          afterCloseRef.current?.();
          return wasClosing;
        }

        closeTimerRef.current = window.setTimeout(() => {
          onClose();
          afterCloseRef.current?.();
        }, exitAnimationDurationMs);

        return true;
      });
    },
    [exitAnimationDurationMs, onClose],
  );

  useEffect(() => {
    const onOpenAutoFocusOnce = initialOnOpenAutoFocusRef.current;
    const getReturnFocusElementOnce = initialGetReturnFocusElementRef.current;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    onOpenAutoFocusOnce?.();

    if (
      initialFocusRef.current === 'first-focusable' &&
      !isFocusInside(localPanelRef.current)
    ) {
      getFocusableElements(localPanelRef.current)[0]?.focus();
    }

    if (!isFocusInside(localPanelRef.current)) {
      localPanelRef.current?.focus();
    }

    lockBodyScroll();

    return () => {
      unlockBodyScroll();

      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }

      const target = getReturnFocusElementOnce?.() ?? previousFocusRef.current;
      restoreFocus(target);
    };
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      if (!closeOnEscape) {
        return;
      }

      event.preventDefault();
      close();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const focusableElements = getFocusableElements(localPanelRef.current);

    if (focusableElements.length === 0) {
      event.preventDefault();
      localPanelRef.current?.focus();
      return;
    }

    const firstElement = focusableElements[0]!;
    const lastElement = focusableElements[focusableElements.length - 1]!;
    const activeElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    if (event.shiftKey) {
      if (!activeElement || activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }

      return;
    }

    if (!activeElement || activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  const state = isClosing ? 'closed' : 'open';

  return (
    <Portal>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        data-state={state}
        className={overlayClassName}
        onKeyDown={handleKeyDown}
        onMouseDown={(event) => {
          if (closeOnBackdrop && event.target === event.currentTarget) {
            event.preventDefault();
            close();
          }
        }}
      >
        <div
          ref={(node) => {
            (localPanelRef as { current: HTMLDivElement | null }).current =
              node;
            assignRef(panelRefProp, node);
          }}
          tabIndex={-1}
          data-state={state}
          className={panelClassName}
        >
          {typeof children === 'function' ? children({ close }) : children}
        </div>
      </div>
    </Portal>
  );
}
