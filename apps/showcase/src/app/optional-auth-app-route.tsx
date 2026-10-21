import { Navigate, Outlet, useLocation } from 'react-router';

import { LazyRoute } from './LazyRoute';
import { RouteLoadingFallback } from './RouteLoadingFallback';
import { lazyNamedPage } from './lazy-page';
import { useAuth } from '../features/auth/AuthContext';
import { RequireAuth } from '../features/auth/RequireAuth';
import { ReportOverlayProvider } from '../features/reports/ReportOverlayContext';
import { buildLoginRedirectPath } from '../features/auth/redirects';

const AppLayout = lazyNamedPage(
  () => import('../layouts/AppLayout'),
  'AppLayout',
);

function getCurrentRoute(location: ReturnType<typeof useLocation>) {
  return `${location.pathname}${location.search}${location.hash}`;
}

function getRouteWithoutHash(location: ReturnType<typeof useLocation>) {
  return `${location.pathname}${location.search}`;
}

/**
 * Renders one route branch for confirmed guests and the same branch inside
 * the authenticated shell for signed-in users.
 *
 * Resource visibility belongs to the page and its API. This route only owns
 * auth bootstrap state and shell selection.
 */
export function OptionalAuthAppRoute() {
  const { bootstrapStatus, isAuthenticated, isLoading, sessionEndSignal } =
    useAuth();
  const location = useLocation();

  if (isLoading) {
    return <RouteLoadingFallback />;
  }

  if (!isAuthenticated) {
    if (sessionEndSignal || bootstrapStatus === 'unavailable') {
      const currentRoute = getCurrentRoute(location);
      const routeWithoutHash = getRouteWithoutHash(location);
      const from =
        sessionEndSignal?.reason === 'invalidation'
          ? routeWithoutHash
          : currentRoute;

      return (
        <Navigate
          replace
          state={sessionEndSignal?.reason === 'logout' ? undefined : { from }}
          to={buildLoginRedirectPath(from)}
        />
      );
    }

    return (
      <ReportOverlayProvider>
        <LazyRoute>
          <Outlet />
        </LazyRoute>
      </ReportOverlayProvider>
    );
  }

  return (
    <RequireAuth>
      <LazyRoute>
        <AppLayout />
      </LazyRoute>
    </RequireAuth>
  );
}
