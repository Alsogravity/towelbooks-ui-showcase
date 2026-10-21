import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate } from 'react-router';

import { useIsDesktopShellViewport } from '../../../layouts/app/shellViewport';
import {
  buildRoomSettingsHash,
  getDefaultRoomSettingsRoute,
  parseRoomSettingsHash,
  type RoomSettingsRouteKey,
} from './roomSettingsHash';

export type RoomSettingsPresentation = 'modal' | 'panel';

export type RoomSettingsNavigationContextValue = {
  closeSettings: () => void;
  currentRoute: RoomSettingsRouteKey | null;
  goTo: (route: RoomSettingsRouteKey) => void;
  isOpen: boolean;
  openSettings: () => void;
  presentation: RoomSettingsPresentation | null;
};

const RoomSettingsNavigationContext =
  createContext<RoomSettingsNavigationContextValue | null>(null);

export function RoomSettingsNavigationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const isDesktop = useIsDesktopShellViewport();
  const currentRoute = parseRoomSettingsHash(location.hash);
  const isOpen = currentRoute !== null;
  const presentation: RoomSettingsPresentation | null = isOpen
    ? isDesktop
      ? 'modal'
      : 'panel'
    : null;

  const goTo = useCallback(
    (route: RoomSettingsRouteKey) => {
      void navigate(
        {
          hash: buildRoomSettingsHash(route),
          pathname: location.pathname,
          search: location.search,
        },
        { replace: true },
      );
    },
    [location.pathname, location.search, navigate],
  );

  const openSettings = useCallback(() => {
    const route = getDefaultRoomSettingsRoute(isDesktop);
    void navigate({
      hash: buildRoomSettingsHash(route),
      pathname: location.pathname,
      search: location.search,
    });
  }, [isDesktop, location.pathname, location.search, navigate]);

  const closeSettings = useCallback(() => {
    void navigate(
      {
        hash: '',
        pathname: location.pathname,
        search: location.search,
      },
      { replace: true },
    );
  }, [location.pathname, location.search, navigate]);

  const value = useMemo<RoomSettingsNavigationContextValue>(
    () => ({
      closeSettings,
      currentRoute,
      goTo,
      isOpen,
      openSettings,
      presentation,
    }),
    [closeSettings, currentRoute, goTo, isOpen, openSettings, presentation],
  );

  return (
    <RoomSettingsNavigationContext.Provider value={value}>
      {children}
    </RoomSettingsNavigationContext.Provider>
  );
}

export function useRoomSettingsNavigation() {
  const context = useContext(RoomSettingsNavigationContext);

  if (context === null) {
    throw new Error(
      'useRoomSettingsNavigation must be used within RoomSettingsNavigationProvider',
    );
  }

  return context;
}
