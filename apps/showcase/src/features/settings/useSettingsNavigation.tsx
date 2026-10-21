import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate } from 'react-router';

import { useIsDesktopShellViewport } from '../../layouts/app/shellViewport';
import {
  buildSettingsHash,
  getDefaultSettingsRoute,
  parseSettingsHash,
  type SettingsRouteKey,
} from './settingsHash';

import type { SettingsPresentation } from './SettingsShellContext';

export type SettingsNavigationContextValue = {
  canClose: boolean;
  closeSettings: () => void;
  currentRoute: SettingsRouteKey | null;
  goTo: (route: SettingsRouteKey) => void;
  isOpen: boolean;
  openSettings: () => void;
  presentation: SettingsPresentation | null;
};

const SettingsNavigationContext =
  createContext<SettingsNavigationContextValue | null>(null);

export function SettingsNavigationProvider({
  canClose = true,
  children,
}: {
  canClose?: boolean;
  children: ReactNode;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const isDesktop = useIsDesktopShellViewport();
  const currentRoute = parseSettingsHash(location.hash);
  const isOpen = currentRoute !== null;
  const presentation: SettingsPresentation | null = isOpen
    ? isDesktop
      ? 'modal'
      : 'panel'
    : null;

  const goTo = useCallback(
    (route: SettingsRouteKey) => {
      void navigate({
        hash: buildSettingsHash(route),
        pathname: location.pathname,
        search: location.search,
      });
    },
    [location.pathname, location.search, navigate],
  );

  const openSettings = useCallback(() => {
    const route = getDefaultSettingsRoute(isDesktop);
    void navigate({
      hash: buildSettingsHash(route),
      pathname: location.pathname,
      search: location.search,
    });
  }, [isDesktop, location.pathname, location.search, navigate]);

  const closeSettings = useCallback(() => {
    if (!canClose) {
      return;
    }

    void navigate(
      {
        hash: '',
        pathname: location.pathname,
        search: location.search,
      },
      { replace: true },
    );
  }, [canClose, location.pathname, location.search, navigate]);

  const value = useMemo<SettingsNavigationContextValue>(
    () => ({
      canClose,
      closeSettings,
      currentRoute,
      goTo,
      isOpen,
      openSettings,
      presentation,
    }),
    [
      canClose,
      closeSettings,
      currentRoute,
      goTo,
      isOpen,
      openSettings,
      presentation,
    ],
  );

  return (
    <SettingsNavigationContext.Provider value={value}>
      {children}
    </SettingsNavigationContext.Provider>
  );
}

export function useSettingsNavigation() {
  const context = useContext(SettingsNavigationContext);

  if (context === null) {
    throw new Error(
      'useSettingsNavigation must be used within SettingsNavigationProvider',
    );
  }

  return context;
}

export function useOptionalSettingsNavigation() {
  return useContext(SettingsNavigationContext);
}
