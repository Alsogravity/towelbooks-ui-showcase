import { useQuery } from '@tanstack/react-query';
import { type RoomDiscoveryItem, type RoomListItem } from '@towelbooks/schemas';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';

import { useUrlSearch } from '../../../hooks/useUrlSearch';
import { useMobileHeaderSearchMode } from '../../../layouts/app/MobileHeaderSearchModeContext';
import { useI18n } from '../../../i18n';
import { sdk } from '../../../lib/sdk';

export const ROOMS_PAGE_SIZE = 12;
const ROOMS_SEARCH_DEBOUNCE_MS = 500;
const ROOMS_RESET_PARAMS = ['page'] as const;
const PANEL_DISCOVER_PAGE_SIZE = 8;
const PANEL_RECOMMENDATIONS_STALE_TIME_MS = 60_000;

export type RoomDiscoverPanelMode = 'recommendations' | 'search';

type RoomListPageItem = RoomListItem | RoomDiscoveryItem;

export function useRoomListPageState() {
  const { locale } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parsePageParam(searchParams.get('page'));
  const isMobileSearchOpen = useMobileHeaderSearchMode();
  const { submittedQuery } = useUrlSearch({
    debounceMs: ROOMS_SEARCH_DEBOUNCE_MS,
    resetParams: ROOMS_RESET_PARAMS,
  });
  const isDiscovering = submittedQuery.length > 0;
  const isSearchIdle = isMobileSearchOpen && !isDiscovering;

  const [isDiscoverPanelOpen, setIsDiscoverPanelOpen] = useState(false);
  const [panelSearchDraft, setPanelSearchDraft] = useState('');
  const [panelSubmittedSearch, setPanelSubmittedSearch] = useState('');
  const discoverPanelButtonRef = useRef<HTMLButtonElement | null>(null);
  const panelMode: RoomDiscoverPanelMode =
    panelSubmittedSearch.length > 0 ? 'search' : 'recommendations';

  useEffect(() => {
    const trimmedDraft = panelSearchDraft.trim();

    if (trimmedDraft === panelSubmittedSearch) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPanelSubmittedSearch(trimmedDraft);
    }, ROOMS_SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [panelSearchDraft, panelSubmittedSearch]);

  const ownRoomsQuery = useQuery({
    enabled: !isDiscovering && !isSearchIdle,
    queryKey: ['rooms', 'list', currentPage, ROOMS_PAGE_SIZE, locale],
    queryFn: () =>
      sdk.rooms.list({ page: currentPage, pageSize: ROOMS_PAGE_SIZE }),
  });

  const discoverQuery = useQuery({
    enabled: isDiscovering,
    queryKey: [
      'rooms',
      'discover',
      submittedQuery,
      currentPage,
      ROOMS_PAGE_SIZE,
      locale,
    ],
    queryFn: () =>
      sdk.rooms.discover({
        page: currentPage,
        pageSize: ROOMS_PAGE_SIZE,
        q: submittedQuery,
      }),
  });

  const panelRecommendationsQuery = useQuery({
    enabled: isDiscoverPanelOpen && panelMode === 'recommendations',
    queryKey: ['rooms', 'discover', 'recommendations', locale],
    queryFn: () =>
      sdk.rooms.discover({
        page: 1,
        pageSize: PANEL_DISCOVER_PAGE_SIZE,
      }),
    retry: false,
    staleTime: PANEL_RECOMMENDATIONS_STALE_TIME_MS,
  });

  const panelSearchQuery = useQuery({
    enabled: isDiscoverPanelOpen && panelMode === 'search',
    queryKey: [
      'rooms',
      'discover',
      'panel',
      panelSubmittedSearch,
      PANEL_DISCOVER_PAGE_SIZE,
      locale,
    ],
    queryFn: () =>
      sdk.rooms.discover({
        page: 1,
        pageSize: PANEL_DISCOVER_PAGE_SIZE,
        q: panelSubmittedSearch,
      }),
  });

  const activeQuery = isDiscovering ? discoverQuery : ownRoomsQuery;

  function updatePage(nextPage: number) {
    setSearchParams((previousParams) => {
      const nextParams = new URLSearchParams(previousParams);

      if (nextPage <= 1) {
        nextParams.delete('page');
      } else {
        nextParams.set('page', String(nextPage));
      }

      return nextParams;
    });
  }

  function openDiscoverPanel() {
    setIsDiscoverPanelOpen(true);
  }

  function closeDiscoverPanel() {
    setIsDiscoverPanelOpen(false);
    setPanelSearchDraft('');
    setPanelSubmittedSearch('');
  }

  return {
    activeQuery,
    closeDiscoverPanel,
    currentPage,
    discoverPanelButtonRef,
    getDiscoverPanelReturnFocusElement: () => discoverPanelButtonRef.current,
    isDiscovering,
    isDiscoverPanelOpen,
    isSearchIdle,
    openDiscoverPanel,
    panelSearchDraft,
    panelMode,
    panelRecommendationResults:
      panelMode === 'recommendations'
        ? (panelRecommendationsQuery.data?.items ?? null)
        : null,
    isPanelRecommendationsError:
      panelMode === 'recommendations' && panelRecommendationsQuery.isError,
    isPanelRecommendationsLoading:
      panelMode === 'recommendations' && panelRecommendationsQuery.isLoading,
    retryPanelRecommendations: () => void panelRecommendationsQuery.refetch(),
    panelSearchResults:
      panelMode === 'search' ? (panelSearchQuery.data?.items ?? null) : null,
    isPanelSearchError: panelMode === 'search' && panelSearchQuery.isError,
    isPanelSearching: panelMode === 'search' && panelSearchQuery.isFetching,
    retryPanelSearch: () => void panelSearchQuery.refetch(),
    rooms: (activeQuery.data?.items ?? []) as RoomListPageItem[],
    setPanelSearchDraft,
    total: activeQuery.data?.total ?? 0,
    totalPages: Math.max(
      1,
      Math.ceil((activeQuery.data?.total ?? 0) / ROOMS_PAGE_SIZE),
    ),
    updatePage,
  };
}

function parsePageParam(value: string | null): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}
