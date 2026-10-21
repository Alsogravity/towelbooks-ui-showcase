import type {
  ButtonIconProp,
  ButtonPrependIconVariant,
  ButtonSize,
  ButtonVariant,
} from '@towelbooks/ui';

import { Button } from '../../components/primitives';
import { useSettingsShell } from './SettingsShellContext';

import type { SettingsRouteKey } from './settingsHash';
import type { ReactNode } from 'react';

type SettingsRouteButtonProps = {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
  loadingLabel?: ReactNode;
  prependIcon?: ButtonIconProp;
  prependIconVariant?: ButtonPrependIconVariant;
  route: SettingsRouteKey;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

export function SettingsRouteButton({
  route,
  children,
  className,
  disabled,
  isLoading,
  loadingLabel,
  prependIcon,
  prependIconVariant,
  size,
  variant,
}: SettingsRouteButtonProps) {
  const { goTo } = useSettingsShell();

  if (prependIcon) {
    return (
      <Button
        className={className}
        disabled={disabled}
        isLoading={isLoading}
        loadingLabel={loadingLabel}
        prependIcon={prependIcon}
        prependIconVariant={prependIconVariant}
        size={size}
        type="button"
        variant={variant}
        onClick={() => goTo(route)}
      >
        {children}
      </Button>
    );
  }

  return (
    <Button
      className={className}
      disabled={disabled}
      isLoading={isLoading}
      loadingLabel={loadingLabel}
      size={size}
      type="button"
      variant={variant}
      onClick={() => goTo(route)}
    >
      {children}
    </Button>
  );
}
