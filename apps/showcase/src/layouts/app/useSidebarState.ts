import { MENU_OVERLAY_EXIT_DURATION_MS } from '@towelbooks/ui';
import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';

import {
  useIsDesktopShellViewport,
  useIsWideDesktopShellViewport,
} from './shellViewport';
import { useSidebarBehaviorPreference } from '../../features/preferences/sidebarBehavior';

function isPointerStillOverSidebar(
  currentTarget: HTMLElement,
  relatedTarget: EventTarget | null,
) {
  // The pointer left the document entirely — it moved off the screen or onto
  // browser chrome. There is nothing left to keep the sidebar open for, so
  // always collapse, no matter which edge it exited through.
  if (relatedTarget === null) {
    return false;
  }

  // The pointer moved onto a descendant, so it is still inside the sidebar.
  if (relatedTarget instanceof Node && currentTarget.contains(relatedTarget)) {
    return true;
  }

  // A navigation can fire a transient `mouseleave` while the cursor has not
  // actually moved off the sidebar. `:hover` stays true in that case and turns
  // false the instant the pointer really leaves, so it is the authoritative
  // signal. (JSDOM never sets `:hover`, which collapses the sidebar on leave —
  // the behavior the tests assert.)
  return (
    typeof currentTarget.matches === 'function' &&
    currentTarget.matches(':hover')
  );
}

export function useSidebarState() {
  const { sidebarBehaviorPreference } = useSidebarBehaviorPreference();
  const isDesktopShellViewport = useIsDesktopShellViewport();
  const isWideDesktopShellViewport = useIsWideDesktopShellViewport();
  const [isHovered, setIsHovered] = useState(false);
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuCloseTimeoutRef = useRef<number | null>(null);
  const hoverCollapseFrameRef = useRef<number | null>(null);
  const isIntermediateDesktopShellViewport =
    isDesktopShellViewport && !isWideDesktopShellViewport;
  const effectiveSidebarBehaviorPreference =
    isIntermediateDesktopShellViewport || !isDesktopShellViewport
      ? 'collapsed'
      : sidebarBehaviorPreference;

  useEffect(
    () => () => {
      if (menuCloseTimeoutRef.current !== null) {
        window.clearTimeout(menuCloseTimeoutRef.current);
      }

      if (hoverCollapseFrameRef.current !== null) {
        window.cancelAnimationFrame(hoverCollapseFrameRef.current);
      }
    },
    [],
  );

  const clearMenuCloseTimeout = () => {
    if (menuCloseTimeoutRef.current !== null) {
      window.clearTimeout(menuCloseTimeoutRef.current);
      menuCloseTimeoutRef.current = null;
    }
  };

  const clearHoverCollapseFrame = () => {
    if (hoverCollapseFrameRef.current !== null) {
      window.cancelAnimationFrame(hoverCollapseFrameRef.current);
      hoverCollapseFrameRef.current = null;
    }
  };

  const setSidebarMenuOpen = (isOpen: boolean) => {
    clearMenuCloseTimeout();

    if (isOpen) {
      setIsMenuOpen(true);
      return;
    }

    menuCloseTimeoutRef.current = window.setTimeout(() => {
      setIsMenuOpen(false);
      menuCloseTimeoutRef.current = null;
    }, MENU_OVERLAY_EXIT_DURATION_MS);
  };

  const collapseSidebarAfterMenuClose = () => {
    clearHoverCollapseFrame();
    hoverCollapseFrameRef.current = window.requestAnimationFrame(() => {
      setIsHovered(false);
      hoverCollapseFrameRef.current = null;
    });
  };

  return {
    collapseSidebar: (event?: MouseEvent<HTMLElement>) => {
      clearHoverCollapseFrame();

      const currentTarget = event?.currentTarget ?? null;
      const relatedTarget = event?.relatedTarget ?? null;

      hoverCollapseFrameRef.current = window.requestAnimationFrame(() => {
        hoverCollapseFrameRef.current = null;

        if (
          currentTarget &&
          isPointerStillOverSidebar(currentTarget, relatedTarget)
        ) {
          return;
        }

        setIsHovered(false);
      });
    },
    collapseSidebarAfterMenuClose,
    expandSidebar: () => setIsHovered(true),
    isCollapsed:
      effectiveSidebarBehaviorPreference === 'expanded'
        ? false
        : effectiveSidebarBehaviorPreference === 'collapsed'
          ? true
          : !isHovered && !isFocusWithin && !isMenuOpen,
    isPinnedExpanded: effectiveSidebarBehaviorPreference === 'expanded',
    setSidebarMenuOpen,
    setSidebarFocusWithin: setIsFocusWithin,
  };
}
