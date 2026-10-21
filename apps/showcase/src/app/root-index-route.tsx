import { Navigate, useLocation } from 'react-router';

import { lazyNamedPage } from './lazy-page';
import { resolvePostLoginRedirect } from '../features/auth/redirects';

const DashboardPage = lazyNamedPage(
  () => import('../pages/DashboardPage'),
  'DashboardPage',
);

export function preloadRootIndexRoute() {
  return DashboardPage.preload();
}

export function AppRootIndexRoute() {
  const location = useLocation();
  const postLoginRedirect = resolvePostLoginRedirect({
    search: location.search,
    state: location.state,
  });

  if (postLoginRedirect !== '/') {
    return <Navigate to={postLoginRedirect} replace />;
  }

  return <DashboardPage />;
}
