import { useI18n } from '../../i18n';
import { SettingsModalShell } from './SettingsModalShell';
import { SettingsNav } from './SettingsNav';
import { SettingsRouteContent } from './SettingsRouteContent';
import { SettingsShellProvider } from './SettingsShellContext';
import { useSettingsNavigation } from './useSettingsNavigation';

export function SettingsDesktopModal() {
  const { canClose, closeSettings, currentRoute, goTo, presentation } =
    useSettingsNavigation();
  const { t } = useI18n();

  if (currentRoute === null || presentation !== 'modal') {
    return null;
  }

  return (
    <SettingsShellProvider
      value={{
        close: closeSettings,
        goTo,
        presentation: 'modal',
      }}
    >
      <SettingsModalShell
        canClose={canClose}
        closeLabel={t('shell.action.closeSettings')}
        nav={<SettingsNav />}
        onClose={closeSettings}
        title={t('settings.layout.title')}
        titleId="settings-desktop-modal-title"
      >
        <SettingsRouteContent route={currentRoute} />
      </SettingsModalShell>
    </SettingsShellProvider>
  );
}
