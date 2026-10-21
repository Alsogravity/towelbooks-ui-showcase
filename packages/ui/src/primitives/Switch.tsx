import {
  forwardRef,
  useId,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';

import { classNames } from '../className';

export interface SwitchProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'onChange' | 'role' | 'type'
> {
  checked: boolean;
  isLoading?: boolean;
  loadingLabel?: ReactNode;
  onCheckedChange?: (checked: boolean) => void;
}

function describedByValue(...values: Array<string | undefined>) {
  const resolvedValue = values.filter(Boolean).join(' ');
  return resolvedValue || undefined;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      'aria-describedby': ariaDescribedBy,
      checked,
      className = '',
      disabled = false,
      isLoading = false,
      loadingLabel,
      onCheckedChange,
      onClick,
      ...buttonProps
    },
    ref,
  ) => {
    const loadingId = useId();
    const isDisabled = disabled || isLoading;
    const resolvedAriaDescribedBy = describedByValue(
      ariaDescribedBy,
      isLoading && loadingLabel ? loadingId : undefined,
    );

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);

      if (event.defaultPrevented || isDisabled) {
        return;
      }

      onCheckedChange?.(!checked);
    };

    return (
      <span className="vui-switch-wrapper">
        <button
          {...buttonProps}
          ref={ref}
          aria-busy={isLoading || undefined}
          aria-checked={checked}
          aria-describedby={resolvedAriaDescribedBy}
          className={classNames(
            'vui-switch',
            checked && 'vui-switch--checked',
            isLoading && 'vui-switch--loading',
            className,
          )}
          disabled={isDisabled}
          onClick={handleClick}
          role="switch"
          type="button"
        >
          <span className="vui-switch__track" aria-hidden="true">
            <span className="vui-switch__thumb">
              {isLoading ? (
                <span className="vui-switch__spinner" aria-hidden="true" />
              ) : null}
            </span>
          </span>
        </button>
        {isLoading && loadingLabel ? (
          <span
            id={loadingId}
            aria-live="polite"
            className="vui-switch__assistive"
            role="status"
          >
            {loadingLabel}
          </span>
        ) : null}
      </span>
    );
  },
);

Switch.displayName = 'Switch';
