import {
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import { lockScrollParents } from './lockScrollParents';
import { Portal } from './Portal';
import { useBottomSheetPeek } from './useBottomSheetPeek';
import { useHostElement } from './useHostElement';
import { MODAL_OVERLAY_SCRIM_CLASS_NAME } from './modal/modalOverlayStyles';

const DEFAULT_EXIT_ANIMATION_DURATION_MS = 200;
const DEFAULT_PEEK_HEIGHT = '2.5rem';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

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

function focusWithoutScroll(element: HTMLElement | undefined) {
  element?.focus({ preventScroll: true });
}

export type AnchoredBottomSheetOverlayScope = 'host' | 'viewport';

export interface AnchoredBottomSheetProps {
  /** Dialog panel, slide-over panel, or page region that owns the sheet overlay. */
  hostRef: RefObject<HTMLElement | null>;
  /** Optional element marking how far up the sheet may grow (e.g. below the avatar). */
  peekRef?: RefObject<HTMLElement | null>;
  peekGapPx?: number;
  children:
    | ReactNode
    | ((controls: { close: (afterClose?: () => void) => void }) => ReactNode);
  onClose: () => void;
  fallbackPeekHeight?: string;
  overlayScope?: AnchoredBottomSheetOverlayScope;
  /** Must match the panel close animation duration in CSS. */
  exitAnimationDurationMs?: number;
  panelClassName?: string;
  titleId?: string;
}

export function AnchoredBottomSheet({
  hostRef,
  peekRef,
  peekGapPx,
  children,
  onClose,
  fallbackPeekHeight = DEFAULT_PEEK_HEIGHT,
  overlayScope = 'host',
  exitAnimationDurationMs = DEFAULT_EXIT_ANIMATION_DURATION_MS,
  panelClassName = '',
  titleId: titleIdProp,
}: AnchoredBottomSheetProps) {
  const generatedTitleId = useId();
  const titleId = titleIdProp ?? generatedTitleId;
  const isViewportScope = overlayScope === 'viewport';
  const [isClosing, setIsClosing] = useState(false);
  const afterCloseRef = useRef<(() => void) | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const didInitialFocusRef = useRef(false);
  const hostElement = useHostElement(hostRef);
  const peekHeight = useBottomSheetPeek(
    hostElement,
    peekRef ?? { current: null },
    {
      fallbackPeekHeight,
      gapPx: peekGapPx,
      peekScope: isViewportScope ? 'viewport' : 'host',
    },
  );

  const close = useCallback(
    (afterClose?: () => void) => {
      setIsClosing((wasClosing) => {
        if (afterClose && afterCloseRef.current === null) {
          afterCloseRef.current = afterClose;
        }

        if (wasClosing) {
          return wasClosing;
        }

        const prefersReducedMotion =
          typeof window !== 'undefined' &&
          typeof window.matchMedia === 'function' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
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
    if (isViewportScope) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }

    const unlockScroll = lockScrollParents(hostElement);

    return unlockScroll;
  }, [hostElement, isViewportScope]);

  useEffect(() => {
    const canFocus = isViewportScope || hostElement;

    if (!canFocus || didInitialFocusRef.current) {
      return;
    }

    didInitialFocusRef.current = true;
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const focusableElements = getFocusableElements(panelRef.current);
    focusWithoutScroll(focusableElements[0]);

    if (!isFocusInside(panelRef.current)) {
      focusWithoutScroll(panelRef.current ?? undefined);
    }
  }, [hostElement, isViewportScope]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }

      const target = previousFocusRef.current;

      if (target?.isConnected) {
        target.focus({ preventScroll: true });
      }
    };
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const focusableElements = getFocusableElements(panelRef.current);

    if (focusableElements.length === 0) {
      event.preventDefault();
      focusWithoutScroll(panelRef.current ?? undefined);
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements.at(-1);

    if (!firstElement || !lastElement) {
      event.preventDefault();
      focusWithoutScroll(panelRef.current ?? undefined);
      return;
    }

    const activeElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    if (event.shiftKey) {
      if (!activeElement || activeElement === firstElement) {
        event.preventDefault();
        focusWithoutScroll(lastElement);
      }

      return;
    }

    if (!activeElement || activeElement === lastElement) {
      event.preventDefault();
      focusWithoutScroll(firstElement);
    }
  };

  if (!isViewportScope && !hostElement) {
    return null;
  }

  // The host-scope overlay clips its content so the entrance/exit slide (the
  // panel parked at translateY(100%)) can never spill below the host and extend
  // a scrollable host's overflow, which reflows mid-animation.
  const overlayClassName = isViewportScope
    ? 'fixed inset-0 z-30 flex flex-col justify-end'
    : 'absolute inset-0 z-20 flex flex-col justify-end overflow-hidden';

  // Host-scope panels pin top (inline, below) and bottom so the panel height is
  // always derived from the host geometry. A percentage height — or an `auto`
  // height if `top` were left unset — can resolve against the (taller) sheet
  // content, which makes the entrance animation overshoot before it settles.
  const panelPositionClassName = isViewportScope
    ? 'app-bottom-sheet-panel fixed inset-x-0 bottom-0 z-10 flex max-h-[calc(100dvh-var(--app-bottom-sheet-peek))] w-full flex-col overflow-hidden rounded-t-2xl rounded-b-none bg-paper pb-[env(safe-area-inset-bottom)] shadow-2xl outline-none'
    : 'app-bottom-sheet-panel absolute inset-x-0 bottom-0 z-10 flex w-full flex-col overflow-hidden rounded-t-2xl bg-paper shadow-2xl outline-none';

  return (
    <Portal container={isViewportScope ? undefined : hostElement}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-state={isClosing ? 'closed' : 'open'}
        data-overlay-scope={overlayScope}
        data-testid="anchored-bottom-sheet-overlay"
        className={overlayClassName}
        style={{ ['--app-bottom-sheet-peek' as string]: peekHeight }}
        onKeyDown={handleKeyDown}
      >
        <div
          aria-hidden="true"
          data-testid="anchored-bottom-sheet-backdrop"
          className={`absolute inset-0 ${MODAL_OVERLAY_SCRIM_CLASS_NAME}`}
          data-state={isClosing ? 'closed' : 'open'}
          onMouseDown={(event) => {
            event.preventDefault();
            close();
          }}
        />
        <div
          ref={panelRef}
          tabIndex={-1}
          data-state={isClosing ? 'closed' : 'open'}
          className={[panelPositionClassName, panelClassName]
            .filter(Boolean)
            .join(' ')}
          style={
            isViewportScope
              ? {
                  height: 'calc(100dvh - var(--app-bottom-sheet-peek))',
                }
              : { top: peekHeight }
          }
        >
          {typeof children === 'function' ? children({ close }) : children}
        </div>
      </div>
    </Portal>
  );
}
