import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import {
  PROFILE_CATALOG_REVIEWS_PAGE_LIMIT,
  useProfileCatalogReviews,
} from '../../../../features/profile/useProfileCatalogReviews';
import { sdk } from '../../../../lib/sdk';

export type CatalogReviewsFilter = 'published' | 'drafts';

export function useCatalogReviewsPanelState({
  isOwnProfile,
  username,
}: {
  isOwnProfile: boolean;
  username: string;
}) {
  const [filter, setFilter] = useState<CatalogReviewsFilter>('published');

  const publishedQuery = useProfileCatalogReviews({
    enabled: !isOwnProfile || filter === 'published',
    limit: PROFILE_CATALOG_REVIEWS_PAGE_LIMIT,
    username,
  });

  const draftsQuery = useQuery({
    enabled: isOwnProfile && filter === 'drafts',
    queryKey: ['me', 'catalog-reviews', 'drafts'],
    queryFn: () => sdk.catalogReviews.listMyDrafts(),
  });

  return {
    draftsQuery,
    filter,
    isDraftsLoadError: filter === 'drafts' && draftsQuery.error != null,
    isLoading:
      filter === 'drafts' ? draftsQuery.isLoading : publishedQuery.isLoading,
    isPublishedLoadError:
      filter === 'published' && publishedQuery.error != null,
    items:
      filter === 'drafts'
        ? (draftsQuery.data?.items ?? [])
        : publishedQuery.items,
    publishedQuery,
    setFilter,
  };
}
