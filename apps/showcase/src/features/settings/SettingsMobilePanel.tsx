import { useMemo } from 'react';

import { useI18n } from '../../i18n';
import { MobileOverlayPanelShell } from '../../layouts/app/MobileOverlayPanelShell';
import { mobileSettingsPanelTitleId } from '../../layouts/appLayoutShared';
import type { SettingsRouteKey } from './settingsHash';
import {
  getSettingsSubroute,
  settingsSections,
} from '../../pages/settings/settingsNavigation';
import { SettingsRouteContent } from './SettingsRouteContent';
import { SettingsShellProvider } from './SettingsShellContext';
import { useSettingsNavigation } from './useSettingsNavigation';

function resolvePanelHeaderTitle(
  route: SettingsRouteKey,
  t: (key: string) => string,
) {
  if (route === 'index') {
    return t('settings.layout.title');
  }

  const matchedSubroute = getSettingsSubroute(route);

  if (matchedSubroute) {
    return t(matchedSubroute.titleKey);
  }

  const matchedSection = settingsSections.find(
    (section) => section.route === route,
  );

  if (matchedSection) {
    return t(matchedSection.labelKey);
  }

  return t('settings.layout.title');
}

export function SettingsMobilePanel() {
  const { canClose, closeSettings, currentRoute, goTo, presentation } =
    useSettingsNavigation();
  const { t } = useI18n();

  const panelHeaderConfig = useMemo(() => {
    if (currentRoute === null) {
      return null;
    }

    const matchedSubroute = getSettingsSubroute(currentRoute);
    const matchedSection = settingsSections.find(
      (section) => section.route === currentRoute,
    );

    return {
      title: resolvePanelHeaderTitle(currentRoute, t),
      titleAction: matchedSubroute
        ? {
            ariaLabel: t(matchedSubroute.backAriaLabelKey),
            onClick: () => goTo(matchedSubroute.parentRoute),
          }
        : matchedSection
          ? {
              ariaLabel: t('settings.backToSettings'),
              onClick: () => goTo('index'),
            }
          : null,
      trailingAction: canClose
        ? {
            ariaLabel: t('shell.action.closeSettings'),
            iconName: 'x' as const,
            onClick: closeSettings,
          }
        : undefined,
    };
  }, [canClose, closeSettings, currentRoute, goTo, t]);

  if (currentRoute === null || presentation !== 'panel') {
    return null;
  }

  return (
    <SettingsShellProvider
      value={{
        close: closeSettings,
        goTo,
        presentation: 'panel',
      }}
    >
      <MobileOverlayPanelShell
        headerConfig={panelHeaderConfig}
        onClose={canClose ? closeSettings : () => undefined}
        title={t('settings.layout.title')}
        titleId={mobileSettingsPanelTitleId}
      >
        <SettingsRouteContent route={currentRoute} />
      </MobileOverlayPanelShell>
    </SettingsShellProvider>
  );
}
