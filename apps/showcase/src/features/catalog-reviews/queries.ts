import type { QueryClient } from '@tanstack/react-query';

import { catalogWorkDetailQueryKey } from '../catalog/queryKeys';
import type { AppLocale } from '../../i18n';

export function catalogWorkReviewsQueryKey(catalogWorkId: string) {
  return ['catalog', 'works', catalogWorkId, 'catalog-reviews'] as const;
}

export function catalogReviewDiscoveryQueryKey() {
  return ['catalog-reviews', 'discovery'] as const;
}

export function viewerCatalogReviewQueryKey(catalogWorkId: string) {
  return ['catalog', 'works', catalogWorkId, 'viewer-review'] as const;
}

export function libraryItemOwnerCatalogReviewQueryKey(
  libraryId: string,
  libraryItemId: string,
  ownerUserId: string,
  catalogWorkId: string,
) {
  return [
    'libraries',
    libraryId,
    'items',
    libraryItemId,
    'owner-review',
    ownerUserId,
    catalogWorkId,
  ] as const;
}

export function myCatalogReviewDraftsQueryKey() {
  return ['me', 'catalog-reviews', 'drafts'] as const;
}

export async function invalidateCatalogReviewSurface(
  queryClient: Pick<QueryClient, 'invalidateQueries'>,
  catalogWorkId: string,
  locale: AppLocale,
) {
  await Promise.all([
    queryClient.invalidateQueries({
      exact: true,
      queryKey: catalogWorkDetailQueryKey(catalogWorkId, locale),
    }),
    queryClient.invalidateQueries({
      exact: true,
      queryKey: myCatalogReviewDraftsQueryKey(),
    }),
    queryClient.invalidateQueries({
      queryKey: catalogReviewDiscoveryQueryKey(),
    }),
    queryClient.invalidateQueries({
      queryKey: ['profiles'],
    }),
  ]);
}
