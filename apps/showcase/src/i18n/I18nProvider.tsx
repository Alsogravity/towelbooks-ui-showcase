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
  interpolate,
  toDate,
  type DateInput,
  type TranslateOptions,
} from './format';
import {
  APP_LOCALES,
  DEFAULT_APP_LOCALE,
  type AppLocale,
  type TranslationValues,
} from './locales';
import {
  messagesByLocale,
  ensureLocaleMessages,
  isLocaleCatalogLoaded,
  type MessageKey,
} from './messages';
import {
  browserStorageKeys,
  readStoredLocalePreference,
  writeStoredLocalePreference,
} from '../lib/browserStorage';
import { markStartupPhase } from '../lib/startupTelemetry';

export type TranslationDescriptor = {
  key: MessageKey;
  fallback?: string;
  values?: TranslationValues;
};

export type LocalizedText = string | TranslationDescriptor;

export type Translate = {
  (key: MessageKey, options?: TranslateOptions): string;
  (key: string, options?: TranslateOptions): string;
};

type I18nContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: Translate;
  formatDate: (
    value: DateInput,
    options?: Intl.DateTimeFormatOptions,
  ) => string;
  formatDateTime: (
    value: DateInput,
    options?: Intl.DateTimeFormatOptions,
  ) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
};

type I18nProviderProps = PropsWithChildren<{
  initialLocale?: AppLocale;
}>;

export const localePreferenceStorageKey = browserStorageKeys.localePreference;

export function isCanonicalAppLocale(
  value: string | null | undefined,
): value is AppLocale {
  return (
    value !== null &&
    value !== undefined &&
    APP_LOCALES.includes(value as AppLocale)
  );
}

export function resolveBrowserLocale(
  value: string | null | undefined,
): AppLocale | null {
  if (!value) {
    return null;
  }

  const normalizedValue = value.toLowerCase();

  if (normalizedValue === 'pt' || normalizedValue.startsWith('pt-')) {
    return 'pt-BR';
  }

  if (normalizedValue === 'en' || normalizedValue.startsWith('en-')) {
    return 'en-US';
  }

  return null;
}

export function getBrowserLocale(): AppLocale {
  if (typeof navigator === 'undefined') {
    return DEFAULT_APP_LOCALE;
  }

  const preferredLocales = [...(navigator.languages ?? []), navigator.language];

  for (const preferredLocale of preferredLocales) {
    const resolvedLocale = resolveBrowserLocale(preferredLocale);

    if (resolvedLocale) {
      return resolvedLocale;
    }
  }

  return DEFAULT_APP_LOCALE;
}

export function getDocumentLocale(): AppLocale | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const locale = document.documentElement.lang;
  return isCanonicalAppLocale(locale) ? locale : null;
}

export function getStoredLocale(): AppLocale | null {
  const locale = readStoredLocalePreference();
  return isCanonicalAppLocale(locale) ? locale : null;
}

export function getInitialLocale(): AppLocale {
  const storedLocale = getStoredLocale();

  if (storedLocale) {
    return storedLocale;
  }

  if (typeof navigator === 'undefined') {
    return getDocumentLocale() ?? DEFAULT_APP_LOCALE;
  }

  return getBrowserLocale();
}

function translate(
  locale: AppLocale,
  key: string,
  options?: TranslateOptions,
): string {
  const message =
    messagesByLocale[locale][key as MessageKey] ??
    messagesByLocale[DEFAULT_APP_LOCALE][key as MessageKey] ??
    options?.fallback;

  if (message == null) {
    if (process.env.NODE_ENV === 'test') {
      throw new Error(
        `Missing translation key: "${key}" for locale "${locale}". ` +
          `Add the key to both pt-BR and en-US catalogs.`,
      );
    }

    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `[@towelbooks/i18n] Missing translation key: "${key}" for locale "${locale}".`,
      );
    }

    return key;
  }

  return interpolate(message, options?.values);
}

export function resolveLocalizedText(value: LocalizedText, t: Translate) {
  if (typeof value === 'string') {
    return value;
  }

  return t(value.key, {
    fallback: value.fallback,
    values: value.values,
  });
}

