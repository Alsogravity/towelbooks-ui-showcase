import { forwardRef } from 'react';
import {
  Button,
  buttonClassName,
  BUTTON_ICON_SIZE,
  BUTTON_ICON_SIZE_COMPACT,
  type ButtonBorderRadius,
  type ButtonIconProp,
  type ButtonPrependIconVariant,
  type ButtonSize,
  type ButtonVariant,
  Icon,
  type IconName,
} from '@towelbooks/ui';
import { Link, type LinkProps } from 'react-router';

export { Button };

type ButtonLinkBaseProps = Omit<LinkProps, 'children' | 'className'> & {
  borderRadius?: ButtonBorderRadius;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

interface PlainButtonLinkProps extends ButtonLinkBaseProps {
  children: import('react').ReactNode;
  icon?: never;
  iconSize?: never;
  prependIcon?: never;
  prependIconVariant?: never;
}

interface PrependIconButtonLinkProps extends ButtonLinkBaseProps {
  children: import('react').ReactNode;
  icon?: never;
  iconSize?: number;
  prependIcon: ButtonIconProp;
  prependIconVariant?: ButtonPrependIconVariant;
}

interface IconOnlyButtonLinkProps extends Omit<
  ButtonLinkBaseProps,
  'aria-label'
> {
  'aria-label': string;
  children?: never;
  icon: IconName;
  iconSize?: number;
  prependIcon?: never;
  prependIconVariant?: never;
}

type ButtonLinkProps =
  PlainButtonLinkProps | PrependIconButtonLinkProps | IconOnlyButtonLinkProps;

export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  (
    {
      borderRadius,
      variant = 'primary',
      size = 'md',
      className = '',
      children,
      icon,
      iconSize,
      prependIcon,
      prependIconVariant = 'default',
      title,
      ...props
    },
    ref,
  ) => {
    const PrependIconComponent =
      prependIcon && typeof prependIcon !== 'string' ? prependIcon : null;
    const resolvedBorderRadius = borderRadius ?? 'pill';
    const resolvedTitle = title ?? (icon ? props['aria-label'] : undefined);
    const resolvedIconSize =
      iconSize ??
      (prependIconVariant === 'compact'
        ? BUTTON_ICON_SIZE_COMPACT
        : BUTTON_ICON_SIZE);

    return (
      <Link
        ref={ref}
        className={buttonClassName({
          borderRadius: resolvedBorderRadius,
          className: [
            icon ? 'vui-button--icon-only' : '',
            prependIcon ? `vui-button--prepend-icon-${prependIconVariant}` : '',
            className,
          ]
            .filter(Boolean)
            .join(' '),
          size,
          variant,
        })}
        title={resolvedTitle}
        {...props}
      >
        {icon ? (
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
        {!icon ? <span className="vui-button__label">{children}</span> : null}
      </Link>
    );
  },
);

ButtonLink.displayName = 'ButtonLink';
