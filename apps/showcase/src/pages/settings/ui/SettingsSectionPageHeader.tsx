import { useIsDesktopSettingsViewport } from '../settingsViewport';

import type { ReactNode } from 'react';

type SettingsSectionPageHeaderProps = {
  description?: ReactNode;
  title: ReactNode;
};

export function SettingsSectionPageHeader({
  description,
  title,
}: SettingsSectionPageHeaderProps) {
  const isDesktopSettingsViewport = useIsDesktopSettingsViewport();

  if (!isDesktopSettingsViewport) {
    if (!description) {
      return null;
    }

    return (
      <p className="app-text-supporting-copy max-w-2xl text-ink-2">
        {description}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <h1 className="app-text-pane-title text-ink">{title}</h1>
      {description ? (
        <p className="app-text-supporting-copy max-w-2xl text-ink-2">
          {description}
        </p>
      ) : null}
    </div>
  );
}
