import { useCallback, useMemo, useState } from 'react';
import { matchPath, useLocation, useNavigate } from 'react-router';

import { type PageHeaderBackAction } from '../components/layout/PageHeaderBackActionContext';
import { type PageMobileHeaderActions } from '../components/layout/PageMobileHeaderActionContext';
import { type RoomDetailMobileHeaderLeadingAction } from '../features/rooms/detail/RoomDetailMobileHeaderLeadingActionContext';
import { useReportOverlay } from '../features/reports/ReportOverlayContext';
import { useSettingsNavigation } from '../features/settings/useSettingsNavigation';
import { getNotificationsBellAriaLabel } from '../features/notifications/notificationsBellAriaLabel';
import { useNotificationsPanel } from '../features/notifications/NotificationsPanelContext';
import { useNotificationBellCount } from '../features/notifications/useNotificationBellCount';
import { useI18n } from '../i18n';
import { isProfilePath, isProfileReviewsPath } from '../app/profileRoutes';
import {
  buildRoomSettingsHash,
  getDefaultRoomSettingsRoute,
  isRoomSettingsHashOpen,
} from '../pages/rooms/settings/roomSettingsHash';
import { type AppMobileHeaderConfig } from './app/AppMobileHeader';
import { getMobileHeaderRouteConfig } from './app/mobileHeaderRoutes';
import { useResolvedPageTitle } from './app/mobileHeaderTitle';
import { useMobileShellOverlay } from './app/MobileShellOverlayContext';
import {
  useIsCompactShellViewport,
  useIsDesktopShellViewport,
} from './app/shellViewport';

