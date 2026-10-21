import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ComponentType,
  type ReactNode,
} from 'react';

import { classNames } from '../className';
import { BUTTON_ICON_SIZE, BUTTON_ICON_SIZE_COMPACT } from './buttonMetrics';
import { Icon, type IconName } from './Icon';

export type ButtonIconProp =
  IconName | ComponentType<{ className?: string; size?: number }>;

export type ButtonVariant =
  'danger' | 'ghost' | 'icon' | 'primary' | 'secondary' | 'tertiary' | 'text';
export type ButtonSize = 'lg' | 'md' | 'sm';
export type ButtonBorderRadius =
  '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | 'pill';
export type ButtonPrependIconVariant = 'compact' | 'default';

const baseClassName = 'vui-button';

type ButtonClassNameOptions = {
  borderRadius?: ButtonBorderRadius;
  className?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

export function buttonClassName({
  borderRadius,
  className = '',
  size = 'md',
  variant = 'primary',
}: ButtonClassNameOptions = {}) {
  return classNames(
    baseClassName,
    `vui-button--${variant}`,
    `vui-button--${size}`,
    borderRadius && `vui-button--radius-${borderRadius}`,
    className,
  );
}

type ButtonSharedProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> & {
  borderRadius?: ButtonBorderRadius;
  children?: ReactNode;
  iconSize?: number;
  isLoading?: boolean;
  loadingLabel?: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

interface PlainButtonProps extends ButtonSharedProps {
  icon?: never;
  prependIcon?: never;
  prependIconVariant?: never;
}

interface PrependIconButtonProps extends ButtonSharedProps {
  children: ReactNode;
  icon?: never;
  prependIcon: ButtonIconProp;
  prependIconVariant?: ButtonPrependIconVariant;
}

interface IconOnlyButtonProps extends ButtonSharedProps {
  'aria-label': string;
  children?: never;
  icon: IconName;
  prependIcon?: never;
  prependIconVariant?: never;
}

export type ButtonProps =
  PlainButtonProps | PrependIconButtonProps | IconOnlyButtonProps;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const {
      borderRadius,
      children,
      className = '',
      disabled = false,
      icon,
      iconSize,
      isLoading = false,
      loadingLabel,
      prependIcon,
      prependIconVariant = 'default',
      size = 'md',
      type,
      title,
      variant = 'primary',
      ...buttonProps
    } = props;

    if (process.env.NODE_ENV !== 'production' && variant === 'icon' && !icon) {
      console.warn('Button: the `icon` variant requires the `icon` prop.');
    }

    const PrependIconComponent =
      prependIcon && typeof prependIcon !== 'string' ? prependIcon : null;
    const resolvedBorderRadius = borderRadius ?? 'pill';
    const resolvedType = type ?? 'button';
    const resolvedTitle = title ?? (icon ? props['aria-label'] : undefined);
    const label =
      isLoading && loadingLabel !== undefined ? loadingLabel : children;
    const resolvedIconSize =
      iconSize ??
      (prependIconVariant === 'compact'
        ? BUTTON_ICON_SIZE_COMPACT
        : BUTTON_ICON_SIZE);

    const baseButtonClassName = buttonClassName({
      borderRadius: resolvedBorderRadius,
      className: classNames(
        isLoading && 'vui-button--loading',
        icon && 'vui-button--icon-only',
        prependIcon && `vui-button--prepend-icon-${prependIconVariant}`,
        className,
      ),
      size,
      variant,
    });

    const isDisabled = disabled || isLoading;

    return (
      <button
        {...buttonProps}
        ref={ref}
        aria-busy={isLoading || undefined}
        className={baseButtonClassName}
        disabled={isDisabled}
        title={resolvedTitle}
        type={resolvedType}
      >
        {isLoading ? (
          <span className="vui-button__spinner" aria-hidden="true" />
        ) : null}
        {icon && !isLoading ? (
          <Icon
            name={icon}
            size={resolvedIconSize}
            className="vui-button__icon"
          />
        ) : null}
        {prependIcon ? (
          PrependIconComponent ? (
            <PrependIconComponent
              className="vui-button__icon shrink-0"
              size={resolvedIconSize}
            />
          ) : (
            <Icon
              name={prependIcon as IconName}
              size={resolvedIconSize}
              className="vui-button__icon"
            />
          )
        ) : null}
        {!icon ? <span className="vui-button__label">{label}</span> : null}
      </button>
    );
  },
);

Button.displayName = 'Button';
