import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

import {
  applyResolvedThemeToDocument,
  getSystemThemePreference,
  parseThemePreference,
  persistThemePreference,
  readThemePreference,
  resolveThemePreference,
  themePreferenceStorageKey,
  type ResolvedTheme,
  type ThemePreference,
} from './theme';

type ThemeContextValue = {
  effectiveTheme: ResolvedTheme;
  setThemePreference: (preference: ThemePreference) => void;
  themePreference: ThemePreference;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const themeTransitionAttribute = 'data-theme-transition';
// Keep this in sync with the theme-switch transition duration in app styles.
const themeTransitionDurationMs = 300;

export function ThemeProvider({ children }: PropsWithChildren) {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(
    () => readThemePreference(),
  );
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() =>
    getSystemThemePreference(),
  );

  const effectiveTheme = resolveThemePreference(themePreference, systemTheme);
  const isInitialApplyRef = useRef(true);

  useLayoutEffect(() => {
    if (isInitialApplyRef.current) {
      isInitialApplyRef.current = false;
      applyResolvedThemeToDocument(effectiveTheme);
      return;
    }

    if (typeof document === 'undefined' || typeof window === 'undefined') {
      applyResolvedThemeToDocument(effectiveTheme);
      return;
    }

    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      applyResolvedThemeToDocument(effectiveTheme);
      return;
    }

    const { documentElement } = document;
    const styleEl = document.createElement('style');
    let timeoutId: number | undefined;

    styleEl.appendChild(
      document.createTextNode(
        '*,*::before,*::after{transition:none!important}',
      ),
    );
    document.head.appendChild(styleEl);
    documentElement.setAttribute(themeTransitionAttribute, 'active');

    const frameId = window.requestAnimationFrame(() => {
      styleEl.remove();
      applyResolvedThemeToDocument(effectiveTheme);
      timeoutId = window.setTimeout(() => {
        documentElement.removeAttribute(themeTransitionAttribute);
      }, themeTransitionDurationMs);
    });

    return () => {
      window.cancelAnimationFrame(frameId);

      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }

      styleEl.remove();
      documentElement.removeAttribute(themeTransitionAttribute);
    };
  }, [effectiveTheme]);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== themePreferenceStorageKey) {
        return;
      }

      setThemePreferenceState(parseThemePreference(event.newValue));
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const setThemePreference = useCallback((preference: ThemePreference) => {
    setThemePreferenceState(preference);
    persistThemePreference(preference);
  }, []);

  const value = useMemo(
    () => ({
      effectiveTheme,
      setThemePreference,
      themePreference,
    }),
    [effectiveTheme, setThemePreference, themePreference],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useThemePreference() {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useThemePreference must be used within a ThemeProvider');
  }

  return context;
}

export function useEffectiveTheme(): ResolvedTheme {
  const context = useContext(ThemeContext);

  if (context !== undefined) {
    return context.effectiveTheme;
  }

  if (
    typeof document !== 'undefined' &&
    document.documentElement.getAttribute('data-theme') === 'dark'
  ) {
    return 'dark';
  }

  return getSystemThemePreference();
}
