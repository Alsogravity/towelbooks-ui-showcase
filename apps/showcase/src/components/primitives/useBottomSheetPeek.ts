import { useLayoutEffect, useState, type RefObject } from 'react';

const DEFAULT_PEEK_GAP_PX = 8;

export type BottomSheetPeekScope = 'host' | 'viewport';

function readHostPeekHeight(
  hostElement: HTMLElement | null,
  peekElement: HTMLElement | null,
  gapPx: number,
) {
  if (!hostElement || !peekElement) {
    return null;
  }

  const hostRect = hostElement.getBoundingClientRect();
  const peekRect = peekElement.getBoundingClientRect();
  const offset = peekRect.bottom - hostRect.top + gapPx;

  return `${Math.max(0, Math.round(offset))}px`;
}

function readViewportPeekHeight(
  peekElement: HTMLElement | null,
  gapPx: number,
) {
  if (!peekElement) {
    return null;
  }

  const peekRect = peekElement.getBoundingClientRect();
  const offset = peekRect.bottom + gapPx;

  return `${Math.max(0, Math.round(offset))}px`;
}

export function useBottomSheetPeek(
  hostElement: HTMLElement | null,
  peekRef: RefObject<HTMLElement | null>,
  {
    fallbackPeekHeight,
    gapPx = DEFAULT_PEEK_GAP_PX,
    peekScope = 'host',
  }: {
    fallbackPeekHeight: string;
    gapPx?: number;
    peekScope?: BottomSheetPeekScope;
  },
) {
  const [peekElement, setPeekElement] = useState<HTMLElement | null>(null);
  const [peekHeight, setPeekHeight] = useState(fallbackPeekHeight);

  useLayoutEffect(() => {
    let frame: number | undefined;

    const syncPeekElement = () => {
      const next = peekRef.current;
      setPeekElement((current) => (current === next ? current : next));
    };

    syncPeekElement();
    queueMicrotask(syncPeekElement);

    if (!peekRef.current) {
      frame = requestAnimationFrame(syncPeekElement);
    }

    return () => {
      if (frame !== undefined) {
        cancelAnimationFrame(frame);
      }
    };
  }, [peekRef]);

  useLayoutEffect(() => {
    if (peekScope === 'host' && !hostElement) {
      return;
    }

    const update = () => {
      const next =
        peekScope === 'viewport'
          ? (readViewportPeekHeight(peekElement, gapPx) ?? fallbackPeekHeight)
          : (readHostPeekHeight(hostElement, peekElement, gapPx) ??
            fallbackPeekHeight);
      setPeekHeight((current) => (current === next ? current : next));
    };

    update();

    let resizeObserver: ResizeObserver | undefined;
    const observed = [hostElement, peekElement].filter(
      (element): element is HTMLElement => element !== null,
    );

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(update);
      for (const element of observed) {
        resizeObserver.observe(element);
      }
    }

    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [fallbackPeekHeight, gapPx, hostElement, peekElement, peekScope]);

  return peekHeight;
}
