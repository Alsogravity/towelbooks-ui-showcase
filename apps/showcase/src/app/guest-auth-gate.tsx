import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';

import { useAuth } from '../features/auth/AuthContext';
import { isGuestAuthPath } from '../features/auth/authShell';
import { resolvePostLoginRedirect } from '../features/auth/redirects';
import { markStartupPhase } from '../lib/startupTelemetry';

export function GuestAuthGate() {
  const { clearSessionEndSignal, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading) {
      markStartupPhase('route-gate-ready');
    }

    if (!isLoading && !isAuthenticated && isGuestAuthPath(location.pathname)) {
      clearSessionEndSignal();
    }
  }, [clearSessionEndSignal, isAuthenticated, isLoading, location.pathname]);

  if (isLoading) {
    return <Outlet />;
  }

  if (isAuthenticated) {
    return (
      <Navigate
        to={resolvePostLoginRedirect({
          search: location.search,
          state: location.state,
        })}
        replace
      />
    );
  }

  if (!isGuestAuthPath(location.pathname)) {
    return null;
  }

  return <Outlet />;
}
