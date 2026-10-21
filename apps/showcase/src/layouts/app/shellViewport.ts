import { useSyncExternalStore } from 'react';

export const belowSmMediaQuery = '(max-width: 639px)';
export const compactShellMediaQuery = '(max-width: 1023px)';
/** Tailwind `md` and up — filter UI uses a centered dialog instead of a bottom sheet. */
export const filterBottomSheetMediaQuery = '(max-width: 767px)';
export const desktopShellMediaQuery = '(min-width: 1024px)';
export const wideDesktopShellMediaQuery = '(min-width: 1280px)';

function getMatches(mediaQuery: string, fallback: () => boolean) {
  if (typeof window === 'undefined') {
    return false;
  }

  if (typeof window.matchMedia === 'function') {
    return window.matchMedia(mediaQuery).matches;
  }

  return fallback();
}

function subscribeToMediaQuery(mediaQuery: string, callback: () => void) {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return () => undefined;
  }

  const mediaQueryList = window.matchMedia(mediaQuery);
  const handleChange = () => {
    callback();
  };

  mediaQueryList.addEventListener('change', handleChange);

  return () => {
    mediaQueryList.removeEventListener('change', handleChange);
  };
}

export function useMediaQuery(mediaQuery: string, fallback: () => boolean) {
  return useSyncExternalStore(
    (callback) => subscribeToMediaQuery(mediaQuery, callback),
    () => getMatches(mediaQuery, fallback),
    () => false,
  );
}

export function useIsBelowSmViewport() {
  return useMediaQuery(belowSmMediaQuery, () => window.innerWidth < 640);
}

export function useIsCompactShellViewport() {
  return useMediaQuery(compactShellMediaQuery, () => window.innerWidth < 1024);
}

export function useIsFilterBottomSheetViewport() {
  return useMediaQuery(
    filterBottomSheetMediaQuery,
    () => window.innerWidth < 768,
  );
}

export function useIsDesktopShellViewport() {
  return useMediaQuery(desktopShellMediaQuery, () => window.innerWidth >= 1024);
}

export function useIsWideDesktopShellViewport() {
  return useMediaQuery(
    wideDesktopShellMediaQuery,
    () => window.innerWidth >= 1280,
  );
}
