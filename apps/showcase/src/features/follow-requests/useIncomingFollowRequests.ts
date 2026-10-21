import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo, useRef } from 'react';

import { PROFILE_FOLLOW_PAGE_SIZE } from '../../components/profile/profileFollowDialogShared';
import { useStableIntersectionLoadMore } from '../../hooks/useStableIntersectionLoadMore';
import { sdk } from '../../lib/sdk';
import { incomingFollowRequestsQueryKey } from './followRequestsQuery';

export function useIncomingFollowRequests(options: { enabled: boolean }) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const query = useInfiniteQuery({
    enabled: options.enabled,
    initialPageParam: undefined as string | undefined,
    queryKey: incomingFollowRequestsQueryKey(),
    queryFn: ({ pageParam }) =>
      sdk.users.me.listFollowRequests({
        cursor: pageParam,
        limit: PROFILE_FOLLOW_PAGE_SIZE,
      }),
    getNextPageParam: (lastPage) => lastPage.pageInfo.nextCursor ?? undefined,
  });

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;

  useStableIntersectionLoadMore({
    enabled: options.enabled,
    hasNextPage,
    isFetchingNextPage,
    loadMore: () => void fetchNextPage(),
    loadMoreRef,
  });

  return {
    ...query,
    items,
    loadMoreRef,
  };
}
