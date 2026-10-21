import {
  forwardRef,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';

import { classNames } from '../className';

export interface CheckboxProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'onChange' | 'role' | 'type'
> {
  checked: boolean;
  indeterminate?: boolean;
  label?: ReactNode;
  onCheckedChange?: (checked: boolean) => void;
  size?: 'default' | 'lg';
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M2.5 6l2.5 2.5 4.5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M2 6h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  (
    {
      checked,
      className = '',
      disabled = false,
      indeterminate = false,
      label,
      onCheckedChange,
      onClick,
      size = 'default',
      ...buttonProps
    },
    ref,
  ) => {
    const isDisabled = disabled;

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);

      if (event.defaultPrevented || isDisabled) {
        return;
      }

      onCheckedChange?.(!checked);
    };

    const control = (
      <button
        {...buttonProps}
        ref={ref}
        aria-checked={indeterminate ? 'mixed' : checked}
        aria-disabled={isDisabled || undefined}
        className={classNames(
          'vui-checkbox__control',
          checked && 'vui-checkbox__control--checked',
          indeterminate && 'vui-checkbox__control--indeterminate',
          isDisabled && 'vui-checkbox__control--disabled',
          className,
        )}
        disabled={isDisabled}
        onClick={handleClick}
        role="checkbox"
        type="button"
      >
        <span className="vui-checkbox__icon" aria-hidden="true">
          {indeterminate ? <MinusIcon /> : <CheckIcon />}
        </span>
      </button>
    );

    if (label) {
      return (
        <label
          className={classNames(
            'vui-checkbox',
            `vui-checkbox--${size}`,
            isDisabled && 'vui-checkbox--disabled',
          )}
        >
          {control}
          <span className="vui-checkbox__label">{label}</span>
        </label>
      );
    }

    return (
      <span
        className={classNames(
          'vui-checkbox',
          `vui-checkbox--${size}`,
          isDisabled && 'vui-checkbox--disabled',
        )}
      >
        {control}
      </span>
    );
  },
);

Checkbox.displayName = 'Checkbox';
