import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo, useRef } from 'react';

import {
  PROFILE_FOLLOW_PAGE_SIZE,
  type ProfileFollowDialogTab,
} from './profileFollowDialogShared';
import { useStableIntersectionLoadMore } from '../../hooks/useStableIntersectionLoadMore';
import { sdk } from '../../lib/sdk';

export function useProfileFollowList(
  username: string,
  kind: ProfileFollowDialogTab,
  options: { enabled: boolean },
) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const query = useInfiniteQuery({
    enabled: options.enabled,
    initialPageParam: undefined as string | undefined,
    queryKey: ['profiles', username, kind],
    queryFn: ({ pageParam }) =>
      kind === 'followers'
        ? sdk.users.listFollowers(username, {
            cursor: pageParam,
            limit: PROFILE_FOLLOW_PAGE_SIZE,
          })
        : sdk.users.listFollowing(username, {
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
