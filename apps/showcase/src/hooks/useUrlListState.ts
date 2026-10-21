import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';

export type UrlListFilterValues<TFilters extends Record<string, string>> = {
  [K in keyof TFilters]: TFilters[K][];
};

export type UrlListState<
  TSort extends string,
  TFilters extends Record<string, string>,
> = {
  page: number;
  q: string;
  sort: TSort;
  filters: UrlListFilterValues<TFilters>;
};

export type UrlListFilterGroupConfig<TValue extends string> = {
  allowedValues: readonly TValue[];
  paramName: string;
};

export type UrlListFilterGroupConfigMap<
  TFilters extends Record<string, string>,
> = {
  [K in keyof TFilters]: UrlListFilterGroupConfig<TFilters[K]>;
};

export type UseUrlListStateOptions<
  TSort extends string,
  TFilters extends Record<string, string>,
> = {
  allowedSorts: readonly TSort[];
  debounceMs?: number;
  defaultSort: TSort;
  filterGroups: UrlListFilterGroupConfigMap<TFilters>;
  pageParamName?: string;
  queryParamName?: string;
  sortParamName?: string;
};

export type UrlListStatePatch<
  TSort extends string,
  TFilters extends Record<string, string>,
> = Partial<Omit<UrlListState<TSort, TFilters>, 'filters'>> & {
  filters?: Partial<UrlListFilterValues<TFilters>>;
};

export type UseUrlListStateResult<
  TSort extends string,
  TFilters extends Record<string, string>,
> = {
  clearSearch: () => void;
  correctPage: (maxPage: number) => void;
  searchDraft: string;
  setPage: (page: number) => void;
  setSearchDraft: (value: string) => void;
  state: UrlListState<TSort, TFilters>;
  submitSearch: () => void;
  updateState: (
    patch: UrlListStatePatch<TSort, TFilters>,
    options?: { replace?: boolean; resetPage?: boolean },
  ) => void;
};

function hasAllowedValue<TValue extends string>(
  allowedValues: readonly TValue[],
  candidate: string,
): candidate is TValue {
  return allowedValues.includes(candidate as TValue);
}

function parsePageParam(value: string | null): number {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return 1;
  }

  return parsedValue;
}

function normalizeRepeatedValues<TValue extends string>(
  values: readonly string[],
  allowedValues: readonly TValue[],
): TValue[] {
  const selectedValues = new Set<TValue>();

  for (const value of values) {
    const trimmedValue = value.trim();

    if (hasAllowedValue(allowedValues, trimmedValue)) {
      selectedValues.add(trimmedValue);
    }
  }

  return allowedValues.filter((value) => selectedValues.has(value));
}

function normalizeSortValue<TSort extends string>(
  value: string | null | undefined,
  allowedSorts: readonly TSort[],
  defaultSort: TSort,
): TSort {
  if (value && hasAllowedValue(allowedSorts, value)) {
    return value;
  }

  return defaultSort;
}

function normalizeFilterValues<TFilters extends Record<string, string>>(
  filters: Partial<UrlListFilterValues<TFilters>> | undefined,
  filterGroups: UrlListFilterGroupConfigMap<TFilters>,
): UrlListFilterValues<TFilters> {
  const entries = Object.entries(filterGroups).map(
    ([groupKey, groupConfig]) => [
      groupKey,
      normalizeRepeatedValues(
        filters?.[groupKey as keyof TFilters] ?? [],
        groupConfig.allowedValues,
      ),
    ],
  );

  return Object.fromEntries(entries) as UrlListFilterValues<TFilters>;
}

export function normalizeUrlListState<
  TSort extends string,
  TFilters extends Record<string, string>,
>(
  state: Partial<UrlListState<TSort, TFilters>>,
  config: UseUrlListStateOptions<TSort, TFilters>,
): UrlListState<TSort, TFilters> {
  return {
    page:
      state.page !== undefined && Number.isInteger(state.page) && state.page > 0
        ? state.page
        : 1,
    q: state.q?.trim() ?? '',
    sort: normalizeSortValue(
      state.sort,
      config.allowedSorts,
      config.defaultSort,
    ),
    filters: normalizeFilterValues(state.filters, config.filterGroups),
  };
}

export function parseUrlListState<
  TSort extends string,
  TFilters extends Record<string, string>,
>(
  searchParams: URLSearchParams,
  config: UseUrlListStateOptions<TSort, TFilters>,
): UrlListState<TSort, TFilters> {
  const {
    defaultSort,
    filterGroups,
    pageParamName = 'page',
    queryParamName = 'q',
    sortParamName = 'sort',
  } = config;

  const filterEntries = Object.entries(filterGroups).map(
    ([groupKey, groupConfig]) => [
      groupKey,
      normalizeRepeatedValues(
        searchParams.getAll(groupConfig.paramName),
        groupConfig.allowedValues,
      ),
    ],
  );

  return normalizeUrlListState(
    {
      page: parsePageParam(searchParams.get(pageParamName)),
      q: searchParams.get(queryParamName) ?? '',
      sort: normalizeSortValue(
        searchParams.get(sortParamName),
        config.allowedSorts,
        defaultSort,
      ),
      filters: Object.fromEntries(
        filterEntries,
      ) as UrlListFilterValues<TFilters>,
    },
    config,
  );
}

