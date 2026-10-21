import { useId } from 'react';

import { useI18n } from '../../../i18n';
import { MobileOverlayPanelShell } from '../../../layouts/app/MobileOverlayPanelShell';
import { getRoomSettingsSections } from './roomSettingsNavigation';
import { useRoomSettingsNavigation } from './useRoomSettingsNavigation';

import type { ReactNode } from 'react';
import type { RoomSettingsRouteKey } from './roomSettingsHash';

function resolvePanelTitle(
  route: RoomSettingsRouteKey,
  t: (key: string) => string,
) {
  if (route === 'index') {
    return t('rooms.settings.layout.title');
  }

  const matchedSection = getRoomSettingsSections().find(
    (section) => section.key === route,
  );

  return matchedSection
    ? t(matchedSection.labelKey)
    : t('rooms.settings.layout.title');
}

type RoomSettingsMobilePanelProps = {
  children: ReactNode;
};

export function RoomSettingsMobilePanel({
  children,
}: RoomSettingsMobilePanelProps) {
  const { closeSettings, currentRoute, goTo, presentation } =
    useRoomSettingsNavigation();
  const { t } = useI18n();
  const titleId = useId();

  if (currentRoute === null || presentation !== 'panel') {
    return null;
  }

  const isIndexRoute = currentRoute === 'index';
  const panelHeaderConfig = {
    title: resolvePanelTitle(currentRoute, t),
    titleAction: isIndexRoute
      ? null
      : {
          ariaLabel: t('rooms.settings.backToSettings'),
          onClick: () => goTo('index'),
        },
    trailingAction: {
      ariaLabel: t('shell.action.closeSettings'),
      iconName: 'x' as const,
      onClick: closeSettings,
    },
  };

  return (
    <MobileOverlayPanelShell
      headerConfig={panelHeaderConfig}
      onClose={closeSettings}
      titleId={titleId}
      title={t('rooms.settings.layout.title')}
    >
      {children}
    </MobileOverlayPanelShell>
  );
}
