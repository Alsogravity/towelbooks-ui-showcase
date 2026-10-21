'use client';

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type AriaRole,
  type AnimationEvent,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefCallback,
} from 'react';
import { createPortal } from 'react-dom';

import { classNames } from '../className';
import {
  computeMenuOverlayPosition,
  getMenuOverlayScrollTargets,
} from './menuOverlayPosition';

export type MenuOverlayPlacement =
  | 'bottom-start'
  | 'bottom-end'
  | 'top-start'
  | 'top-end'
  | 'right-start'
  | 'right-end';
export type MenuOverlayPopupRole =
  'dialog' | 'grid' | 'listbox' | 'menu' | 'tree';
export type MenuOverlayFocusTarget = false | 'content' | 'first';

export const MENU_OVERLAY_EXIT_DURATION_MS = 150;

const overlayExitDurationMs = MENU_OVERLAY_EXIT_DURATION_MS;

const menuOverlayExitAnimationNames = new Set([
  'vui-menu-overlay-out',
  'vui-menu-overlay-out-right',
]);

export interface MenuOverlayCloseOptions {
  returnFocus?: boolean;
}

export interface MenuOverlayActivatorRenderProps {
  activatorProps: {
    'aria-controls': string;
    'aria-expanded': boolean;
    'aria-haspopup': MenuOverlayPopupRole;
    onClick: (event: MouseEvent<HTMLElement>) => void;
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  };
  close: (options?: MenuOverlayCloseOptions) => void;
  contentId: string;
  open: boolean;
  ref: RefCallback<HTMLElement>;
  toggle: () => void;
}

export interface MenuOverlayContentRenderProps {
  close: (options?: MenuOverlayCloseOptions) => void;
  contentId: string;
  open: boolean;
}

export interface MenuOverlayProps {
  activator: (props: MenuOverlayActivatorRenderProps) => ReactNode;
  children: ReactNode | ((props: MenuOverlayContentRenderProps) => ReactNode);
  closeOnSelect?: boolean;
  contentClassName?: string;
  contentId?: string;
  contentProps?: HTMLAttributes<HTMLDivElement>;
  contentRole?: AriaRole;
  defaultOpen?: boolean;
  disabled?: boolean;
  focusOnOpen?: MenuOverlayFocusTarget;
  matchActivatorWidth?: boolean;
  offset?: number;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  placement?: MenuOverlayPlacement;
  portalled?: boolean;
  popupRole?: MenuOverlayPopupRole;
  returnFocusOnClose?: boolean;
}

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function isNodeInside(
  target: EventTarget | null,
  nodes: Array<HTMLElement | null>,
) {
  return target instanceof Node && nodes.some((node) => node?.contains(target));
}

function findFirstFocusable(element: HTMLElement) {
  return element.querySelector<HTMLElement>(focusableSelector);
}

