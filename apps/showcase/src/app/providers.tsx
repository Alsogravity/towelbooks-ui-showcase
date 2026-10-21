import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from '@tanstack/react-query';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';

import { ToastProvider } from '../components/feedback';
import { AnalyticsConsentProvider } from '../features/privacy/AnalyticsConsentContext';
import { DemoNotice } from '../demo/DemoNotice';
import { AuthLocaleSync, AuthProvider } from '../features/auth/AuthContext';
import { ThemeProvider } from '../features/theme/ThemeContext';
import { getInitialLocale, I18nProvider, useI18n } from '../i18n';
import { DocumentMetadataProvider } from './DocumentMetadataProvider';
import { isMaintenanceModeEnabled } from '../lib/maintenanceMode';
import { markStartupPhase } from '../lib/startupTelemetry';

type ProvidersProps = PropsWithChildren<{
  maintenanceMode?: boolean;
}>;

const LOCALIZED_QUERY_ROOTS = [
  ['dashboard', 'room-activities'],
  ['libraries'],
  ['profiles'],
  ['rooms'],
  ['users'],
] as const;

function LocalizedDataRefresher() {
  const queryClient = useQueryClient();
  const { locale } = useI18n();
  const previousLocale = useRef(locale);

  useEffect(() => {
    if (previousLocale.current === locale) {
      return;
    }

    previousLocale.current = locale;
    void Promise.all(
      LOCALIZED_QUERY_ROOTS.map((queryKey) =>
        queryClient.invalidateQueries({ queryKey }),
      ),
    );
  }, [locale, queryClient]);

  return null;
}

export function Providers({
  children,
  maintenanceMode = isMaintenanceModeEnabled(import.meta.env),
}: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  const [initialLocale] = useState(() => getInitialLocale());

  const application = (
    <AnalyticsConsentProvider>{children}</AnalyticsConsentProvider>
  );

  const localizedApplication = (
    <I18nProvider initialLocale={initialLocale}>
      {!maintenanceMode && <AuthLocaleSync />}
      <LocalizedDataRefresher />
      <DocumentMetadataProvider>
        <ToastProvider>
          <DemoNotice />
          {application}
        </ToastProvider>
      </DocumentMetadataProvider>
    </I18nProvider>
  );

  useEffect(() => {
    markStartupPhase('providers-ready');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {maintenanceMode ? (
          localizedApplication
        ) : (
          <AuthProvider>{localizedApplication}</AuthProvider>
        )}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
