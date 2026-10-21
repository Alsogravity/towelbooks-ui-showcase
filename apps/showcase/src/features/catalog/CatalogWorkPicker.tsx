import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type {
  CatalogSearchCandidate,
  ContributionLocalProjection,
  ContributionResponse,
  CoverGeometry,
} from '@towelbooks/schemas';
import { type FormEvent, type ReactNode, useEffect, useState } from 'react';

import { Alert, Button, Input } from '../../components/primitives';
import { CatalogWorkCandidateRow } from '../../entities/reading/ui';
import { useI18n } from '../../i18n';
import { sdk } from '../../lib/sdk';

export type CatalogWorkPickerResult = {
  catalogEditionId: string | null;
  catalogWorkId: string;
  contributors: string[];
  coverGeometry?: CoverGeometry | null;
  coverThumbnailUrl: string | null;
  coverUrl: string | null;
  title: string;
};

export type CatalogWorkPickerProps = {
  addCatalogWorkAction?: ReactNode;
  initialQuery?: string;
  initialResults?: CatalogSearchCandidate[];
  initialResultsLabel?: string;
  initialResultsLoading?: boolean;
  initialResultsLoadingLabel?: string;
  inputId?: string;
  kind?: 'book' | 'manga' | 'comic';
  noResultsContent?: ReactNode;
  onAddCatalogWork?: (query: string) => void;
  onSelect?: (result: CatalogWorkPickerResult) => void;
  queryLabel?: string;
  queryPlaceholder?: string;
  renderActions?: (result: CatalogWorkPickerResult) => ReactNode;
  searchAction?: string;
  searchingAction?: string;
};

export function catalogWorkPickerResultFromCandidate(
  candidate: CatalogSearchCandidate,
): CatalogWorkPickerResult {
  return {
    catalogEditionId: candidate.display.catalogEditionId,
    catalogWorkId: candidate.catalogWorkId,
    contributors: candidate.contributors,
    coverGeometry: candidate.coverGeometry,
    coverThumbnailUrl: candidate.coverThumbnailUrl,
    coverUrl: candidate.coverUrl,
    title: candidate.display.title,
  };
}

export function catalogWorkPickerResultFromLocalProjection(
  local: ContributionLocalProjection,
): CatalogWorkPickerResult {
  return {
    catalogEditionId:
      local.edition?.id ?? local.work.display.catalogEditionId ?? null,
    catalogWorkId: local.work.id,
    contributors: local.work.contributors,
    coverGeometry: local.work.display.coverGeometry,
    coverThumbnailUrl: local.work.display.coverThumbnailUrl,
    coverUrl: local.work.display.coverUrl,
    title: local.work.display.title,
  };
}

export function catalogContributionIdentifierFromResponse(
  response: ContributionResponse,
): string | null {
  const edition = response.local.edition;

  return edition?.asin ?? edition?.isbn13 ?? edition?.isbn10 ?? null;
}

function renderPickerResult(
  result: CatalogWorkPickerResult,
  actions: ReactNode,
  unknownContributor: string,
) {
  const author = result.contributors.join(', ') || unknownContributor;

  return (
    <CatalogWorkCandidateRow
      key={result.catalogWorkId}
      author={author}
      coverAuthor={result.contributors[0] ?? ''}
      coverDelivery={{ loading: 'lazy', preferredVariant: 'detail' }}
      coverGeometry={result.coverGeometry}
      coverThumbnailUrl={result.coverThumbnailUrl}
      coverUrl={result.coverUrl}
      themeSeed={result.catalogWorkId}
      title={result.title}
      actions={actions}
    />
  );
}

