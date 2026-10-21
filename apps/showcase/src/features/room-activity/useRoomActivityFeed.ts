import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo, useRef } from 'react';

import { useStableIntersectionLoadMore } from '../../hooks/useStableIntersectionLoadMore';
import { sdk } from '../../lib/sdk';

export const roomActivityQueryKeys = {
  room: (roomId: string) => ['rooms', roomId, 'activity-events'] as const,
  viewer: (limit?: number) =>
    ['dashboard', 'room-activities', ...(limit ? [{ limit }] : [])] as const,
};

export function useRoomActivityFeed(roomId: string) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const query = useInfiniteQuery({
    queryKey: roomActivityQueryKeys.room(roomId),
    queryFn: ({ pageParam }) =>
      pageParam
        ? sdk.activityEvents.listForRoom(roomId, { cursor: pageParam })
        : sdk.activityEvents.listForRoom(roomId),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNextPage
        ? (lastPage.pageInfo.nextCursor ?? undefined)
        : undefined,
  });

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;

  useStableIntersectionLoadMore({
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