export function useAppLayoutUiState() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { openFromMobileHeader } = useNotificationsPanel();
  const isCompactShellViewport = useIsCompactShellViewport();
  const { isOverlayOpen: isMobileShellOverlayOpen } = useMobileShellOverlay();
  const { isOpen: isReportOpen } = useReportOverlay();
  const { isOpen: isSettingsOpen, presentation } = useSettingsNavigation();
  const isDesktopShellViewport = useIsDesktopShellViewport();
  const { hash, pathname, search } = location;
  const shouldRenderSettingsPanel =
    isSettingsOpen && presentation === 'panel' && isCompactShellViewport;
  const shouldRenderReportPanel = isReportOpen && isCompactShellViewport;
  const isProfileRoute = isProfilePath(pathname);
  const matchedRoomDetailRoute = matchPath(
    { path: '/rooms/:roomId', end: true },
    pathname,
  );
  const isRoomDetailRoute = matchedRoomDetailRoute !== null;
  const shouldRenderRoomSettingsPanel =
    isRoomDetailRoute && isRoomSettingsHashOpen(hash) && isCompactShellViewport;
  const isRoomSettingsRoute =
    matchPath({ path: '/rooms/:roomId/settings/*' }, pathname) !== null;
  const isCreateRoomRoute = pathname === '/rooms/create';
  const isCollectionsRoute =
    matchPath({ path: '/collections', end: true }, pathname) !== null ||
    matchPath({ path: '/collections/:collectionId', end: true }, pathname) !==
      null;
  const isCatalogContributionRoute =
    matchPath({ path: '/catalog/new', end: true }, pathname) !== null ||
    matchPath({ path: '/catalog/new/:identifier', end: true }, pathname) !==
      null;
  const isLegalUpdatesRoute = pathname.startsWith('/legal-updates');
  const shouldHideMobileHeader =
    shouldRenderSettingsPanel ||
    shouldRenderReportPanel ||
    shouldRenderRoomSettingsPanel ||
    isMobileShellOverlayOpen ||
    isProfileRoute ||
    isProfileReviewsPath(pathname) ||
    isRoomSettingsRoute ||
    isCreateRoomRoute ||
    isCatalogContributionRoute ||
    isLegalUpdatesRoute;
  const shouldHideMobileNav =
    shouldRenderSettingsPanel ||
    shouldRenderReportPanel ||
    shouldRenderRoomSettingsPanel ||
    isMobileShellOverlayOpen ||
    isRoomDetailRoute ||
    isRoomSettingsRoute ||
    isCreateRoomRoute ||
    isCollectionsRoute ||
    isCatalogContributionRoute ||
    isLegalUpdatesRoute;
  const matchedMobileHeaderRoute = getMobileHeaderRouteConfig(pathname);
  const shouldFetchUnreadNotificationsCount =
    isCompactShellViewport &&
    matchedMobileHeaderRoute.primaryAction === 'open-notifications';
  const notificationBellCount = useNotificationBellCount({
    enabled: shouldFetchUnreadNotificationsCount,
  });
  const unreadNotificationsCount = notificationBellCount.count;
  const [pageHeaderBackAction, setPageHeaderBackAction] =
    useState<PageHeaderBackAction | null>(null);
  const [pageMobileHeaderActions, setPageMobileHeaderAction] =
    useState<PageMobileHeaderActions | null>(null);
  const [roomDetailLeadingAction, setRoomDetailLeadingAction] =
    useState<RoomDetailMobileHeaderLeadingAction | null>(null);
  const [roomShareSession, setRoomShareSession] = useState<{
    roomId: string;
    open: boolean;
  } | null>(null);
  const appName = t('app.name', { fallback: 'TowelBooks' });
  const roomShareName = useResolvedPageTitle(appName);
  const roomId = matchedRoomDetailRoute?.params.roomId ?? null;
  const isRoomShareOpen =
    roomId !== null &&
    roomShareSession?.roomId === roomId &&
    roomShareSession.open;

  const startRoom = useCallback(() => {
    void navigate('/rooms/create');
  }, [navigate]);

  const addCatalogWork = useCallback(() => {
    void navigate('/catalog/new');
  }, [navigate]);

  const backToRoomsList = useCallback(() => {
    void navigate('/rooms');
  }, [navigate]);

  const openRoomSettings = useCallback(() => {
    const currentRoomId = matchedRoomDetailRoute?.params.roomId;

    if (!currentRoomId) {
      return;
    }

    const route = getDefaultRoomSettingsRoute(isDesktopShellViewport);
    void navigate({
      hash: buildRoomSettingsHash(route),
      pathname,
      search,
    });
  }, [
    isDesktopShellViewport,
    matchedRoomDetailRoute?.params.roomId,
    navigate,
    pathname,
    search,
  ]);

  const openRoomShare = useCallback(() => {
    if (!roomId) {
      return;
    }

    setRoomShareSession({ roomId, open: true });
  }, [roomId]);

  const closeRoomShare = useCallback(() => {
    setRoomShareSession((current) =>
      current === null ? null : { ...current, open: false },
    );
  }, []);

  const mobileHeaderConfig = useMemo<AppMobileHeaderConfig>(() => {
    if (matchedMobileHeaderRoute.primaryAction === 'create-room') {
      return {
        primaryAction: {
          ariaLabel: t('rooms.list.action.start'),
          iconName: 'plus',
          kind: 'button',
          onClick: startRoom,
        },
      };
    }

    if (matchedMobileHeaderRoute.primaryAction === 'share-room') {
      const trailingAction =
        matchedMobileHeaderRoute.trailingAction === 'open-room-settings'
          ? {
              ariaLabel: t('rooms.detail.actions.openSettings'),
              iconName: 'settings' as const,
              onClick: openRoomSettings,
            }
          : undefined;

      return {
        title: t('rooms.detail.mobileHeaderTitle'),
        titleAction: {
          ariaLabel: t('rooms.list.header.title'),
          onClick: backToRoomsList,
        },
        ...(roomDetailLeadingAction
          ? { leadingAction: roomDetailLeadingAction }
          : {}),
        primaryAction: {
          ariaLabel: t('share.action'),
          iconName: 'share',
          kind: 'button',
          onClick: openRoomShare,
        },
        ...(trailingAction ? { trailingAction } : {}),
      };
    }

    if (matchedMobileHeaderRoute.primaryAction === 'search') {
      const trailingAction = (() => {
        if (matchedMobileHeaderRoute.trailingAction === 'create-room') {
          return {
            ariaLabel: t('rooms.list.action.start'),
            iconName: 'plus' as const,
            onClick: startRoom,
          };
        }

        if (matchedMobileHeaderRoute.trailingAction === 'create-book') {
          return {
            ariaLabel: t('catalog.works.addBook'),
            iconName: 'plus' as const,
            onClick: addCatalogWork,
          };
        }

        return undefined;
      })();

      return {
        primaryAction: {
          ariaLabel: t('shell.action.search'),
          kind: 'search',
          search: matchedMobileHeaderRoute.search,
        },
        ...(trailingAction ? { trailingAction } : {}),
      };
    }

    if (matchedMobileHeaderRoute.primaryAction === 'open-notifications') {
      return {
        primaryAction: {
          ariaLabel: getNotificationsBellAriaLabel(unreadNotificationsCount, t),
          badgeCount: unreadNotificationsCount,
          iconName: 'bell',
          kind: 'button',
          onClick: openFromMobileHeader,
        },
      };
    }

    const baseConfig: AppMobileHeaderConfig = {
      ...(pageMobileHeaderActions?.leadingAction
        ? { leadingAction: pageMobileHeaderActions.leadingAction }
        : {}),
      ...(pageMobileHeaderActions?.primaryAction
        ? {
            primaryAction: {
              ...pageMobileHeaderActions.primaryAction,
              kind: 'button' as const,
            },
          }
        : {}),
    };

    if (baseConfig.titleAction || pageHeaderBackAction === null) {
      return baseConfig;
    }

    return {
      ...baseConfig,
      titleAction: {
        ariaLabel: pageHeaderBackAction.label,
        onClick: () => {
          void navigate(pageHeaderBackAction.to);
        },
      },
    };
  }, [
    backToRoomsList,
    addCatalogWork,
    matchedMobileHeaderRoute,
    navigate,
    openFromMobileHeader,
    openRoomSettings,
    openRoomShare,
    pageHeaderBackAction,
    pageMobileHeaderActions,
    roomDetailLeadingAction,
    startRoom,
    t,
    unreadNotificationsCount,
  ]);

  return {
    roomShareName,
    roomShareUrl: roomId ? `/rooms/${roomId}` : null,
    closeRoomShare,
    isRoomShareOpen,
    mobileHeaderConfig,
    pathname,
    routeTransitionKey: pathname,
    setPageHeaderBackAction,
    setPageMobileHeaderAction,
    setRoomDetailLeadingAction,
    shouldHideMobileHeader,
    shouldHideMobileNav,
    shouldHideSidebar: isLegalUpdatesRoute,
    shouldShowCatalogContributionIllustration: isCatalogContributionRoute,
    shouldShowCreateRoomIllustration: isCreateRoomRoute,
    shouldShowLegalUpdatesIllustration: isLegalUpdatesRoute,
    shouldRenderSettingsPanel,
  };
}
