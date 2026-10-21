import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { useIsDesktopShellViewport } from '../../layouts/app/shellViewport';
import { buildSettingsHash, getDefaultSettingsRoute } from './settingsHash';
import { useOptionalSettingsNavigation } from './useSettingsNavigation';

export function useOpenSettingsAction() {
  const location = useLocation();
  const navigate = useNavigate();
  const isDesktop = useIsDesktopShellViewport();
  const settingsNavigation = useOptionalSettingsNavigation();

  return useCallback(() => {
    if (settingsNavigation) {
      settingsNavigation.openSettings();
      return;
    }

    void navigate({
      hash: buildSettingsHash(getDefaultSettingsRoute(isDesktop)),
      pathname: location.pathname,
      search: location.search,
    });
  }, [
    isDesktop,
    location.pathname,
    location.search,
    navigate,
    settingsNavigation,
  ]);
}
