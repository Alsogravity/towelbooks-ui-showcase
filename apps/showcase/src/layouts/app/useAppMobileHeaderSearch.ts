import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { useLocation, useSearchParams } from 'react-router';

import {
  buildMobileSearchParams,
  getMobileSearchQuery,
  type MobileSearchRouteConfig,
} from './mobileHeaderRoutes';

import type { RefObject } from 'react';

interface SearchDraftState {
  path: string;
  sourceQuery: string;
  value: string;
}

function resolveSearchValue({
  routeSearchQuery,
  hasSearchRouteConfig,
  pathname,
  searchDraft,
}: {
  routeSearchQuery: string;
  hasSearchRouteConfig: boolean;
  pathname: string;
  searchDraft: SearchDraftState | null;
}) {
  if (searchDraft?.path !== pathname) {
    return hasSearchRouteConfig ? routeSearchQuery : '';
  }

  if (hasSearchRouteConfig && searchDraft.sourceQuery !== routeSearchQuery) {
    return routeSearchQuery;
  }

  return searchDraft.value;
}

export function useAppMobileHeaderSearch({
  inputRef,
  capsuleRef,
  searchRouteConfig,
  isSearchEnabled,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  capsuleRef: RefObject<HTMLDivElement | null>;
  searchRouteConfig: MobileSearchRouteConfig | null;
  isSearchEnabled: boolean;
}) {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const routeSearchQuery = getMobileSearchQuery(
    searchRouteConfig,
    searchParams,
  );
  const [expandedSearchPath, setExpandedSearchPath] = useState<string | null>(
    null,
  );
  const [searchDraft, setSearchDraft] = useState<SearchDraftState | null>(null);
  const isSearchOpen = expandedSearchPath === location.pathname;
  const isCapsuleExpanded = isSearchEnabled && isSearchOpen;
  const searchValue = resolveSearchValue({
    routeSearchQuery,
    hasSearchRouteConfig: searchRouteConfig !== null,
    pathname: location.pathname,
    searchDraft,
  });

  const blurActiveHeaderControl = useCallback(() => {
    const activeElement = document.activeElement;

    if (
      activeElement instanceof HTMLElement &&
      capsuleRef.current?.contains(activeElement)
    ) {
      activeElement.blur();
    }
  }, [capsuleRef]);

  const focusSearchInput = useCallback(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, [inputRef]);

  const closeSearch = useCallback(() => {
    blurActiveHeaderControl();
    flushSync(() => {
      setExpandedSearchPath(null);
      setSearchDraft(null);
    });
    if (searchRouteConfig !== null && routeSearchQuery.length > 0) {
      setSearchParams(
        (previousParams) =>
          buildMobileSearchParams(searchRouteConfig, previousParams, ''),
        { replace: true },
      );
    }
    window.requestAnimationFrame(() => {
      blurActiveHeaderControl();
    });
  }, [
    blurActiveHeaderControl,
    routeSearchQuery,
    searchRouteConfig,
    setExpandedSearchPath,
    setSearchDraft,
    setSearchParams,
  ]);

  const openSearch = useCallback(() => {
    if (!isSearchEnabled) {
      return;
    }

    flushSync(() => {
      setExpandedSearchPath(location.pathname);
    });
    focusSearchInput();
  }, [
    focusSearchInput,
    isSearchEnabled,
    location.pathname,
    setExpandedSearchPath,
  ]);

  useLayoutEffect(() => {
    if (!isCapsuleExpanded) {
      blurActiveHeaderControl();
      return;
    }

    if (document.activeElement !== inputRef.current) {
      focusSearchInput();
    }
  }, [blurActiveHeaderControl, focusSearchInput, inputRef, isCapsuleExpanded]);

  useEffect(() => {
    if (searchRouteConfig === null) {
      return;
    }

    const nextQuery = searchValue.trim();

    if (nextQuery === routeSearchQuery) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSearchParams(
        (previousParams) =>
          buildMobileSearchParams(searchRouteConfig, previousParams, nextQuery),
        { replace: true },
      );
    }, 275);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [routeSearchQuery, searchRouteConfig, searchValue, setSearchParams]);

  useEffect(() => {
    if (!isCapsuleExpanded) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        capsuleRef.current?.contains(event.target)
      ) {
        return;
      }

      if (searchValue.length > 0) {
        return;
      }

      closeSearch();
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [capsuleRef, closeSearch, isCapsuleExpanded, searchValue]);

  return {
    closeSearch,
    isCapsuleExpanded,
    routeSearchQuery,
    searchValue,
    setSearchDraft: (value: string) => {
      setSearchDraft({
        path: location.pathname,
        sourceQuery: routeSearchQuery,
        value,
      });
    },
    openSearch,
  };
}
