import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { sdk } from '../../lib/sdk';
import { NOTIFICATIONS_BELL_POLL_MS } from '../notifications/notificationsPolling';
import { roomJoinRequestsSummaryQueryKey } from './roomJoinRequestsQuery';

export function useRoomJoinRequestsSummary(options?: { enabled?: boolean }) {
  return useQuery({
    enabled: options?.enabled ?? true,
    queryFn: () => sdk.users.me.roomJoinRequests.summary(),
    queryKey: roomJoinRequestsSummaryQueryKey(),
    refetchInterval: NOTIFICATIONS_BELL_POLL_MS,
    refetchOnWindowFocus: true,
  });
}

export function useMarkRoomJoinRequestsSeen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ seenBefore }: { seenBefore: string }) =>
      sdk.users.me.roomJoinRequests.markSeen({ seenBefore }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: roomJoinRequestsSummaryQueryKey(),
      });
    },
  });
}