export function CatalogWorkPicker({
  addCatalogWorkAction,
  initialQuery = '',
  initialResults,
  initialResultsLabel,
  initialResultsLoading = false,
  initialResultsLoadingLabel,
  inputId = 'catalog-work-picker-query',
  kind,
  noResultsContent,
  onAddCatalogWork,
  onSelect,
  queryLabel,
  queryPlaceholder,
  renderActions,
  searchAction,
  searchingAction,
}: CatalogWorkPickerProps) {
  const { t, locale } = useI18n();
  const [draftQuery, setDraftQuery] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery.trim());
  const normalizedQuery = submittedQuery.trim();

  useEffect(() => {
    // The origin handoff may update this prop while the picker remains mounted.
    // Synchronizing the two local controls keeps the canonical identifier
    // searchable without making the picker a controlled form.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraftQuery(initialQuery);
    setSubmittedQuery(initialQuery.trim());
  }, [initialQuery]);

  const searchQuery = useQuery({
    enabled: normalizedQuery.length > 0,
    placeholderData: keepPreviousData,
    queryKey: [
      'catalog',
      'search',
      normalizedQuery,
      ...(kind ? [kind] : []),
      locale,
    ],
    queryFn: () =>
      sdk.catalog.search({
        ...(kind ? { kind } : {}),
        pageSize: 8,
        query: normalizedQuery,
      }),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedQuery(draftQuery.trim());
  };

  const renderResultActions = (result: CatalogWorkPickerResult) =>
    renderActions?.(result) ??
    (onSelect ? (
      <Button
        onClick={() => onSelect(result)}
        type="button"
        variant="secondary"
      >
        {t('catalog.picker.select')}
      </Button>
    ) : null);

  return (
    <div className="space-y-4">
      <form
        className="flex flex-col items-stretch gap-3"
        onSubmit={handleSubmit}
      >
        <Input
          id={inputId}
          autoComplete="off"
          aria-busy={searchQuery.isFetching}
          aria-label={queryLabel ?? t('catalog.picker.queryLabel')}
          enterKeyHint="search"
          onChange={(event) => {
            setDraftQuery(event.currentTarget.value);
          }}
          placeholder={queryPlaceholder ?? t('catalog.picker.queryPlaceholder')}
          prependIcon="search"
          type="search"
          value={draftQuery}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          {onAddCatalogWork ? (
            <Button
              className="group text-left"
              onClick={() => onAddCatalogWork(draftQuery.trim())}
              size="sm"
              type="button"
              variant="text"
            >
              <span className="group-hover:underline">
                {addCatalogWorkAction ?? t('catalog.picker.addBook')}
              </span>
            </Button>
          ) : (
            <span />
          )}
          <Button
            className="self-end"
            isLoading={searchQuery.isFetching && normalizedQuery.length > 0}
            loadingLabel={searchingAction ?? t('catalog.picker.searching')}
            type="submit"
          >
            {searchAction ?? t('catalog.picker.search')}
          </Button>
        </div>
      </form>

      {normalizedQuery.length === 0 ? (
        initialResultsLoading ? (
          <div
            aria-live="polite"
            className="app-text-supporting-copy text-ink-3"
          >
            {initialResultsLoadingLabel ?? t('catalog.picker.searching')}
          </div>
        ) : initialResults && initialResults.length > 0 ? (
          <section aria-label={initialResultsLabel} className="space-y-3">
            {initialResultsLabel ? (
              <h2 className="app-text-label m-0">{initialResultsLabel}</h2>
            ) : null}
            <div className="space-y-3">
              {initialResults.map((candidate) => {
                const result = catalogWorkPickerResultFromCandidate(candidate);

                return renderPickerResult(
                  result,
                  renderResultActions(result),
                  t('myLibrary.common.noContributor'),
                );
              })}
            </div>
          </section>
        ) : null
      ) : searchQuery.isLoading ? (
        <div aria-live="polite" className="app-text-supporting-copy text-ink-3">
          {searchingAction ?? t('catalog.picker.searching')}
        </div>
      ) : searchQuery.error ? (
        <Alert variant="error">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{t('catalog.picker.error')}</span>
            <Button
              onClick={() => void searchQuery.refetch()}
              type="button"
              variant="secondary"
            >
              {t('catalog.picker.retry')}
            </Button>
          </div>
        </Alert>
      ) : searchQuery.data && searchQuery.data.items.length === 0 ? (
        (noResultsContent ?? (
          <Alert variant="info">{t('catalog.picker.noResults')}</Alert>
        ))
      ) : searchQuery.data ? (
        <div className="space-y-3">
          {searchQuery.data.items.map((candidate) => {
            const result = catalogWorkPickerResultFromCandidate(candidate);

            return renderPickerResult(
              result,
              renderResultActions(result),
              t('myLibrary.common.noContributor'),
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
