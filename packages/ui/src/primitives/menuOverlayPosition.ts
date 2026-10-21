import type { CSSProperties } from 'react';

import type { MenuOverlayPlacement } from './MenuOverlay';

const VIEWPORT_PADDING_PX = 8;

const OFFSET_PX: Record<string, number> = {
  '0': 0,
  '4': 4,
  '6': 6,
  '8': 8,
  '12': 12,
};

export interface MenuOverlayPositionInput {
  activatorRect: Pick<DOMRect, 'top' | 'left' | 'right' | 'bottom' | 'width'>;
  contentHeight: number;
  contentWidth: number;
  matchActivatorWidth: boolean;
  offsetKey: string;
  placement: MenuOverlayPlacement;
  viewportHeight?: number;
  viewportWidth?: number;
}

export interface MenuOverlayPositionResult {
  resolvedPlacement: MenuOverlayPlacement;
  style: CSSProperties;
}

function flipVerticalPlacement(
  placement: MenuOverlayPlacement,
): MenuOverlayPlacement {
  if (placement.startsWith('bottom')) {
    return placement.replace('bottom', 'top') as MenuOverlayPlacement;
  }

  if (placement.startsWith('top')) {
    return placement.replace('top', 'bottom') as MenuOverlayPlacement;
  }

  return placement;
}

function flipHorizontalPlacement(
  placement: MenuOverlayPlacement,
): MenuOverlayPlacement {
  if (placement.endsWith('-start')) {
    return placement.replace('-start', '-end') as MenuOverlayPlacement;
  }

  if (placement.endsWith('-end')) {
    return placement.replace('-end', '-start') as MenuOverlayPlacement;
  }

  return placement;
}

function getHorizontalPosition(
  placement: MenuOverlayPlacement,
  activatorRect: MenuOverlayPositionInput['activatorRect'],
  width: number,
): number {
  if (placement.startsWith('right')) {
    return activatorRect.right;
  }

  return placement.endsWith('-end')
    ? activatorRect.right - width
    : activatorRect.left;
}

export function computeMenuOverlayPosition({
  activatorRect,
  contentHeight,
  contentWidth,
  matchActivatorWidth,
  offsetKey,
  placement,
  viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0,
  viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 0,
}: MenuOverlayPositionInput): MenuOverlayPositionResult {
  const offsetPx = OFFSET_PX[offsetKey] ?? 6;
  const viewportMaxWidth = Math.max(0, viewportWidth - VIEWPORT_PADDING_PX * 2);
  const width = Math.min(
    matchActivatorWidth ? activatorRect.width : contentWidth,
    viewportMaxWidth,
  );
  const spaceBelow = Math.max(
    0,
    viewportHeight - activatorRect.bottom - offsetPx - VIEWPORT_PADDING_PX,
  );
  const spaceAbove = Math.max(
    0,
    activatorRect.top - offsetPx - VIEWPORT_PADDING_PX,
  );
  let resolvedPlacement = placement;

  if (
    placement.startsWith('bottom') &&
    spaceBelow < contentHeight &&
    spaceAbove > spaceBelow
  ) {
    resolvedPlacement = flipVerticalPlacement(resolvedPlacement);
  } else if (
    placement.startsWith('top') &&
    spaceAbove < contentHeight &&
    spaceBelow > spaceAbove
  ) {
    resolvedPlacement = flipVerticalPlacement(resolvedPlacement);
  }

  const availableHeight = resolvedPlacement.startsWith('bottom')
    ? spaceBelow
    : resolvedPlacement.startsWith('top')
      ? spaceAbove
      : viewportHeight - VIEWPORT_PADDING_PX * 2;
  // Avoid a one-pixel scrollbar when fractional geometry leaves the content
  // just below the next CSS pixel.
  const maxHeight = Math.ceil(Math.min(contentHeight, availableHeight));

  let top = 0;
  let left = getHorizontalPosition(resolvedPlacement, activatorRect, width);

  if (resolvedPlacement.startsWith('bottom')) {
    top = activatorRect.bottom + offsetPx;
  } else if (resolvedPlacement.startsWith('top')) {
    top = activatorRect.top - offsetPx - maxHeight;
  } else if (resolvedPlacement.startsWith('right')) {
    top = resolvedPlacement.endsWith('-end')
      ? activatorRect.bottom - maxHeight
      : activatorRect.top;
    left += offsetPx;
  }

  const overflowRight = left + width > viewportWidth - VIEWPORT_PADDING_PX;
  const overflowLeft = left < VIEWPORT_PADDING_PX;

  if (
    !resolvedPlacement.startsWith('right') &&
    overflowRight &&
    !overflowLeft
  ) {
    resolvedPlacement = flipHorizontalPlacement(resolvedPlacement);
    left = getHorizontalPosition(resolvedPlacement, activatorRect, width);
  } else if (
    !resolvedPlacement.startsWith('right') &&
    overflowLeft &&
    !overflowRight
  ) {
    resolvedPlacement = flipHorizontalPlacement(resolvedPlacement);
    left = getHorizontalPosition(resolvedPlacement, activatorRect, width);
  }

  left = Math.max(
    VIEWPORT_PADDING_PX,
    Math.min(left, viewportWidth - width - VIEWPORT_PADDING_PX),
  );

  top = Math.max(
    VIEWPORT_PADDING_PX,
    Math.min(top, viewportHeight - maxHeight - VIEWPORT_PADDING_PX),
  );

  return {
    resolvedPlacement,
    style: {
      left,
      maxHeight,
      maxWidth: viewportMaxWidth,
      minWidth: matchActivatorWidth ? width : undefined,
      position: 'fixed',
      top,
      width: matchActivatorWidth ? width : undefined,
      zIndex: 60,
    },
  };
}

export type MenuOverlayScrollTarget = HTMLElement | Window;

export function getMenuOverlayScrollParents(
  element: HTMLElement | null,
): HTMLElement[] {
  const parents: HTMLElement[] = [];

  if (!element || typeof window === 'undefined') {
    return parents;
  }

  let parent = element.parentElement;

  while (parent) {
    const style = window.getComputedStyle(parent);
    const overflow = `${style.overflow} ${style.overflowX} ${style.overflowY}`;

    if (/(auto|scroll|overlay)/.test(overflow)) {
      parents.push(parent);
    }

    parent = parent.parentElement;
  }

  return parents;
}

/** Scrollable ancestors plus viewport/root scroll for fixed portalled overlays. */
export function getMenuOverlayScrollTargets(
  element: HTMLElement | null,
): MenuOverlayScrollTarget[] {
  const targets: MenuOverlayScrollTarget[] =
    getMenuOverlayScrollParents(element);

  if (typeof window !== 'undefined') {
    targets.push(window);
  }

  return targets;
}
