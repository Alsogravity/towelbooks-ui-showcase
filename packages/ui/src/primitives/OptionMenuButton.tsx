import { type ReactNode } from 'react';

import { ActionMenu, type ActionMenuTone } from './ActionMenu';
import {
  Button,
  type ButtonPrependIconVariant,
  type ButtonSize,
  type ButtonVariant,
} from './Button';
import { Icon, type IconName } from './Icon';
import { type MenuOverlayPlacement } from './MenuOverlay';

export type OptionMenuButtonOption<Value extends string> = {
  className?: string;
  description?: ReactNode;
  disabled?: boolean;
  icon?: IconName;
  iconSize?: number;
  label: ReactNode;
  tone?: ActionMenuTone;
  value: Value;
};

export interface OptionMenuButtonProps<Value extends string> {
  ariaLabel?: string;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
  label: ReactNode;
  matchActivatorWidth?: boolean;
  onChange: (value: Value) => unknown | Promise<unknown>;
  options: ReadonlyArray<OptionMenuButtonOption<Value>>;
  placement?: MenuOverlayPlacement;
  prependIcon?: IconName;
  prependIconVariant?: ButtonPrependIconVariant;
  selectedValue: Value;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

export function OptionMenuButton<Value extends string>({
  ariaLabel,
  className,
  contentClassName,
  disabled = false,
  label,
  matchActivatorWidth = false,
  onChange,
  options,
  placement,
  prependIcon,
  prependIconVariant,
  selectedValue,
  size = 'md',
  variant = 'ghost',
}: OptionMenuButtonProps<Value>) {
  const selectedOption = options.find(
    (option) => option.value === selectedValue,
  );
  const selectedLabel = selectedOption?.label ?? selectedValue;
  const buttonIconProps =
    prependIcon === undefined ? {} : { prependIcon, prependIconVariant };

  return (
    <ActionMenu
      ariaLabel={ariaLabel}
      contentClassName={contentClassName}
      disabled={disabled}
      matchActivatorWidth={matchActivatorWidth}
      placement={placement}
      activator={({ activatorProps, ref }) => (
        <Button
          {...activatorProps}
          {...buttonIconProps}
          ref={ref}
          className={className}
          size={size}
          variant={variant}
        >
          <span className="flex items-center gap-1.5">
            {label}: {selectedLabel}
            <Icon name="chevron-down" size={14} className="shrink-0" />
          </span>
        </Button>
      )}
      sections={[
        {
          id: 'option-menu-button-options',
          items: options.map((option) => ({
            id: option.value,
            kind: 'radio' as const,
            label: option.label,
            checked: option.value === selectedValue,
            onSelect: () => onChange(option.value),
            className: option.className,
            description: option.description,
            disabled: option.disabled,
            icon: option.icon,
            iconSize: option.iconSize,
            tone: option.tone,
          })),
        },
      ]}
    />
  );
}
