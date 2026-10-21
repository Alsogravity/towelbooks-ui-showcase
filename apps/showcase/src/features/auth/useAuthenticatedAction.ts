import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { useAuth } from './AuthContext';
import { buildLoginRedirectPath } from './redirects';

export type AuthenticatedAction = () => void;

/**
 * Runs a protected UI action only after authentication has been resolved.
 * Anonymous viewers are returned to the current internal route after login;
 * the action itself is intentionally never retained or replayed.
 */
export function useAuthenticatedAction() {
  const { bootstrapStatus, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return useCallback(
    (action: AuthenticatedAction) => {
      if (isLoading || bootstrapStatus === 'loading') {
        return;
      }

      if (!isAuthenticated) {
        const from = `${location.pathname}${location.search}${location.hash}`;
        const loginPath = buildLoginRedirectPath(from);

        void navigate(loginPath, {
          state: loginPath === '/login' ? undefined : { from },
        });
        return;
      }

      action();
    },
    [bootstrapStatus, isAuthenticated, isLoading, location, navigate],
  );
}
