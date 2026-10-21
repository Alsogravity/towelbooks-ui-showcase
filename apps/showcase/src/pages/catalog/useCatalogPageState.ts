import { useQuery } from '@tanstack/react-query';
import { type CatalogSearchCandidate } from '@towelbooks/schemas';
import { type ChangeEvent } from 'react';
import { useSearchParams } from 'react-router';

import { useUrlSearch } from '../../hooks/useUrlSearch';
import { useI18n } from '../../i18n';
import { sdk } from '../../lib/sdk';

export const CATALOG_PAGE_SIZE = 20;
const CATALOG_SEARCH_DEBOUNCE_MS = 500;
const CATALOG_RESET_PARAMS = ['page'] as const;

export type CatalogWorkSearchResult = CatalogSearchCandidate & {
  catalogWorkId: string;
};

function parsePageParam(value: string | null): number {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return 1;
  }

  return parsedValue;
}

function toCatalogWorkSearchResult(
  candidate: CatalogSearchCandidate,
): CatalogWorkSearchResult {
  return {
    ...candidate,
    catalogWorkId: candidate.catalogWorkId,
  };
}

export function useCatalogPageState() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { locale } = useI18n();
  const currentPage = parsePageParam(searchParams.get('page'));
  const { clear, draft, setDraft, submittedQuery } = useUrlSearch({
    debounceMs: CATALOG_SEARCH_DEBOUNCE_MS,
    resetParams: CATALOG_RESET_PARAMS,
  });

  const { data, error, isLoading, refetch } = useQuery({
    queryFn: () =>
      sdk.catalog.search({
        page: currentPage,
        pageSize: CATALOG_PAGE_SIZE,
        ...(submittedQuery.length > 0 ? { query: submittedQuery } : {}),
      }),
    queryKey: ['catalog', 'works', submittedQuery, currentPage, locale],
    select: (response) => ({
      ...response,
      items: response.items.map(toCatalogWorkSearchResult),
    }),
  });

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

  function handleQueryChange(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = event.currentTarget.value;

    if (nextValue.length === 0 && submittedQuery.length > 0) {
      clear();
      return;
    }

    setDraft(nextValue);
  }

  return {
    currentPage,
    draft,
    error,
    handleQueryChange,
    isLoading,
    refetch,
    results: data?.items ?? [],
    submittedQuery,
    totalCatalogWorks: data?.total ?? 0,
    updatePage,
  };
}