function createI18nContextValue(
  locale: AppLocale,
  setLocale: (locale: AppLocale) => void,
): I18nContextValue {
  return {
    locale,
    setLocale,
    t: (key, options) => translate(locale, key, options),
    formatDate: (value, options) =>
      new Intl.DateTimeFormat(locale, options).format(toDate(value)),
    formatDateTime: (value, options) =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
        ...options,
      }).format(toDate(value)),
    formatNumber: (value, options) =>
      new Intl.NumberFormat(locale, options).format(value),
  };
}

const defaultContextValue = createI18nContextValue(
  DEFAULT_APP_LOCALE,
  () => undefined,
);

const I18nContext = createContext<I18nContextValue>(defaultContextValue);

function I18nCatalogFallback({
  hasError,
  locale,
  onRetry,
}: {
  hasError: boolean;
  locale: AppLocale;
  onRetry: () => void;
}) {
  const isEnglish = locale === 'en-US';
  const loadingMessage = isEnglish
    ? 'Loading TowelBooks…'
    : 'Carregando o TowelBooks…';
  const errorMessage = isEnglish
    ? 'The application language could not be loaded.'
    : 'Não foi possível carregar o idioma da aplicação.';
  const retryLabel = isEnglish ? 'Try again' : 'Tentar novamente';

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4 py-12">
      <div
        aria-live="polite"
        className="flex w-full max-w-md flex-col items-center gap-4 text-center"
        role={hasError ? 'alert' : 'status'}
      >
        <p className="text-sm text-ink-2">
          {hasError ? errorMessage : loadingMessage}
        </p>
        {hasError && (
          <button
            className="text-sm text-ink underline underline-offset-2"
            onClick={onRetry}
            type="button"
          >
            {retryLabel}
          </button>
        )}
      </div>
    </main>
  );
}

export function I18nProvider({
  children,
  initialLocale = DEFAULT_APP_LOCALE,
}: I18nProviderProps) {
  const [locale, setLocaleState] = useState<AppLocale>(initialLocale);
  // Bumped after an async catalog load so we re-read isLocaleCatalogLoaded.
  const [, setCatalogEpoch] = useState(0);
  const [catalogLoadAttempt, setCatalogLoadAttempt] = useState(0);
  const [catalogLoadFailed, setCatalogLoadFailed] = useState(false);

  useEffect(() => {
    if (isLocaleCatalogLoaded(locale)) {
      return;
    }

    let cancelled = false;
    void ensureLocaleMessages(locale)
      .then(() => {
        if (!cancelled) {
          setCatalogLoadFailed(false);
          setCatalogEpoch((value) => value + 1);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCatalogLoadFailed(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [catalogLoadAttempt, locale]);

  const setLocale = useCallback((nextLocale: AppLocale) => {
    // Keep the SDK's request locale in sync immediately, before the lazy
    // catalog finishes loading and before the state effect runs.
    writeStoredLocalePreference(nextLocale);
    void ensureLocaleMessages(nextLocale).then(() => {
      setLocaleState(nextLocale);
    });
  }, []);
  const value = useMemo(
    () => createI18nContextValue(locale, setLocale),
    [locale, setLocale],
  );

  useEffect(() => {
    // AppLocale is a document-wide concern: persist it and reflect it on <html>.
    // Per-route document metadata (description, Open Graph, Twitter) lives in
    // DocumentMetadataProvider so each route can declare its own.
    writeStoredLocalePreference(locale);
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== localePreferenceStorageKey) {
        return;
      }

      const nextLocale = isCanonicalAppLocale(event.newValue)
        ? event.newValue
        : null;

      if (!nextLocale || nextLocale === locale) {
        return;
      }

      void ensureLocaleMessages(nextLocale).then(() => {
        setLocaleState(nextLocale);
      });
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [locale]);

  const catalogReady = isLocaleCatalogLoaded(locale);

  useEffect(() => {
    if (catalogReady) {
      markStartupPhase('i18n-ready');
    }
  }, [catalogReady]);

  if (!catalogReady) {
    return (
      <I18nCatalogFallback
        hasError={catalogLoadFailed}
        locale={locale}
        onRetry={() => {
          setCatalogLoadFailed(false);
          setCatalogLoadAttempt((value) => value + 1);
        }}
      />
    );
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
