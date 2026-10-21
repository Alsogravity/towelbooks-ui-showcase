import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo, useRef } from 'react';

import { useStableIntersectionLoadMore } from '../../hooks/useStableIntersectionLoadMore';
import { sdk } from '../../lib/sdk';

export function profileActivityFeedQueryKey(username: string) {
  return ['profiles', username, 'activity-events'] as const;
}

export function useProfileActivityFeed(username: string) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const query = useInfiniteQuery({
    initialPageParam: undefined as string | undefined,
    queryKey: profileActivityFeedQueryKey(username),
    queryFn: ({ pageParam }) =>
      sdk.users.listProfileActivities(username, {
        ...(pageParam ? { cursor: pageParam } : {}),
      }),
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNextPage
        ? (lastPage.pageInfo.nextCursor ?? undefined)
        : undefined,
  });

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );

  const hasLoadedData = (query.data?.pages.length ?? 0) > 0;
  const isInitialLoading = query.isLoading;
  const isNextPageError = query.isFetchNextPageError && hasLoadedData;

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;

  useStableIntersectionLoadMore({
    blocked: isNextPageError,
    hasNextPage,
    isFetchingNextPage,
    loadMore: () => void fetchNextPage(),
    loadMoreRef,
  });

  return {
    ...query,
    hasLoadedData,
    isInitialLoading,
    isNextPageError,
    items,
    loadMoreRef,
  };
}
