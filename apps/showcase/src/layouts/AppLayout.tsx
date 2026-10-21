import { useQuery } from '@tanstack/react-query';
import { Suspense, useEffect, useRef, type ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';

import { RouteLoadingFallback } from '../app/RouteLoadingFallback';
import { PageHeaderBackActionProvider } from '../components/layout/PageHeaderBackActionContext';
import { PageMobileHeaderActionProvider } from '../components/layout/PageMobileHeaderActionContext';
import { RoomDetailMobileHeaderLeadingActionProvider } from '../features/rooms/detail/RoomDetailMobileHeaderLeadingActionContext';
import { Button } from '../components/primitives';
import { ShareDialog } from '../components/share/ShareDialog';
import { useAuth } from '../features/auth/AuthContext';
import { meQueryKey } from '../features/auth/meQuery';
import { InAppMessageHost } from '../features/in-app-messages';
import { NotificationsPanelProvider } from '../features/notifications/NotificationsPanelContext';
import { trackPageView } from '../features/analytics';
import { ApiProblemPageState } from '../features/errors';
import { ReportOverlay } from '../features/reports/ReportOverlay';
import { ReportOverlayProvider } from '../features/reports/ReportOverlayContext';
import { SettingsOverlay } from '../features/settings/SettingsOverlay';
import { SettingsNavigationProvider } from '../features/settings/useSettingsNavigation';
import { useI18n } from '../i18n';
import { sdk } from '../lib/sdk';
import { useMarkStartupInteractive } from '../lib/startupTelemetry';
import { CatalogContributionPageIllustration } from '../pages/catalog/contribute/CatalogContributionPageIllustration';
import { CreateRoomPageIllustration } from '../pages/rooms/create/CreateRoomPageIllustration';
import { LegalUpdatesPageIllustration } from '../pages/legal-updates/LegalUpdatesPageIllustration';
import { AppShell } from './app/AppShell';
import { MobileHeaderSearchModeProvider } from './app/MobileHeaderSearchModeContext';
import { MobileShellOverlayProvider } from './app/MobileShellOverlayContext';
import { RouteTransition } from './app/RouteTransition';
import { useAppLayoutUiState } from './useAppLayoutUiState';

export type AppLayoutProps = {
  children?: ReactNode;
};

function StartupInteractiveMarker() {
  useMarkStartupInteractive();
  return null;
}

function AppLayoutContent({
  children,
  currentUserError,
  legalDocumentsUnavailable,
  onLogout,
  onRetryCurrentUser,
  shouldBlockRouteContent,
}: AppLayoutProps & {
  currentUserError: unknown | null;
  legalDocumentsUnavailable: boolean;
  onLogout: () => void;
  onRetryCurrentUser: () => void;
  shouldBlockRouteContent: boolean;
}) {
  const { t } = useI18n();
  const location = useLocation();
  const prevPathRef = useRef('');
  const {
    roomShareName,
    roomShareUrl,
    closeRoomShare,
    isRoomShareOpen,
    mobileHeaderConfig,
    routeTransitionKey,
    setPageHeaderBackAction,
    setPageMobileHeaderAction,
    setRoomDetailLeadingAction,
    shouldHideMobileHeader,
    shouldHideMobileNav,
    shouldHideSidebar,
    shouldShowCatalogContributionIllustration,
    shouldShowCreateRoomIllustration,
    shouldShowLegalUpdatesIllustration,
  } = useAppLayoutUiState();

  useEffect(() => {
    trackPageView(location.pathname, prevPathRef.current || document.referrer);
    prevPathRef.current = location.pathname;
  }, [location.pathname]);

  return (
    <PageHeaderBackActionProvider value={setPageHeaderBackAction}>
      <PageMobileHeaderActionProvider value={setPageMobileHeaderAction}>
        <RoomDetailMobileHeaderLeadingActionProvider
          value={setRoomDetailLeadingAction}
        >
          <AppShell
            hideMobileHeader={shouldHideMobileHeader}
            hideSidebar={shouldHideSidebar}
            enableSidebarNotifications={!shouldBlockRouteContent}
            isSettingsPanelOpen={shouldHideMobileNav}
            mainOverlay={
              shouldShowCreateRoomIllustration ? (
                <CreateRoomPageIllustration />
              ) : shouldShowCatalogContributionIllustration ? (
                <CatalogContributionPageIllustration />
              ) : shouldShowLegalUpdatesIllustration ? (
                <LegalUpdatesPageIllustration />
              ) : null
            }
            mobileHeaderConfig={mobileHeaderConfig}
          >
            <RouteTransition routeKey={routeTransitionKey} fillHeight>
              {currentUserError ? (
                <div className="flex min-h-[24rem] flex-1 items-center justify-center px-4 py-8">
                  <ApiProblemPageState
                    error={currentUserError}
                    fallbackAction={
                      <Button onClick={onRetryCurrentUser} variant="secondary">
                        {t('errors.action.retry')}
                      </Button>
                    }
                  />
                </div>
              ) : legalDocumentsUnavailable ? (
                <div className="flex min-h-[24rem] flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
                  <h1 className="text-xl font-semibold">
                    {t('errors.page.legalDocumentsUnavailable.title')}
                  </h1>
                  <p className="text-muted text-sm">
                    {t('errors.page.legalDocumentsUnavailable.body')}
                  </p>
                  <Button onClick={onLogout} variant="secondary">
                    {t('shell.action.logout')}
                  </Button>
                </div>
              ) : shouldBlockRouteContent ? (
                <RouteLoadingFallback variant="shell" />
              ) : (
                <Suspense fallback={<RouteLoadingFallback variant="shell" />}>
                  {children ?? <Outlet />}
                  <StartupInteractiveMarker />
                </Suspense>
              )}
            </RouteTransition>
          </AppShell>
          <SettingsOverlay />
          {shouldBlockRouteContent ? null : <ReportOverlay />}
          {/* Generic in-app messages overlay; mounts only once the user and legal
            gates have passed. Non-blocking: it renders nothing while loading or
            on failure. */}
          {shouldBlockRouteContent ? null : <InAppMessageHost />}
          {roomShareUrl ? (
            <ShareDialog
              getMessage={(fullUrl) =>
                t('rooms.detail.share.message', {
                  values: { name: roomShareName, url: fullUrl },
                })
              }
              isOpen={isRoomShareOpen}
              onClose={closeRoomShare}
              subject={t('rooms.detail.share.subject', {
                values: { name: roomShareName },
              })}
              url={roomShareUrl}
            />
          ) : null}
        </RoomDetailMobileHeaderLeadingActionProvider>
      </PageMobileHeaderActionProvider>
    </PageHeaderBackActionProvider>
  );
}

function AppLayoutWithSettingsNavigation({
  children,
  currentUserError,
  legalDocumentsUnavailable,
  onLogout,
  onRetryCurrentUser,
  shouldBlockRouteContent,
}: AppLayoutProps & {
  currentUserError: unknown | null;
  legalDocumentsUnavailable: boolean;
  onLogout: () => void;
  onRetryCurrentUser: () => void;
  shouldBlockRouteContent: boolean;
}) {
  return (
    <SettingsNavigationProvider>
      <ReportOverlayProvider>
        <AppLayoutContent
          currentUserError={currentUserError}
          legalDocumentsUnavailable={legalDocumentsUnavailable}
          onLogout={onLogout}
          onRetryCurrentUser={onRetryCurrentUser}
          shouldBlockRouteContent={shouldBlockRouteContent}
        >
          {children}
        </AppLayoutContent>
      </ReportOverlayProvider>
    </SettingsNavigationProvider>
  );
}

function AppLayoutGate({ children }: AppLayoutProps = {}) {
  const { hasPendingLegalAcceptances, logout, user } = useAuth();
  const location = useLocation();
  const {
    data: currentUser,
    error: currentUserError,
    isLoading: isCurrentUserLoading,
    refetch: refetchCurrentUser,
  } = useQuery({
    enabled: user !== null,
    queryFn: () => sdk.users.me.get(),
    queryKey: meQueryKey(user?.id ?? ''),
    retry: false,
    staleTime: 60_000,
  });

  const hasPendingFromMe =
    currentUser !== undefined
      ? currentUser.requiredLegalAcceptances.length > 0
      : null;
  const effectiveHasPendingLegalAcceptances =
    hasPendingFromMe ?? hasPendingLegalAcceptances;
  const isOnLegalUpdates = location.pathname === '/legal-updates';

  if (
    !currentUserError &&
    effectiveHasPendingLegalAcceptances &&
    !isOnLegalUpdates
  ) {
    return <Navigate to="/legal-updates" replace />;
  }

  return (
    <AppLayoutWithSettingsNavigation
      currentUserError={currentUserError}
      legalDocumentsUnavailable={
        currentUser?.legalDocumentsUnavailable ?? false
      }
      onLogout={() => void logout()}
      onRetryCurrentUser={() => void refetchCurrentUser()}
      shouldBlockRouteContent={
        isCurrentUserLoading ||
        currentUserError !== null ||
        (currentUser?.legalDocumentsUnavailable ?? false) ||
        (effectiveHasPendingLegalAcceptances && !isOnLegalUpdates)
      }
    >
      {children}
    </AppLayoutWithSettingsNavigation>
  );
}

export function AppLayout({ children }: AppLayoutProps = {}) {
  return (
    <MobileShellOverlayProvider>
      <MobileHeaderSearchModeProvider>
        <NotificationsPanelProvider>
          <AppLayoutGate>{children}</AppLayoutGate>
        </NotificationsPanelProvider>
      </MobileHeaderSearchModeProvider>
    </MobileShellOverlayProvider>
  );
}
