import { Button } from '../../components/primitives';
import { useSettingsShell } from './SettingsShellContext';

import type { SettingsRouteKey } from './settingsHash';
import type { ReactNode } from 'react';

type SettingsSubrouteBackButtonProps = {
  children: ReactNode;
  route: SettingsRouteKey;
};

export function SettingsSubrouteBackButton({
  children,
  route,
}: SettingsSubrouteBackButtonProps) {
  const { goTo } = useSettingsShell();

  return (
    <div className="lg:hidden">
      <Button
        variant="ghost"
        size="sm"
        prependIcon="chevron-left"
        className="inline-flex"
        type="button"
        onClick={() => goTo(route)}
      >
        {children}
      </Button>
    </div>
  );
}
