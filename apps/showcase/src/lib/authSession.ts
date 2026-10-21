import { ErrorCode } from '@towelbooks/schemas';
import { ApiRequestError } from '@towelbooks/sdk';

import { clearAuthSession } from './authTokenLifecycle';

type SessionInvalidationListener = () => void;

const sessionInvalidationCodes = new Set<string>([
  ErrorCode.AUTH_INVALID_SESSION,
  ErrorCode.UNAUTHENTICATED,
]);

const listeners = new Set<SessionInvalidationListener>();

export function shouldInvalidateSessionForApiError(
  error: ApiRequestError,
): boolean {
  return (
    error.status === 401 && sessionInvalidationCodes.has(error.problem.code)
  );
}

export function invalidateSession(): void {
  clearAuthSession();

  for (const listener of listeners) {
    listener();
  }
}

export function subscribeToSessionInvalidation(
  listener: SessionInvalidationListener,
): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
