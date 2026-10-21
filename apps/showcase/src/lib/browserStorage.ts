import { APP_LOCALES, type AppLocale } from '@towelbooks/schemas';

export const browserStorageKeys = {
  localePreference: 'towelbooks-locale',
  sidebarBehaviorPreference: 'towelbooks-sidebar-behavior-preference',
  analyticsConsent: 'towelbooks-analytics-consent',
} as const;

export type SidebarBehaviorStorageValue = 'collapsed' | 'expanded' | 'hover';
export type AnalyticsConsentValue = 'granted' | 'denied';
export type VisitorCookiePreferences = {
  analytics: AnalyticsConsentValue;
};

type SafeStorage = Pick<Storage, 'getItem' | 'setItem'>;

const localePreferenceValues = new Set<AppLocale>(APP_LOCALES);

const sidebarBehaviorValues = new Set<SidebarBehaviorStorageValue>([
  'collapsed',
  'expanded',
  'hover',
]);

function getBrowserStorage(): SafeStorage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const storage = window.localStorage;

  if (
    !storage ||
    typeof storage.getItem !== 'function' ||
    typeof storage.setItem !== 'function'
  ) {
    return null;
  }

  return storage;
}

function safeReadStorageValue(key: string): string | null {
  const storage = getBrowserStorage();

  if (!storage) {
    return null;
  }

  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeWriteStorageValue(key: string, value: string): boolean {
  const storage = getBrowserStorage();

  if (!storage) {
    return false;
  }

  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function isSidebarBehaviorStorageValue(
  value: string | null | undefined,
): value is SidebarBehaviorStorageValue {
  return (
    value !== null &&
    value !== undefined &&
    sidebarBehaviorValues.has(value as SidebarBehaviorStorageValue)
  );
}

export function isLocaleStorageValue(
  value: string | null | undefined,
): value is AppLocale {
  return (
    value !== null &&
    value !== undefined &&
    localePreferenceValues.has(value as AppLocale)
  );
}

export function readStoredLocalePreference(
  fallback: AppLocale | null = null,
): AppLocale | null {
  const storedValue = safeReadStorageValue(browserStorageKeys.localePreference);

  return isLocaleStorageValue(storedValue) ? storedValue : fallback;
}

export function readStoredSidebarBehaviorPreference(
  fallback: SidebarBehaviorStorageValue = 'expanded',
): SidebarBehaviorStorageValue {
  const storedValue = safeReadStorageValue(
    browserStorageKeys.sidebarBehaviorPreference,
  );

  return isSidebarBehaviorStorageValue(storedValue) ? storedValue : fallback;
}

export function writeStoredLocalePreference(value: AppLocale): boolean {
  return safeWriteStorageValue(browserStorageKeys.localePreference, value);
}

export function writeStoredSidebarBehaviorPreference(
  value: SidebarBehaviorStorageValue,
): boolean {
  return safeWriteStorageValue(
    browserStorageKeys.sidebarBehaviorPreference,
    value,
  );
}

const analyticsConsentValues = new Set<AnalyticsConsentValue>([
  'granted',
  'denied',
]);

export function isAnalyticsConsentValue(
  value: string | null | undefined,
): value is AnalyticsConsentValue {
  return (
    value !== null &&
    value !== undefined &&
    analyticsConsentValues.has(value as AnalyticsConsentValue)
  );
}

export function readStoredAnalyticsConsent(): AnalyticsConsentValue | null {
  return readStoredVisitorCookiePreferences()?.analytics ?? null;
}

export function readStoredVisitorCookiePreferences(): VisitorCookiePreferences | null {
  const storedValue = safeReadStorageValue(browserStorageKeys.analyticsConsent);

  if (!storedValue) {
    return null;
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue);

    if (
      typeof parsedValue !== 'object' ||
      parsedValue === null ||
      Object.keys(parsedValue).length !== 1 ||
      !('analytics' in parsedValue) ||
      typeof parsedValue.analytics !== 'string' ||
      !isAnalyticsConsentValue(parsedValue.analytics)
    ) {
      return null;
    }

    return {
      analytics: parsedValue.analytics,
    };
  } catch {
    return null;
  }
}

export function writeStoredVisitorCookiePreferences(
  value: VisitorCookiePreferences,
): boolean {
  return safeWriteStorageValue(
    browserStorageKeys.analyticsConsent,
    JSON.stringify(value),
  );
}

export function writeStoredAnalyticsConsent(
  value: AnalyticsConsentValue,
): boolean {
  return writeStoredVisitorCookiePreferences({ analytics: value });
}
