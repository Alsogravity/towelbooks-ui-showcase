import { useEffect, useRef } from 'react';

import {
  PageContainer,
  PageHeader,
  PageSection,
  PageShell,
} from '../../components/layout';
import { ButtonLink, Input } from '../../components/primitives';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useI18n } from '../../i18n';
import { trackSearch } from '../../features/analytics';
import { CatalogPageResults } from './CatalogPageResults';
import { CATALOG_PAGE_SIZE, useCatalogPageState } from './useCatalogPageState';

export function CatalogPage() {
  const { formatNumber, t } = useI18n();
  const {
    currentPage,
    draft,
    error,
    handleQueryChange,
    isLoading,
    refetch,
    results,
    submittedQuery,
    totalCatalogWorks,
    updatePage,
  } = useCatalogPageState();
  usePageTitle({ key: 'page.catalog.title', fallback: 'Catalog' });

  const addCatalogWorkButton = (
    <ButtonLink to="/catalog/new" prependIcon="plus">
      {t('catalog.works.registerWork')}
    </ButtonLink>
  );

  const lastTrackedQueryRef = useRef('');

  useEffect(() => {
    if (
      submittedQuery.length > 0 &&
      submittedQuery !== lastTrackedQueryRef.current &&
      totalCatalogWorks > 0
    ) {
      trackSearch(submittedQuery.length, totalCatalogWorks);
      lastTrackedQueryRef.current = submittedQuery;
    }
  }, [submittedQuery, totalCatalogWorks]);

  return (
    <PageShell background="paper" minHeight className="flex flex-col">
      <PageContainer
        size="wide"
        className="flex w-full min-w-0 flex-1 flex-col gap-4 max-lg:pt-0"
      >
        <PageHeader
          actions={addCatalogWorkButton}
          title={t('catalog.works.title')}
        />

        <div className="hidden w-full min-w-0 lg:block">
          <div
            className="flex flex-col gap-4 sm:flex-row sm:items-end"
            role="search"
          >
            <div className="min-w-0 flex-1">
              <Input
                aria-label={t('catalog.works.searchLabel')}
                clearButtonLabel={t('catalog.works.clearAction')}
                clearable
                className="h-10 w-full border-rule/60 bg-vellum/50 text-sm focus:bg-vellum"
                enterKeyHint="search"
                id="catalog-search-query"
                onChange={handleQueryChange}
                placeholder={t('catalog.works.searchPlaceholder')}
                prependIcon="search"
                type="search"
                value={draft}
              />
            </div>
          </div>
        </div>

        {totalCatalogWorks > 0 ? (
          // TODO: Revisit whether this result count should return to the visible list UI.
          <p className="hidden">
            {t('catalog.works.resultsCount', {
              values: {
                start: formatNumber((currentPage - 1) * CATALOG_PAGE_SIZE + 1),
                end: formatNumber(
                  Math.min(currentPage * CATALOG_PAGE_SIZE, totalCatalogWorks),
                ),
                total: formatNumber(totalCatalogWorks),
              },
            })}
          </p>
        ) : null}

        <PageSection className="flex w-full min-w-0 flex-1 flex-col">
          <CatalogPageResults
            currentPage={currentPage}
            error={error}
            isLoading={isLoading}
            onPageChange={updatePage}
            onRetry={() => void refetch()}
            results={results}
            submittedQuery={submittedQuery}
            totalCatalogWorks={totalCatalogWorks}
          />
        </PageSection>
      </PageContainer>
    </PageShell>
  );
}
