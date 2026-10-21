import { useQuery } from '@tanstack/react-query';

import { viewerCatalogReviewQueryKey } from './queries';
import { sdk } from '../../lib/sdk';

export function useViewerCatalogReview(catalogWorkId: string, enabled = true) {
  return useQuery({
    enabled,
    queryKey: viewerCatalogReviewQueryKey(catalogWorkId),
    queryFn: () => sdk.catalogReviews.getMineForWork(catalogWorkId),
  });
}
