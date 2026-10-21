import {
  LIBRARY_ITEM_FILTERABLE_KIND_VALUES,
  LIBRARY_ITEM_FILTERABLE_STATUS_VALUES,
  libraryItemSortSchema,
  type LibraryItemFilterableKind,
  type LibraryItemFilterableStatus,
  type LibraryItemSort,
} from '@towelbooks/schemas';

import {
  useUrlListState,
  type UrlListFilterValues,
  type UseUrlListStateOptions,
} from '../../hooks/useUrlListState';
import type { LibraryItemFilters } from '../../features/libraries/libraryItemFilters';
import { DEFAULT_LIBRARY_ITEM_SORT } from './ui/libraryPageShared';

type LibraryListUrlFilters = {
  statuses: LibraryItemFilterableStatus;
  types: LibraryItemFilterableKind;
};

const LIBRARY_LIST_SORT_VALUES = [
  ...libraryItemSortSchema.options,
] as readonly LibraryItemSort[];

const libraryListUrlStateOptions = {
  allowedSorts: LIBRARY_LIST_SORT_VALUES,
  defaultSort: DEFAULT_LIBRARY_ITEM_SORT,
  debounceMs: 400,
  filterGroups: {
    statuses: {
      allowedValues: LIBRARY_ITEM_FILTERABLE_STATUS_VALUES,
      paramName: 'status',
    },
    types: {
      allowedValues: LIBRARY_ITEM_FILTERABLE_KIND_VALUES,
      paramName: 'kind',
    },
  },
} satisfies UseUrlListStateOptions<LibraryItemSort, LibraryListUrlFilters>;

function toLibraryItemFilters(
  filters: UrlListFilterValues<LibraryListUrlFilters>,
): LibraryItemFilters {
  return {
    statuses: filters.statuses,
    types: filters.types,
  };
}

export function useLibraryListUrlState() {
  const urlListState = useUrlListState(libraryListUrlStateOptions);

  return {
    correctPage: urlListState.correctPage,
    currentPage: urlListState.state.page,
    filters: toLibraryItemFilters(urlListState.state.filters),
    localSearchText: urlListState.searchDraft,
    onFiltersChange: (filters: LibraryItemFilters) => {
      urlListState.updateState({ filters }, { resetPage: true });
    },
    onLocalSearchChange: urlListState.setSearchDraft,
    onPageChange: urlListState.setPage,
    replaceFilters: (filters: LibraryItemFilters) => {
      urlListState.updateState({ filters }, { replace: true });
    },
    onSortChange: (sortBy: LibraryItemSort) => {
      urlListState.updateState({ sort: sortBy }, { resetPage: true });
    },
    sortBy: urlListState.state.sort,
    submittedLocalSearchText: urlListState.state.q,
  };
}
