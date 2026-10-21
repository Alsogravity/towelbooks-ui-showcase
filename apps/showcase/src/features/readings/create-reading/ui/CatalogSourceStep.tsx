import { useQuery } from '@tanstack/react-query';

import { Alert, Button } from '../../../../components/primitives';
import {
  CatalogWorkPicker,
  type CatalogWorkPickerResult,
} from '../../../../features/catalog/CatalogWorkPicker';
import { homeCatalogQueryKey } from '../../../../features/catalog/queryKeys';
import { useI18n } from '../../../../i18n';
import { sdk } from '../../../../lib/sdk';

import {
  INITIAL_CATALOG_RECOMMENDATION_COUNT,
  selectInitialCatalogRecommendations,
} from './initialCatalogRecommendations';

import type {
  SelectedCatalogWork,
  Translate,
} from '../createReadingFormShared';

interface CatalogSourceStepProps {
  initialQuery?: string;
  onAddCatalogWork?: (query: string) => void;
  onSelect: (item: SelectedCatalogWork) => void;
  t: Translate;
}

export function CatalogSourceStep({
  initialQuery,
  onAddCatalogWork,
  onSelect,
  t,
}: CatalogSourceStepProps) {
  const { locale } = useI18n();
  const homeQuery = useQuery({
    queryFn: () => sdk.users.me.getHome(),
    queryKey: homeCatalogQueryKey(locale),
    retry: false,
    staleTime: 120_000,
  });
  const homeRecommendations = selectInitialCatalogRecommendations(
    homeQuery.data,
  );
  const catalogBrowseQuery = useQuery({
    enabled:
      !homeQuery.isLoading &&
      homeRecommendations.length < INITIAL_CATALOG_RECOMMENDATION_COUNT,
    queryFn: () => sdk.catalog.search({ pageSize: 100 }),
    queryKey: ['catalog', 'reading-source-fallback', locale],
    retry: false,
    staleTime: 120_000,
  });
  const initialResults = selectInitialCatalogRecommendations(
    homeQuery.data,
    catalogBrowseQuery.data?.items,
  );

  return (
    <CatalogWorkPicker
      initialQuery={initialQuery}
      initialResults={initialResults}
      initialResultsLoading={
        homeQuery.isLoading || catalogBrowseQuery.isLoading
      }
      initialResultsLoadingLabel={t(
        'rooms.readingFlow.catalog.recommendations.loading',
      )}
      noResultsContent={
        <Alert variant="info">{t('rooms.readingFlow.catalog.noResults')}</Alert>
      }
      onAddCatalogWork={onAddCatalogWork}
      onSelect={(result: CatalogWorkPickerResult) => {
        onSelect({
          author:
            result.contributors.length > 0
              ? result.contributors.join(', ')
              : null,
          catalogEditionId: result.catalogEditionId,
          catalogWorkId: result.catalogWorkId,
          coverGeometry: result.coverGeometry,
          coverThumbnailUrl: result.coverThumbnailUrl,
          coverUrl: result.coverUrl,
          title: result.title,
        });
      }}
      queryLabel={t('rooms.readingFlow.catalog.queryLabel')}
      queryPlaceholder={t('rooms.readingFlow.catalog.queryPlaceholder')}
      renderActions={(result) => (
        <Button
          onClick={() => {
            onSelect({
              author:
                result.contributors.length > 0
                  ? result.contributors.join(', ')
                  : null,
              catalogEditionId: result.catalogEditionId,
              catalogWorkId: result.catalogWorkId,
              coverGeometry: result.coverGeometry,
              coverThumbnailUrl: result.coverThumbnailUrl,
              coverUrl: result.coverUrl,
              title: result.title,
            });
          }}
          type="button"
          variant="secondary"
        >
          {t('rooms.readingFlow.catalog.use')}
        </Button>
      )}
      searchAction={t('rooms.readingFlow.catalog.submit')}
      searchingAction={t('rooms.readingFlow.catalog.searching')}
    />
  );
}
