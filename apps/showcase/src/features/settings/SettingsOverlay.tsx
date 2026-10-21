import { useIsDesktopShellViewport } from '../../layouts/app/shellViewport';
import { SettingsDesktopModal } from './SettingsDesktopModal';
import { SettingsMobilePanel } from './SettingsMobilePanel';
import { useSettingsNavigation } from './useSettingsNavigation';

export function SettingsOverlay() {
  const isDesktop = useIsDesktopShellViewport();
  const { isOpen } = useSettingsNavigation();

  if (!isOpen) {
    return null;
  }

  return isDesktop ? <SettingsDesktopModal /> : <SettingsMobilePanel />;
}
