import type { QueryClient } from '@tanstack/react-query';

import { catalogWorkDetailQueryKey } from '../catalog/queryKeys';
import type { AppLocale } from '../../i18n';

export const RATINGS_PAGE_SIZE = 10;

export function catalogWorkRatingsQueryKey(catalogWorkId: string) {
  return ['catalog', 'works', catalogWorkId, 'ratings'] as const;
}

export function viewerRatingQueryKey(catalogWorkId: string) {
  return ['catalog', 'works', catalogWorkId, 'viewer-rating'] as const;
}

export function libraryItemOwnerRatingQueryKey(
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
    'owner-rating',
    ownerUserId,
    catalogWorkId,
  ] as const;
}

export async function invalidateCatalogRatingSurface(
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
      queryKey: ['catalog', 'works'],
      predicate: (query) => query.queryKey[3] !== 'viewer-rating',
    }),
  ]);
}
