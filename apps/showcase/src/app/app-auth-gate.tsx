import { Suspense, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router';

import { LoadingState } from '../components/feedback';
import { useAuth } from '../features/auth/AuthContext';
import { isGuestAuthPath } from '../features/auth/authShell';
import { buildLoginRedirectPath } from '../features/auth/redirects';
import { isSettingsHashOpen } from '../features/settings/settingsHash';
import { RequireAuth } from '../features/auth/RequireAuth';
import { GuestLandingPage } from '../pages/GuestLandingPage';
import {
  markStartupPhase,
  useMarkStartupInteractive,
} from '../lib/startupTelemetry';
import { lazyNamedPage } from './lazy-page';
import { preloadAppShellRoute } from './app-shell-routes';

// Eager GuestLanding avoids a Slow-4G chunk waterfall on `/`. AppLayout stays
// lazy so authenticated shell / settings stay off the guest critical path.
const AppLayout = lazyNamedPage(
  () => import('../layouts/AppLayout'),
  'AppLayout',
);

function RouteChunkFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingState />
    </div>
  );
}

function GuestLandingStartupView() {
  useMarkStartupInteractive();
  return <GuestLandingPage />;
}

export function AppAuthGate() {
  const { bootstrapStatus, isAuthenticated, isLoading, sessionEndSignal } =
    useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading) {
      markStartupPhase('route-gate-ready');
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    void AppLayout.preload().catch(() => undefined);
    void preloadAppShellRoute(location.pathname).catch(() => undefined);
  }, [isAuthenticated, location.pathname]);

  if (isLoading) {
    if (location.pathname === '/' && !isSettingsHashOpen(location.hash)) {
      return <GuestLandingStartupView />;
    }

    return <RouteChunkFallback />;
  }

  if (!isAuthenticated) {
    if (sessionEndSignal) {
      const from = `${location.pathname}${location.search}${location.hash}`;
      const fromWithoutHash = location.pathname + location.search;
      const target =
        sessionEndSignal.reason === 'invalidation'
          ? buildLoginRedirectPath(fromWithoutHash)
          : buildLoginRedirectPath(from);

      return (
        <Navigate
          to={target}
          state={
            sessionEndSignal.reason === 'invalidation'
              ? { from: fromWithoutHash }
              : undefined
          }
          replace
        />
      );
    }

    if (bootstrapStatus === 'unavailable') {
      const from = `${location.pathname}${location.search}${location.hash}`;

      return (
        <Navigate to={buildLoginRedirectPath(from)} state={{ from }} replace />
      );
    }

    if (location.pathname === '/' && !isSettingsHashOpen(location.hash)) {
      return <GuestLandingStartupView />;
    }

    if (isGuestAuthPath(location.pathname)) {
      return null;
    }

    const from = `${location.pathname}${location.search}${location.hash}`;

    return (
      <Navigate to={buildLoginRedirectPath(from)} state={{ from }} replace />
    );
  }

  return (
    <RequireAuth>
      <Suspense fallback={<RouteChunkFallback />}>
        <AppLayout />
      </Suspense>
    </RequireAuth>
  );
}
