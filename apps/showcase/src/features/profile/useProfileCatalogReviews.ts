import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import { CATALOG_REVIEW_DISCOVERY_DEFAULT_LIMIT } from '@towelbooks/schemas';
import type { ProfileCatalogReviewsResponse } from '@towelbooks/schemas';
import { useMemo } from 'react';

import { sdk } from '../../lib/sdk';

export const PROFILE_CATALOG_REVIEWS_PREVIEW_LIMIT = 3;
export const PROFILE_CATALOG_REVIEWS_PAGE_LIMIT =
  CATALOG_REVIEW_DISCOVERY_DEFAULT_LIMIT;

export function profileCatalogReviewsQueryKey(username: string, limit: number) {
  return ['profiles', username, 'catalog-reviews', { limit }] as const;
}

export function useProfileCatalogReviews({
  enabled = true,
  limit = PROFILE_CATALOG_REVIEWS_PAGE_LIMIT,
  username,
}: {
  enabled?: boolean;
  limit?: number;
  username: string;
}) {
  const query = useInfiniteQuery<
    ProfileCatalogReviewsResponse,
    Error,
    InfiniteData<ProfileCatalogReviewsResponse, string | undefined>,
    ReturnType<typeof profileCatalogReviewsQueryKey>,
    string | undefined
  >({
    enabled,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNextPage
        ? (lastPage.pageInfo.nextCursor ?? undefined)
        : undefined,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      sdk.users.listProfileCatalogReviews(username, {
        ...(pageParam ? { cursor: pageParam } : {}),
        limit,
      }),
    queryKey: profileCatalogReviewsQueryKey(username, limit),
  });

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );

  return { ...query, items };
}
