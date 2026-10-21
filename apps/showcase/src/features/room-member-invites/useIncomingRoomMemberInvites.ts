import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import type { PaginatedIncomingRoomMemberInvitesResponse } from '@towelbooks/schemas';
import { useMemo } from 'react';

import { sdk } from '../../lib/sdk';
import { incomingRoomMemberInvitesQueryKey } from './roomMemberInvitesQuery';

const PAGE_SIZE = 20;

export function useIncomingRoomMemberInvites(options?: { enabled?: boolean }) {
  const query = useInfiniteQuery<
    PaginatedIncomingRoomMemberInvitesResponse,
    Error,
    InfiniteData<PaginatedIncomingRoomMemberInvitesResponse, number>,
    ReturnType<typeof incomingRoomMemberInvitesQueryKey>,
    number
  >({
    enabled: options?.enabled ?? true,
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      sdk.users.me.memberInvites.list({
        page: pageParam,
        pageSize: PAGE_SIZE,
      }),
    queryKey: incomingRoomMemberInvitesQueryKey(),
  });

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data?.pages],
  );

  return {
    ...query,
    items,
  };
}