export function serializeUrlListState<
  TSort extends string,
  TFilters extends Record<string, string>,
>(
  previousParams: URLSearchParams,
  state: Partial<UrlListState<TSort, TFilters>>,
  config: UseUrlListStateOptions<TSort, TFilters>,
): URLSearchParams {
  const {
    defaultSort,
    filterGroups,
    pageParamName = 'page',
    queryParamName = 'q',
    sortParamName = 'sort',
  } = config;
  const nextParams = new URLSearchParams(previousParams);
  const normalizedState = normalizeUrlListState(state, config);

  if (normalizedState.page <= 1) {
    nextParams.delete(pageParamName);
  } else {
    nextParams.set(pageParamName, String(normalizedState.page));
  }

  if (normalizedState.q.length === 0) {
    nextParams.delete(queryParamName);
  } else {
    nextParams.set(queryParamName, normalizedState.q);
  }

  if (normalizedState.sort === defaultSort) {
    nextParams.delete(sortParamName);
  } else {
    nextParams.set(sortParamName, normalizedState.sort);
  }

  for (const groupConfig of Object.values(filterGroups)) {
    nextParams.delete(groupConfig.paramName);
  }

  for (const [groupKey, groupConfig] of Object.entries(filterGroups)) {
    for (const value of normalizedState.filters[groupKey as keyof TFilters]) {
      nextParams.append(groupConfig.paramName, value);
    }
  }

  return nextParams;
}

export function useUrlListState<
  TSort extends string,
  TFilters extends Record<string, string>,
>(
  config: UseUrlListStateOptions<TSort, TFilters>,
): UseUrlListStateResult<TSort, TFilters> {
  const { debounceMs = 400 } = config;
  const [searchParams, setSearchParams] = useSearchParams();
  const state = useMemo(
    () => parseUrlListState(searchParams, config),
    [config, searchParams],
  );
  const [searchDraft, setSearchDraftState] = useState(state.q);
  const lastWrittenSearchRef = useRef(state.q);

  useEffect(() => {
    if (state.q !== lastWrittenSearchRef.current) {
      lastWrittenSearchRef.current = state.q;
      setSearchDraftState(state.q);
    }
  }, [state.q]);

  const updateState = useCallback(
    (
      patch: UrlListStatePatch<TSort, TFilters>,
      options: { replace?: boolean; resetPage?: boolean } = {},
    ) => {
      const nextSearch = patch.q !== undefined ? patch.q.trim() : undefined;

      if (nextSearch !== undefined) {
        lastWrittenSearchRef.current = nextSearch;
      }

      setSearchParams(
        (previousParams) => {
          const currentState = parseUrlListState(previousParams, config);
          const nextState: UrlListState<TSort, TFilters> = {
            ...currentState,
            ...(patch.page !== undefined ? { page: patch.page } : {}),
            ...(nextSearch !== undefined ? { q: nextSearch } : {}),
            ...(patch.sort !== undefined ? { sort: patch.sort } : {}),
            filters: patch.filters
              ? normalizeFilterValues(
                  {
                    ...currentState.filters,
                    ...patch.filters,
                  },
                  config.filterGroups,
                )
              : currentState.filters,
          };

          if (options.resetPage) {
            nextState.page = 1;
          }

          return serializeUrlListState(previousParams, nextState, config);
        },
        options.replace ? { replace: true } : undefined,
      );
    },
    [config, setSearchParams],
  );

  useEffect(() => {
    const normalizedDraft = searchDraft.trim();

    if (normalizedDraft === state.q) {
      return;
    }

    if (normalizedDraft.length === 0) {
      updateState({ q: '' }, { resetPage: true });
      return;
    }

    const timeoutId = window.setTimeout(() => {
      updateState({ q: normalizedDraft }, { resetPage: true });
    }, debounceMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [debounceMs, searchDraft, state.q, updateState]);

  const setSearchDraft = useCallback((value: string) => {
    setSearchDraftState(value);
  }, []);

  const submitSearch = useCallback(() => {
    updateState({ q: searchDraft }, { resetPage: true });
  }, [searchDraft, updateState]);

  const clearSearch = useCallback(() => {
    setSearchDraftState('');
    updateState({ q: '' }, { resetPage: true });
  }, [updateState]);

  const setPage = useCallback(
    (page: number) => {
      updateState({ page });
    },
    [updateState],
  );

  const correctPage = useCallback(
    (maxPage: number) => {
      const normalizedMaxPage =
        Number.isInteger(maxPage) && maxPage > 0 ? maxPage : 1;

      if (state.page <= normalizedMaxPage) {
        return;
      }

      updateState({ page: normalizedMaxPage }, { replace: true });
    },
    [state.page, updateState],
  );

  return {
    clearSearch,
    correctPage,
    searchDraft,
    setPage,
    setSearchDraft,
    state,
    submitSearch,
    updateState,
  };
}
