import { createContext } from 'react';

import type { AuthState, AuthUser } from './types';

// Keep the context object outside the provider implementation. Vite can
// hot-reload the provider and lazy consumers in different generations; a
// recreated context would make the consumer appear to be outside its provider.
export type SessionEndReason = 'logout' | 'invalidation';

export type SessionEndSignal = {
  id: number;
  reason: SessionEndReason;
};

export type AuthContextValue = AuthState & {
  clearSessionEndSignal: () => void;
  commitAuth: (
    user: AuthUser,
    hasPendingLegalAcceptances?: boolean,
  ) => Promise<void>;
  login: (
    accessToken: string,
    user: AuthUser,
    hasPendingLegalAcceptances?: boolean,
    expiresInSeconds?: number,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  retryBootstrap: () => Promise<void>;
  sessionEndSignal: SessionEndSignal | null;
  setHasPendingLegalAcceptances: (value: boolean) => void;
  stageToken: (accessToken: string, expiresInSeconds?: number) => Promise<void>;
  updateUser: (user: AuthUser) => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
