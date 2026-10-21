import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { Library, LibraryDetail } from '@towelbooks/schemas';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { buildLibraryItemsListQuery } from '../../features/libraries/buildLibraryItemsListQuery';
import {
  getVisibleLibraryItemTypeFilters,
  hasActiveLibraryItemFilters,
  sanitizeLibraryItemTypeFilters,
} from '../../features/libraries/libraryItemFilters';
import { libraryLiveQueryOptions } from '../../features/libraries/liveQueryOptions';
import {
  libraryItemsFacetsQueryKey,
  libraryItemsListQueryKey,
  libraryQueryKey,
} from '../../features/libraries/queryInvalidation';
import { sdk } from '../../lib/sdk';
import { useI18n } from '../../i18n';
import { useLibraryListUrlState } from './useLibraryListUrlState';

type AddItemReturnFocusTarget = 'empty-state' | 'trigger';

export function useLibraryDetailScreenState({
  initialLibrary,
  libraryId,
}: {
  initialLibrary: Library | LibraryDetail | null;
  libraryId: string;
}) {
  const { locale } = useI18n();
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isEditLibraryOpen, setIsEditLibraryOpen] = useState(false);
  const addItemReturnFocusTargetRef =
    useRef<AddItemReturnFocusTarget>('trigger');
  const addItemReturnFocusElementRef = useRef<HTMLButtonElement | null>(null);
  const pageHeaderAddItemButtonRef = useRef<HTMLButtonElement | null>(null);
  const pageHeaderEditButtonRef = useRef<HTMLButtonElement | null>(null);
  const emptyStateAddItemButtonRef = useRef<HTMLButtonElement | null>(null);
  const filterOverlayHostRef = useRef<HTMLDivElement>(null);
  const {
    correctPage,
    currentPage,
    filters,
    localSearchText,
    onFiltersChange,
    onLocalSearchChange,
    onPageChange,
    onSortChange,
    replaceFilters,
    sortBy,
    submittedLocalSearchText,
  } = useLibraryListUrlState();

  const libraryQuery = useQuery({
    enabled: initialLibrary === null && libraryId.length > 0,
    queryKey: libraryQueryKey(libraryId),
    queryFn: () => sdk.libraries.get(libraryId),
    ...libraryLiveQueryOptions,
  });

  const library = libraryQuery.data ?? initialLibrary;

  const listQuery = useMemo(
    () =>
      buildLibraryItemsListQuery({
        filters,
        sort: sortBy,
        page: currentPage,
        search: submittedLocalSearchText,
      }),
    [currentPage, filters, sortBy, submittedLocalSearchText],
  );

  const itemsQuery = useQuery({
    enabled: libraryId.length > 0,
    queryKey: libraryItemsListQueryKey(libraryId, listQuery, locale),
    queryFn: () => sdk.libraries.listItems(libraryId, listQuery),
    placeholderData: keepPreviousData,
    ...libraryLiveQueryOptions,
  });

  const facetsQuery = useQuery({
    enabled: libraryId.length > 0,
    queryKey: libraryItemsFacetsQueryKey(libraryId),
    queryFn: () => sdk.libraries.getItemFacets(libraryId),
    ...libraryLiveQueryOptions,
  });

  const visibleItems = itemsQuery.data?.items ?? [];
  const totalVisibleItems = itemsQuery.data?.total ?? 0;
  const listPageSize = itemsQuery.data?.pageSize ?? listQuery.pageSize ?? 20;
  const totalPages = Math.max(1, Math.ceil(totalVisibleItems / listPageSize));
  const libraryTotalCount =
    facetsQuery.data?.total ??
    (hasActiveLibraryItemFilters(filters) ? undefined : itemsQuery.data?.total);
  const isItemsSectionLoading =
    (itemsQuery.isLoading && itemsQuery.data === undefined) ||
    (libraryTotalCount === undefined && itemsQuery.data === undefined);

  const visibleTypeFilters = useMemo(
    () => getVisibleLibraryItemTypeFilters(facetsQuery.data?.kinds),
    [facetsQuery.data?.kinds],
  );

  useEffect(() => {
    if (!facetsQuery.data) {
      return;
    }

    const sanitizedFilters = sanitizeLibraryItemTypeFilters(
      filters,
      visibleTypeFilters,
    );

    if (sanitizedFilters === filters) {
      return;
    }

    replaceFilters(sanitizedFilters);
  }, [facetsQuery.data, filters, replaceFilters, visibleTypeFilters]);

  useEffect(() => {
    if (itemsQuery.data === undefined) {
      return;
    }

    correctPage(totalPages);
  }, [correctPage, itemsQuery.data, totalPages]);

  const openAddItemPanel = useCallback((trigger: HTMLButtonElement | null) => {
    addItemReturnFocusTargetRef.current =
      trigger === emptyStateAddItemButtonRef.current
        ? 'empty-state'
        : 'trigger';
    addItemReturnFocusElementRef.current = trigger;
    setIsAddItemOpen(true);
  }, []);

  const closeAddItemPanel = useCallback(() => {
    setIsAddItemOpen(false);
  }, []);

  const openEditLibrary = useCallback(() => {
    setIsEditLibraryOpen(true);
  }, []);

  const closeEditLibrary = useCallback(() => {
    setIsEditLibraryOpen(false);
  }, []);

  return {
    currentPage,
    emptyStateAddItemButtonRef,
    facets: facetsQuery.data ?? null,
    filterOverlayHostRef,
    filters,
    isAddItemOpen,
    isEditLibraryOpen,
    isItemsError: itemsQuery.isError,
    isItemsSectionLoading,
    isLibraryError: initialLibrary === null && libraryQuery.isError,
    isLibraryLoading: initialLibrary === null && libraryQuery.isLoading,
    itemsRetry: () => {
      void Promise.all([itemsQuery.refetch(), facetsQuery.refetch()]);
    },
    library,
    libraryQuery,
    libraryTotalCount,
    localSearchText,
    onFiltersChange,
    onLocalSearchChange,
    onOpenAddItem: openAddItemPanel,
    onOpenEditLibrary: openEditLibrary,
    onPageChange,
    onSortChange,
    pageHeaderAddItemButtonRef,
    pageHeaderEditButtonRef,
    sortBy,
    totalPages,
    totalVisibleItems,
    visibleItems,
    closeAddItemPanel,
    closeEditLibrary,
    getAddItemReturnFocusElement: () =>
      addItemReturnFocusTargetRef.current === 'empty-state'
        ? emptyStateAddItemButtonRef.current
        : (addItemReturnFocusElementRef.current ??
          pageHeaderAddItemButtonRef.current),
    getEditLibraryReturnFocusElement: () => pageHeaderEditButtonRef.current,
  };
}
