export const themePreferenceStorageKey = 'towelbooks-theme-preference';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

type SafeStorage = Pick<Storage, 'getItem' | 'setItem'>;

function getBrowserStorage(): SafeStorage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  let storage: Storage;

  try {
    storage = window.localStorage;
  } catch {
    return null;
  }

  if (
    !storage ||
    typeof storage.getItem !== 'function' ||
    typeof storage.setItem !== 'function'
  ) {
    return null;
  }

  return storage;
}

export function isThemePreference(
  value: string | null | undefined,
): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

export function parseThemePreference(
  value: string | null | undefined,
): ThemePreference {
  return isThemePreference(value) ? value : 'system';
}

export function readThemePreference(
  fallback: ThemePreference = 'system',
): ThemePreference {
  const storage = getBrowserStorage();

  if (!storage) {
    return fallback;
  }

  try {
    const storedValue = storage.getItem(themePreferenceStorageKey);
    return isThemePreference(storedValue) ? storedValue : fallback;
  } catch {
    return fallback;
  }
}

export function getSystemThemePreference(): ResolvedTheme {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function resolveThemePreference(
  preference: ThemePreference,
  systemTheme: ResolvedTheme = getSystemThemePreference(),
): ResolvedTheme {
  return preference === 'system' ? systemTheme : preference;
}

export function applyResolvedThemeToDocument(resolvedTheme: ResolvedTheme) {
  if (typeof document === 'undefined') {
    return;
  }

  if (resolvedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    return;
  }

  document.documentElement.removeAttribute('data-theme');
}

export function persistThemePreference(preference: ThemePreference): boolean {
  const storage = getBrowserStorage();

  if (!storage) {
    return false;
  }

  try {
    storage.setItem(themePreferenceStorageKey, preference);
    return true;
  } catch {
    // Visual preferences are best effort when browser storage is unavailable.
    return false;
  }
}
