import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  readStoredAnalyticsConsent,
  writeStoredAnalyticsConsent,
  browserStorageKeys,
  type AnalyticsConsentValue,
} from '../../lib/browserStorage';
import { sdk } from '../../lib/sdk';
import { useAuth } from '../auth/AuthContext';
import {
  getGTMContainerId,
  NoOpAnalyticsService,
  setActiveService,
  shutdownGtmAfterConsentWithdrawal,
} from '../analytics';
import { privacyPreferencesQueryKey } from './privacyPreferencesQuery';

export type AnalyticsConsentState =
  | { status: 'resolving'; effective: 'denied'; source: 'safe_default' }
  | {
      status: 'resolved';
      effective: AnalyticsConsentValue;
      source: 'browser' | 'safe_default' | 'account';
    }
  | { status: 'error'; effective: 'denied'; source: 'safe_default' };

type AnalyticsConsentContextValue = {
  state: AnalyticsConsentState;
  visitorChoice: AnalyticsConsentValue | null;
  saveConsent: (value: AnalyticsConsentValue) => Promise<boolean>;
};

const AnalyticsConsentContext =
  createContext<AnalyticsConsentContextValue | null>(null);

export function AnalyticsConsentProvider({ children }: PropsWithChildren) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [visitorChoice, setVisitorChoice] =
    useState<AnalyticsConsentValue | null>(() => readStoredAnalyticsConsent());
  const preferenceQuery = useQuery({
    enabled: Boolean(getGTMContainerId()) && isAuthenticated && user !== null,
    queryFn: () => sdk.privacy.getPreferences(),
    queryKey: privacyPreferencesQueryKey(user?.id ?? ''),
    retry: false,
  });

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === browserStorageKeys.analyticsConsent) {
        setVisitorChoice(readStoredAnalyticsConsent());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const state = useMemo<AnalyticsConsentState>(() => {
    if (isLoading)
      return {
        status: 'resolving',
        effective: 'denied',
        source: 'safe_default',
      };
    if (!isAuthenticated || !user) {
      return visitorChoice
        ? { status: 'resolved', effective: visitorChoice, source: 'browser' }
        : { status: 'resolved', effective: 'denied', source: 'safe_default' };
    }
    if (preferenceQuery.isError)
      return { status: 'error', effective: 'denied', source: 'safe_default' };
    if (!preferenceQuery.data)
      return {
        status: 'resolving',
        effective: 'denied',
        source: 'safe_default',
      };
    return {
      status: 'resolved',
      effective: preferenceQuery.data.productAnalyticsOptIn
        ? 'granted'
        : 'denied',
      source: 'account',
    };
  }, [
    isAuthenticated,
    isLoading,
    preferenceQuery.data,
    preferenceQuery.isError,
    user,
    visitorChoice,
  ]);

  const saveConsent = useCallback(
    async (value: AnalyticsConsentValue) => {
      let storedWithdrawal = true;

      if (value === 'denied') {
        // Stop the current document before waiting for the account mutation.
        // A failed request must never resume an already-withdrawn runtime.
        storedWithdrawal = writeStoredAnalyticsConsent('denied');
        setVisitorChoice('denied');
        setActiveService(new NoOpAnalyticsService());
        shutdownGtmAfterConsentWithdrawal();
      }

      if (isAuthenticated && user) {
        const updated = await sdk.privacy.updatePreferences({
          productAnalyticsOptIn: value === 'granted',
        });
        queryClient.setQueryData(privacyPreferencesQueryKey(user.id), updated);
        return true;
      }

      if (value === 'denied') {
        return storedWithdrawal;
      }

      if (!writeStoredAnalyticsConsent(value)) return false;
      setVisitorChoice(value);
      return true;
    },
    [isAuthenticated, queryClient, user],
  );

  return (
    <AnalyticsConsentContext.Provider
      value={{ saveConsent, state, visitorChoice }}
    >
      {children}
    </AnalyticsConsentContext.Provider>
  );
}

export function useAnalyticsConsent() {
  const context = useContext(AnalyticsConsentContext);
  if (!context)
    throw new Error(
      'useAnalyticsConsent must be used within AnalyticsConsentProvider',
    );
  return context;
}
