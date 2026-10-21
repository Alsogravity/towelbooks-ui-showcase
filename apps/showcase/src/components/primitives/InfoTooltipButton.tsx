import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

import { Button } from './Button';
import { Dialog, DialogBody } from './Dialog';

import type { MenuOverlayPlacement } from '@towelbooks/ui';

export interface InfoTooltipButtonProps {
  ariaLabel: string;
  content?: ReactNode;
  dialogCloseLabel?: string;
  dialogTitle?: string;
  mode?: 'tooltip' | 'dialog';
  onClick?: () => void;
  placement?: MenuOverlayPlacement;
  tooltipId?: string;
}

const infoButtonClassName =
  'bg-transparent text-ink-3 hover:bg-transparent hover:text-ink focus:bg-transparent focus:text-ink active:bg-transparent';

const infoButtonStyle = { transition: 'none' } as const;

const tooltipBaseClassName =
  'z-50 w-52 max-w-[calc(100vw-2rem)] rounded-2xl border border-rule/70 bg-paper px-3.5 py-3 text-left app-text-body-sm text-ink-2 shadow-md';

function getPointerEdgeClass(placement: MenuOverlayPlacement) {
  switch (placement) {
    case 'bottom-end':
    case 'bottom-start':
      return 'top-0 -translate-y-1/2 border-l border-t';
    case 'top-end':
    case 'top-start':
      return 'bottom-0 translate-y-1/2 border-r border-b';
    case 'right-end':
    case 'right-start':
    default:
      return 'left-0 -translate-x-1/2 border-b border-l';
  }
}

function chooseAutoPlacement(
  preferredPlacement: MenuOverlayPlacement,
  activatorRect: DOMRect,
  tooltipRect: DOMRect,
) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const fitsRight =
    activatorRect.right + 12 + tooltipRect.width <= viewportWidth - 16;
  const fitsBottom =
    activatorRect.bottom + 12 + tooltipRect.height <= viewportHeight - 16;
  const fitsTop = activatorRect.top - 12 - tooltipRect.height >= 16;

  if (
    preferredPlacement === 'right-start' ||
    preferredPlacement === 'right-end'
  ) {
    if (fitsRight) {
      return preferredPlacement;
    }

    if (fitsBottom) {
      return 'bottom-start';
    }

    if (fitsTop) {
      return 'top-start';
    }
  }

  if (preferredPlacement.startsWith('bottom') && fitsBottom) {
    return preferredPlacement;
  }

  if (preferredPlacement.startsWith('top') && fitsTop) {
    return preferredPlacement;
  }

  if (fitsRight) {
    return 'right-start';
  }

  if (fitsBottom) {
    return 'bottom-start';
  }

  if (fitsTop) {
    return 'top-start';
  }

  return preferredPlacement;
}

function calculateFixedStyles(
  activatorRect: DOMRect,
  tooltipRect: DOMRect,
  placement: MenuOverlayPlacement,
  gap = 12,
): { tooltipStyle: CSSProperties; pointerStyle: CSSProperties } {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const padding = 16;
  const halfPointer = 6;

  let top = 0;
  let left = 0;

  switch (placement) {
    case 'bottom-start':
      top = activatorRect.bottom + gap;
      left = activatorRect.left;
      break;
    case 'bottom-end':
      top = activatorRect.bottom + gap;
      left = activatorRect.right - tooltipRect.width;
      break;
    case 'top-start':
      top = activatorRect.top - tooltipRect.height - gap;
      left = activatorRect.left;
      break;
    case 'top-end':
      top = activatorRect.top - tooltipRect.height - gap;
      left = activatorRect.right - tooltipRect.width;
      break;
    case 'right-start':
      top = activatorRect.top;
      left = activatorRect.right + gap;
      break;
    case 'right-end':
      top = activatorRect.bottom - tooltipRect.height;
      left = activatorRect.right + gap;
      break;
  }

  left = Math.max(
    padding,
    Math.min(left, viewportWidth - tooltipRect.width - padding),
  );
  top = Math.max(
    padding,
    Math.min(top, viewportHeight - tooltipRect.height - padding),
  );

  const activatorCenterX = activatorRect.left + activatorRect.width / 2;
  const activatorCenterY = activatorRect.top + activatorRect.height / 2;

  const pointerStyle: CSSProperties = {};

  if (placement.startsWith('bottom') || placement.startsWith('top')) {
    const rawLeft = activatorCenterX - left - halfPointer;
    pointerStyle.left = Math.max(
      padding,
      Math.min(rawLeft, tooltipRect.width - padding - 12),
    );
  } else if (placement.startsWith('right')) {
    const rawTop = activatorCenterY - top - halfPointer;
    pointerStyle.top = Math.max(
      padding,
      Math.min(rawTop, tooltipRect.height - padding - 12),
    );
  }

  return {
    tooltipStyle: { position: 'fixed', top, left },
    pointerStyle,
  };
}

