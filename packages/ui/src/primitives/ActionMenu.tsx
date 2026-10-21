import { type ReactNode } from 'react';

import { Icon, type IconName } from './Icon';
import {
  MenuOverlay,
  type MenuOverlayActivatorRenderProps,
  type MenuOverlayPlacement,
} from './MenuOverlay';
import { classNames } from '../className';

export type ActionMenuTone = 'danger' | 'default';

type ActionMenuItemBase = {
  className?: string;
  description?: ReactNode;
  disabled?: boolean;
  icon?: IconName;
  iconSize?: number;
  id: string;
  label: ReactNode;
  tone?: ActionMenuTone;
};

export type ActionMenuActionItem = ActionMenuItemBase & {
  closeOnSelect?: boolean;
  kind: 'action';
  onSelect: () => unknown | Promise<unknown>;
};

export type ActionMenuCheckboxItem = ActionMenuItemBase & {
  checked: boolean;
  kind: 'checkbox';
  onCheckedChange: (checked: boolean) => void;
};

export type ActionMenuRadioItem = ActionMenuItemBase & {
  checked: boolean;
  kind: 'radio';
  onSelect: () => unknown | Promise<unknown>;
};

export type ActionMenuItem =
  ActionMenuActionItem | ActionMenuCheckboxItem | ActionMenuRadioItem;

export type ActionMenuSection = {
  id: string;
  items: ReadonlyArray<ActionMenuItem>;
  label?: ReactNode;
};

export interface ActionMenuProps {
  activator: (props: MenuOverlayActivatorRenderProps) => ReactNode;
  ariaLabel?: string;
  contentClassName?: string;
  disabled?: boolean;
  matchActivatorWidth?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: MenuOverlayPlacement;
  portalled?: boolean;
  sections: ReadonlyArray<ActionMenuSection>;
}

function getItemRole(item: ActionMenuItem) {
  switch (item.kind) {
    case 'checkbox':
      return 'menuitemcheckbox';
    case 'radio':
      return 'menuitemradio';
    default:
      return 'menuitem';
  }
}

function shouldCloseOnSelect(item: ActionMenuItem) {
  switch (item.kind) {
    case 'checkbox':
      return false;
    case 'radio':
      return true;
    case 'action':
      return item.closeOnSelect ?? true;
  }
}

export function ActionMenu({
  activator,
  ariaLabel,
  contentClassName,
  disabled = false,
  matchActivatorWidth = false,
  onOpenChange,
  placement = 'bottom-start',
  portalled = true,
  sections,
}: ActionMenuProps) {
  return (
    <MenuOverlay
      activator={activator}
      contentClassName={classNames('vui-action-menu', contentClassName)}
      contentProps={ariaLabel ? { 'aria-label': ariaLabel } : undefined}
      disabled={disabled}
      focusOnOpen="first"
      matchActivatorWidth={matchActivatorWidth}
      onOpenChange={onOpenChange}
      placement={placement}
      portalled={portalled}
    >
      {({ close }) =>
        sections.map((section) => {
          const hasAnyIcon = section.items.some((item) => !!item.icon);

          return (
            <div key={section.id} className="vui-action-menu__section">
              {section.label ? (
                <div
                  className="vui-action-menu__section-label"
                  role="presentation"
                >
                  {section.label}
                </div>
              ) : null}
              {section.items.map((item) => {
                const hasCheckedState =
                  item.kind === 'checkbox' || item.kind === 'radio';

                return (
                  <button
                    key={item.id}
                    type="button"
                    role={getItemRole(item)}
                    aria-checked={hasCheckedState ? item.checked : undefined}
                    className={classNames(
                      'vui-action-menu__item',
                      item.tone === 'danger' && 'vui-action-menu__item--danger',
                      item.className,
                    )}
                    disabled={item.disabled}
                    onClick={() => {
                      if (item.disabled) {
                        return;
                      }

                      if (shouldCloseOnSelect(item)) {
                        close({ returnFocus: true });
                      }

                      switch (item.kind) {
                        case 'action':
                        case 'radio': {
                          void item.onSelect();
                          break;
                        }
                        case 'checkbox':
                          item.onCheckedChange(!item.checked);
                          break;
                      }
                    }}
                  >
                    {item.icon ? (
                      <Icon
                        name={item.icon}
                        size={item.iconSize ?? 16}
                        className="vui-action-menu__item-icon"
                      />
                    ) : hasAnyIcon ? (
                      <span
                        className="vui-action-menu__item-icon-spacer"
                        aria-hidden="true"
                      />
                    ) : null}
                    <span className="vui-action-menu__item-body">
                      <span className="vui-action-menu__item-label">
                        {item.label}
                      </span>
                      {item.description ? (
                        <span className="vui-action-menu__item-description">
                          {item.description}
                        </span>
                      ) : null}
                    </span>
                    {hasCheckedState ? (
                      <Icon
                        name="check"
                        size={16}
                        className={classNames(
                          'vui-action-menu__item-check',
                          item.checked &&
                            'vui-action-menu__item-check--visible',
                        )}
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          );
        })
      }
    </MenuOverlay>
  );
}
