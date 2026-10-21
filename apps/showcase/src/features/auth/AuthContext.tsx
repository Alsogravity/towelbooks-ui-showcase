import {
  DEFAULT_APP_LOCALE,
  getBrowserLocale,
  getInitialLocale,
  useI18n,
} from '../../i18n';
import { useContext, useState, useRef, useEffect, type ReactNode } from 'react';
import { AuthContext } from './auth-context';
import type { AuthUser } from './types';
import { demoUser } from '../../demo/fixtures';
export type { SessionEndReason, SessionEndSignal } from './auth-context';
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() =>
    window.location.pathname.startsWith('/demo') ? demoUser : null,
  );
  const commitAuth = async (next: AuthUser) => {
    setUser(next);
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading: false,
        bootstrapStatus: 'resolved',
        hasPendingLegalAcceptances: false,
        sessionEndSignal: null,
        clearSessionEndSignal: () => {},
        commitAuth,
        login: async (_token, next) => {
          setUser(next);
        },
        logout: async () => {
          window.location.assign('/');
        },
        refresh: async () => {},
        retryBootstrap: async () => {},
        setHasPendingLegalAcceptances: () => {},
        stageToken: async () => {},
        updateUser: setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
function getAuthenticatedLocale(
  user: AuthUser,
): ReturnType<typeof getBrowserLocale> {
  if (user.localeMode === 'auto') {
    return getBrowserLocale();
  }

  return user.locale ?? DEFAULT_APP_LOCALE;
}

export function AuthLocaleSync() {
  const { locale, setLocale } = useI18n();
  const { isAuthenticated, user } = useAuth();
  const unauthenticatedLocale = useRef(getInitialLocale());
  const previousAuthState = useRef(isAuthenticated);
  const skipLocaleCapture = useRef(false);
  const lastAppliedUserLocale = useRef<string | null>(null);

  useEffect(() => {
    const wasAuthenticated = previousAuthState.current;

    if (isAuthenticated && user) {
      const nextLocale = getAuthenticatedLocale(user);
      const localeKey = `${user.id}:${nextLocale}`;

      if (lastAppliedUserLocale.current !== localeKey) {
        lastAppliedUserLocale.current = localeKey;
        setLocale(nextLocale);
      }
    } else if (!isAuthenticated && wasAuthenticated) {
      skipLocaleCapture.current = true;
      setLocale(unauthenticatedLocale.current);
      lastAppliedUserLocale.current = null;
    }

    previousAuthState.current = isAuthenticated;
  }, [isAuthenticated, setLocale, user]);

  useEffect(() => {
    if (!isAuthenticated) {
      if (skipLocaleCapture.current) {
        skipLocaleCapture.current = false;
        return;
      }

      unauthenticatedLocale.current = locale;
    }
  }, [isAuthenticated, locale]);

  return null;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthProvider required');
  return context;
}
