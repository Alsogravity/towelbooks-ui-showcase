import type {
  LibraryItemFacetKindCounts,
  LibraryItemFilterableKind,
  LibraryItem,
  LibraryItemFilterableStatus,
  CatalogWorkType,
} from '@towelbooks/schemas';

export type LibraryItemFilters = {
  statuses: LibraryItemFilterableStatus[];
  types: LibraryItemFilterableKind[];
};

export const EMPTY_LIBRARY_ITEM_FILTERS: LibraryItemFilters = {
  statuses: [],
  types: [],
};

export type StatusFilterChipId = LibraryItemFilterableStatus;

function toggleArrayValue<T>(values: readonly T[], value: T): T[] {
  if (values.includes(value)) {
    return values.filter((item) => item !== value);
  }

  return [...values, value];
}

export function matchesLibraryItemFilters(
  item: LibraryItem,
  filters: LibraryItemFilters,
): boolean {
  const statusMatch =
    filters.statuses.length === 0 ||
    filters.statuses.some(
      (status) => item.readingSummary.statusCounts[status] > 0,
    );
  const typeMatch =
    filters.types.length === 0 ||
    (filters.types as readonly CatalogWorkType[]).includes(item.work.kind);

  return statusMatch && typeMatch;
}

export function filterLibraryItems(
  items: LibraryItem[],
  filters: LibraryItemFilters,
): LibraryItem[] {
  return items.filter((item) => matchesLibraryItemFilters(item, filters));
}

export function countActiveLibraryItemFilters(
  filters: LibraryItemFilters,
): number {
  return filters.statuses.length + filters.types.length;
}

export function hasActiveLibraryItemFilters(
  filters: LibraryItemFilters,
): boolean {
  return countActiveLibraryItemFilters(filters) > 0;
}

export function toggleStatusFilter(
  filters: LibraryItemFilters,
  status: StatusFilterChipId,
): LibraryItemFilters {
  return {
    ...filters,
    statuses: toggleArrayValue(filters.statuses, status),
  };
}

export function toggleTypeFilter(
  filters: LibraryItemFilters,
  type: LibraryItemFilterableKind,
): LibraryItemFilters {
  return {
    ...filters,
    types: toggleArrayValue(filters.types, type),
  };
}

export function isStatusFilterChipSelected(
  filters: LibraryItemFilters,
  status: StatusFilterChipId,
): boolean {
  return filters.statuses.includes(status);
}

export function isTypeFilterChipSelected(
  filters: LibraryItemFilters,
  type: LibraryItemFilterableKind,
): boolean {
  return filters.types.includes(type);
}

export function getVisibleLibraryItemTypeFilters(
  kindCounts: LibraryItemFacetKindCounts | null | undefined,
): LibraryItemFilterableKind[] {
  const visibleKinds: LibraryItemFilterableKind[] = ['book'];

  if ((kindCounts?.manga ?? 0) > 0) {
    visibleKinds.push('manga');
  }

  if ((kindCounts?.comic ?? 0) > 0) {
    visibleKinds.push('comic');
  }

  return visibleKinds;
}

export function sanitizeLibraryItemTypeFilters(
  filters: LibraryItemFilters,
  visibleKinds: readonly LibraryItemFilterableKind[],
): LibraryItemFilters {
  const nextTypes = filters.types.filter((type) => visibleKinds.includes(type));

  if (nextTypes.length === filters.types.length) {
    return filters;
  }

  return {
    ...filters,
    types: nextTypes,
  };
}
