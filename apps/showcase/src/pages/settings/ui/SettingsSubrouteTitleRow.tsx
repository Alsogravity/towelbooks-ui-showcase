import { Button } from '../../../components/primitives';
import { useSettingsShell } from '../../../features/settings/SettingsShellContext';
import { useIsDesktopSettingsViewport } from '../settingsViewport';

import type { SettingsRouteKey } from '../../../features/settings/settingsHash';
import type { ReactNode } from 'react';

type SettingsSubrouteTitleRowProps = {
  backLabel: string;
  route: SettingsRouteKey;
  title: ReactNode;
};

export function SettingsSubrouteTitleRow({
  backLabel,
  route,
  title,
}: SettingsSubrouteTitleRowProps) {
  const { goTo } = useSettingsShell();
  const isDesktopSettingsViewport = useIsDesktopSettingsViewport();

  if (!isDesktopSettingsViewport) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        aria-label={backLabel}
        className="shrink-0 text-brick focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus-visible:ring-offset-2"
        icon="chevron-left"
        size="sm"
        type="button"
        variant="ghost"
        onClick={() => goTo(route)}
      />
      <h1 className="app-text-section-title text-ink">{title}</h1>
    </div>
  );
}