export function MenuOverlay({
  activator,
  children,
  closeOnSelect = false,
  contentClassName,
  contentId,
  contentProps,
  contentRole = 'menu',
  defaultOpen = false,
  disabled = false,
  focusOnOpen = false,
  matchActivatorWidth = true,
  offset = 6,
  onOpenChange,
  open: controlledOpen,
  placement = 'bottom-start',
  portalled = false,
  popupRole = 'menu',
  returnFocusOnClose = true,
}: MenuOverlayProps) {
  const generatedId = useId();
  const resolvedContentId = contentId ?? `${generatedId}-overlay`;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [activatorNode, setActivatorNode] = useState<HTMLElement | null>(null);
  const [contentNode, setContentNode] = useState<HTMLElement | null>(null);
  const [contentRendered, setContentRendered] = useState(
    defaultOpen || controlledOpen === true,
  );
  const wasOpenRef = useRef(false);
  const shouldReturnFocusRef = useRef(false);
  const [portalledStyle, setPortalledStyle] = useState<
    CSSProperties | undefined
  >();
  const [resolvedPlacement, setResolvedPlacement] =
    useState<MenuOverlayPlacement>(placement);
  const open = controlledOpen ?? internalOpen;
  const isControlled = controlledOpen !== undefined;
  const offsetKey =
    offset === 0 || offset === 4 || offset === 8 || offset === 12
      ? String(offset)
      : '6';

  const {
    'aria-hidden': contentAriaHidden,
    className: contentPropsClassName,
    onAnimationEnd: contentPropsOnAnimationEnd,
    onClick: contentPropsOnClick,
    onKeyDown: contentPropsOnKeyDown,
    style: _contentStyle,
    tabIndex: contentPropsTabIndex,
    ...restContentProps
  } = contentProps ?? {};

  const requestOpenChange = useCallback(
    (nextOpen: boolean, options?: MenuOverlayCloseOptions) => {
      if (disabled || nextOpen === open) {
        return;
      }

      if (!nextOpen) {
        shouldReturnFocusRef.current =
          options?.returnFocus ?? returnFocusOnClose;
      }

      if (!isControlled) {
        setInternalOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    },
    [disabled, isControlled, onOpenChange, open, returnFocusOnClose],
  );

  const close = useCallback(
    (options?: MenuOverlayCloseOptions) => {
      requestOpenChange(false, options);
    },
    [requestOpenChange],
  );

  const toggle = useCallback(() => {
    requestOpenChange(!open, { returnFocus: false });
  }, [open, requestOpenChange]);

  useEffect(() => {
    if (open) {
      setContentRendered(true);
    }
  }, [open]);

  useEffect(() => {
    if (open || !contentRendered) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setContentRendered(false);
    }, overlayExitDurationMs);

    return () => window.clearTimeout(timeout);
  }, [contentRendered, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const ownerDocument = activatorNode?.ownerDocument ?? document;

    const handlePointerDown = (event: globalThis.MouseEvent | TouchEvent) => {
      if (!isNodeInside(event.target, [activatorNode, contentNode])) {
        close({ returnFocus: false });
      }
    };

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close({ returnFocus: true });
      }
    };

    ownerDocument.addEventListener('mousedown', handlePointerDown, true);
    ownerDocument.addEventListener('touchstart', handlePointerDown, true);
    ownerDocument.addEventListener('keydown', handleKeyDown);

    return () => {
      ownerDocument.removeEventListener('mousedown', handlePointerDown, true);
      ownerDocument.removeEventListener('touchstart', handlePointerDown, true);
      ownerDocument.removeEventListener('keydown', handleKeyDown);
    };
  }, [activatorNode, close, contentNode, open]);

  useEffect(() => {
    if (wasOpenRef.current && !open && shouldReturnFocusRef.current) {
      activatorNode?.focus();
      shouldReturnFocusRef.current = false;
    }

    wasOpenRef.current = open;
  }, [activatorNode, open]);

  useEffect(() => {
    if (!open || !contentNode || !focusOnOpen) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      if (focusOnOpen === 'content') {
        contentNode.focus({ preventScroll: true });
        return;
      }

      findFirstFocusable(contentNode)?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [contentNode, focusOnOpen, open]);

  useEffect(() => {
    if (!portalled) {
      setResolvedPlacement(placement);
    }
  }, [placement, portalled]);

  useLayoutEffect(() => {
    if (!portalled || !open || !activatorNode || !contentNode) {
      setPortalledStyle(undefined);
      return;
    }

    const updatePosition = () => {
      const activatorRect = activatorNode.getBoundingClientRect();
      const contentRect = contentNode.getBoundingClientRect();
      const contentStyles = window.getComputedStyle(contentNode);
      const borderBlockSize =
        (Number.parseFloat(contentStyles.borderTopWidth) || 0) +
        (Number.parseFloat(contentStyles.borderBottomWidth) || 0);
      const { resolvedPlacement: nextPlacement, style } =
        computeMenuOverlayPosition({
          activatorRect,
          contentHeight: Math.max(
            contentRect.height,
            contentNode.scrollHeight + borderBlockSize,
          ),
          contentWidth: contentRect.width,
          matchActivatorWidth,
          offsetKey,
          placement,
        });

      setResolvedPlacement(nextPlacement);
      setPortalledStyle({
        ...style,
        visibility: 'visible',
      });
    };

    updatePosition();

    const scrollTargets = getMenuOverlayScrollTargets(activatorNode);

    for (const target of scrollTargets) {
      target.addEventListener('scroll', updatePosition, {
        capture: true,
        passive: true,
      });
    }

    window.addEventListener('resize', updatePosition, { passive: true });

    return () => {
      for (const target of scrollTargets) {
        target.removeEventListener('scroll', updatePosition, { capture: true });
      }

      window.removeEventListener('resize', updatePosition);
    };
  }, [
    activatorNode,
    contentNode,
    matchActivatorWidth,
    offsetKey,
    open,
    placement,
    portalled,
  ]);

  const handleActivatorClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      event.preventDefault();
      toggle();
    },
    [toggle],
  );

  const handleActivatorKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (
        event.key === 'ArrowDown' ||
        event.key === 'ArrowUp' ||
        event.key === 'Enter' ||
        event.key === ' '
      ) {
        event.preventDefault();
        requestOpenChange(true, { returnFocus: false });
      }

      if (event.key === 'Escape' && open) {
        event.preventDefault();
        close({ returnFocus: true });
      }
    },
    [close, open, requestOpenChange],
  );

  const handleContentClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      contentPropsOnClick?.(event);

      if (closeOnSelect) {
        close({ returnFocus: true });
      }
    },
    [close, closeOnSelect, contentPropsOnClick],
  );

  const handleContentKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      contentPropsOnKeyDown?.(event);
    },
    [contentPropsOnKeyDown],
  );

  const handleContentAnimationEnd = useCallback(
    (event: AnimationEvent<HTMLDivElement>) => {
      contentPropsOnAnimationEnd?.(event);

      if (
        event.target !== event.currentTarget ||
        !menuOverlayExitAnimationNames.has(event.animationName)
      ) {
        return;
      }

      if (!open) {
        setContentRendered(false);
      }
    },
    [contentPropsOnAnimationEnd, open],
  );

  const activatorRenderProps = useMemo<MenuOverlayActivatorRenderProps>(
    () => ({
      activatorProps: {
        'aria-controls': resolvedContentId,
        'aria-expanded': open,
        'aria-haspopup': popupRole,
        onClick: handleActivatorClick,
        onKeyDown: handleActivatorKeyDown,
      },
      close,
      contentId: resolvedContentId,
      open,
      ref: setActivatorNode,
      toggle,
    }),
    [
      close,
      handleActivatorClick,
      handleActivatorKeyDown,
      open,
      popupRole,
      resolvedContentId,
      toggle,
    ],
  );

  const renderedContent =
    typeof children === 'function'
      ? children({ close, contentId: resolvedContentId, open })
      : children;

  const activePlacement = portalled ? resolvedPlacement : placement;

  const overlayContent = contentRendered && (
    <div
      {...restContentProps}
      id={resolvedContentId}
      ref={setContentNode}
      role={open ? contentRole : undefined}
      aria-hidden={open ? contentAriaHidden : true}
      data-match-activator-width={matchActivatorWidth}
      data-offset={offsetKey}
      data-placement={activePlacement}
      data-portalled={portalled ? 'true' : undefined}
      data-state={open ? 'open' : 'closed'}
      className={classNames(
        'vui-menu-overlay__content',
        portalled && 'vui-menu-overlay__content--portalled',
        contentClassName,
        contentPropsClassName,
      )}
      style={{
        ...(portalled
          ? {
              ...portalledStyle,
              visibility: portalledStyle ? portalledStyle.visibility : 'hidden',
            }
          : undefined),
        ..._contentStyle,
      }}
      tabIndex={
        focusOnOpen === 'content'
          ? (contentPropsTabIndex ?? -1)
          : contentPropsTabIndex
      }
      onAnimationEnd={handleContentAnimationEnd}
      onClick={handleContentClick}
      onKeyDown={handleContentKeyDown}
    >
      {renderedContent}
    </div>
  );

  return (
    <span
      className="vui-menu-overlay"
      data-match-activator-width={matchActivatorWidth}
    >
      {activator(activatorRenderProps)}
      {overlayContent &&
        (portalled && typeof document !== 'undefined'
          ? createPortal(overlayContent, document.body)
          : overlayContent)}
    </span>
  );
}
