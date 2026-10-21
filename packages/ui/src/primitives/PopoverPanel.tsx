import { useId, type HTMLAttributes, type ReactNode } from 'react';

import { Button } from './Button';
import {
  MenuOverlay,
  type MenuOverlayActivatorRenderProps,
  type MenuOverlayFocusTarget,
  type MenuOverlayPlacement,
} from './MenuOverlay';
import { classNames } from '../className';

type PopoverPanelRenderControls = {
  close: () => void;
  open: boolean;
};

export type PopoverPanelSize = 'sm' | 'md' | 'lg' | 'auto';

export interface PopoverPanelProps {
  activator: (props: MenuOverlayActivatorRenderProps) => ReactNode;
  bodyClassName?: string;
  children: ReactNode | ((controls: PopoverPanelRenderControls) => ReactNode);
  closeButtonLabel?: string;
  contentClassName?: string;
  contentProps?: Omit<HTMLAttributes<HTMLDivElement>, 'children'>;
  description?: ReactNode;
  disabled?: boolean;
  footer?: ReactNode | ((controls: PopoverPanelRenderControls) => ReactNode);
  headerClassName?: string;
  focusOnOpen?: MenuOverlayFocusTarget;
  matchActivatorWidth?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  placement?: MenuOverlayPlacement;
  portalled?: boolean;
  size?: PopoverPanelSize;
  title?: ReactNode;
}

export function PopoverPanel({
  activator,
  bodyClassName,
  children,
  closeButtonLabel,
  contentClassName,
  contentProps,
  description,
  disabled = false,
  footer,
  focusOnOpen = 'content',
  headerClassName,
  matchActivatorWidth = false,
  onOpenChange,
  open,
  placement = 'bottom-start',
  portalled = true,
  size = 'auto',
  title,
}: PopoverPanelProps) {
  const generatedId = useId();
  const titleId = title ? `${generatedId}-title` : undefined;
  const descriptionId = description ? `${generatedId}-description` : undefined;

  return (
    <MenuOverlay
      activator={activator}
      contentClassName={classNames(
        'vui-popover-panel',
        `vui-popover-panel--${size}`,
        contentClassName,
      )}
      contentProps={{
        ...contentProps,
        'aria-describedby': contentProps?.['aria-describedby'] ?? descriptionId,
        'aria-labelledby': contentProps?.['aria-labelledby'] ?? titleId,
      }}
      contentRole="dialog"
      disabled={disabled}
      focusOnOpen={focusOnOpen}
      matchActivatorWidth={matchActivatorWidth}
      onOpenChange={onOpenChange}
      open={open}
      placement={placement}
      portalled={portalled}
      popupRole="dialog"
    >
      {({ close, open }) => {
        const controls = { close: () => close({ returnFocus: true }), open };
        const renderedChildren =
          typeof children === 'function' ? children(controls) : children;
        const renderedFooter =
          typeof footer === 'function' ? footer(controls) : footer;

        return (
          <>
            {title || description || closeButtonLabel ? (
              <header
                className={classNames(
                  'vui-popover-panel__header',
                  headerClassName,
                )}
              >
                <div className="vui-popover-panel__header-copy">
                  {title ? (
                    <h2 id={titleId} className="vui-popover-panel__title">
                      {title}
                    </h2>
                  ) : null}
                  {description ? (
                    <p
                      id={descriptionId}
                      className="vui-popover-panel__description"
                    >
                      {description}
                    </p>
                  ) : null}
                </div>
                {closeButtonLabel ? (
                  <Button
                    aria-label={closeButtonLabel}
                    className="vui-popover-panel__close"
                    icon="x"
                    size="sm"
                    variant="ghost"
                    onClick={controls.close}
                  />
                ) : null}
              </header>
            ) : null}
            <div
              className={classNames('vui-popover-panel__body', bodyClassName)}
            >
              {renderedChildren}
            </div>
            {renderedFooter ? (
              <footer className="vui-popover-panel__footer">
                {renderedFooter}
              </footer>
            ) : null}
          </>
        );
      }}
    </MenuOverlay>
  );
}
