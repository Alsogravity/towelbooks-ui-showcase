import type { LibraryItemSort, LibraryItemsQuery } from '@towelbooks/schemas';

import type { LibraryItemFilters } from './libraryItemFilters';

export const LIBRARY_ITEMS_LIST_PAGE_SIZE = 20;

export function buildLibraryItemsListQuery(input: {
  filters: LibraryItemFilters;
  sort: LibraryItemSort;
  page: number;
  search: string;
}): LibraryItemsQuery {
  const trimmedSearch = input.search.trim();

  return {
    page: input.page,
    pageSize: LIBRARY_ITEMS_LIST_PAGE_SIZE,
    sort: input.sort,
    ...(input.filters.statuses.length > 0
      ? { statuses: input.filters.statuses }
      : {}),
    ...(input.filters.types.length > 0 ? { kinds: input.filters.types } : {}),
    ...(trimmedSearch.length > 0 ? { search: trimmedSearch } : {}),
  };
}