export const InfoTooltipButton = forwardRef<
  HTMLButtonElement,
  InfoTooltipButtonProps
>(
  (
    {
      ariaLabel,
      content,
      dialogCloseLabel = 'Close',
      dialogTitle,
      mode = 'tooltip',
      onClick,
      placement = 'right-start',
      tooltipId,
    },
    ref,
  ) => {
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const tooltipRef = useRef<HTMLSpanElement | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [isPinned, setIsPinned] = useState(false);
    const [resolvedPlacement, setResolvedPlacement] =
      useState<MenuOverlayPlacement>(placement);
    const [tooltipStyle, setTooltipStyle] = useState<CSSProperties>({
      position: 'fixed',
    });
    const [pointerStyle, setPointerStyle] = useState<CSSProperties>({});
    const isOpen = Boolean(content) && (isHovered || isFocused || isPinned);

    useImperativeHandle(ref, () => buttonRef.current as HTMLButtonElement, []);

    useLayoutEffect(() => {
      if (!isOpen || !buttonRef.current || !tooltipRef.current) {
        return;
      }

      const activatorRect = buttonRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const nextPlacement = chooseAutoPlacement(
        placement,
        activatorRect,
        tooltipRect,
      );

      if (nextPlacement !== resolvedPlacement) {
        setResolvedPlacement(nextPlacement);
      }

      const { tooltipStyle: nextTooltipStyle, pointerStyle: nextPointerStyle } =
        calculateFixedStyles(activatorRect, tooltipRect, nextPlacement);

      setTooltipStyle(nextTooltipStyle);
      setPointerStyle(nextPointerStyle);
    }, [isOpen, placement, resolvedPlacement]);

    useLayoutEffect(() => {
      setResolvedPlacement(placement);
    }, [placement]);

    const closeTooltip = () => {
      setIsHovered(false);
      setIsFocused(false);
      setIsPinned(false);
    };

    if (!content) {
      return (
        <Button
          ref={buttonRef}
          aria-label={ariaLabel}
          icon="info"
          iconSize={14}
          size="sm"
          title=""
          variant="icon"
          className={infoButtonClassName}
          style={infoButtonStyle}
          onClick={onClick}
        />
      );
    }

    const handleBlur = (event: FocusEvent<HTMLSpanElement>) => {
      if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
        return;
      }

      closeTooltip();
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key !== 'Escape') {
        return;
      }

      event.preventDefault();
      closeTooltip();
      event.currentTarget.blur();
    };

    if (mode === 'dialog') {
      return (
        <>
          <Button
            ref={buttonRef}
            aria-label={ariaLabel}
            icon="info"
            iconSize={14}
            size="sm"
            title=""
            variant="icon"
            className={infoButtonClassName}
            style={infoButtonStyle}
            onClick={() => {
              setIsDialogOpen(true);
              onClick?.();
            }}
          />
          {isDialogOpen && content ? (
            <Dialog
              title={dialogTitle ?? ariaLabel}
              onClose={() => setIsDialogOpen(false)}
              getReturnFocusElement={() => buttonRef.current}
              closeButtonLabel={dialogCloseLabel}
              showCloseButton
            >
              <DialogBody>{content}</DialogBody>
            </Dialog>
          ) : null}
        </>
      );
    }

    const pointerEdgeClass = getPointerEdgeClass(resolvedPlacement);

    return (
      <span
        className="relative inline-flex max-w-full"
        onBlur={handleBlur}
        onFocus={() => setIsFocused(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Button
          ref={buttonRef}
          aria-describedby={tooltipId}
          aria-label={ariaLabel}
          icon="info"
          iconSize={14}
          size="sm"
          title=""
          variant="icon"
          className={infoButtonClassName}
          style={infoButtonStyle}
          onClick={() => {
            setIsPinned((current) => !current);
            onClick?.();
          }}
          onKeyDown={handleKeyDown}
        />
        {isOpen
          ? createPortal(
              <span
                ref={tooltipRef}
                id={tooltipId}
                role="tooltip"
                data-placement={resolvedPlacement}
                data-state="open"
                style={tooltipStyle}
                className={tooltipBaseClassName}
              >
                <span
                  aria-hidden="true"
                  style={pointerStyle}
                  className={`absolute h-3 w-3 rotate-45 rounded-[2px] border-rule/70 bg-paper ${pointerEdgeClass}`}
                />
                <span className="relative block">{content}</span>
              </span>,
              document.body,
            )
          : null}
      </span>
    );
  },
);

InfoTooltipButton.displayName = 'InfoTooltipButton';
