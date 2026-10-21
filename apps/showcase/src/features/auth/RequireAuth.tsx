import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';

import { useAuth } from './AuthContext';
import { buildLoginRedirectPath, resolvePostLoginRedirect } from './redirects';
import { LoadingState } from '../../components/feedback';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingState />
      </div>
    );
  }

  if (!isAuthenticated) {
    const from = `${location.pathname}${location.search}${location.hash}`;

    return (
      <Navigate to={buildLoginRedirectPath(from)} state={{ from }} replace />
    );
  }

  return <>{children}</>;
}

export function RequireGuest({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingState />
      </div>
    );
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

  return <>{children}</>;
}
