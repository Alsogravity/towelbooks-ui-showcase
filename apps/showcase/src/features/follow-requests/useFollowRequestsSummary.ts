import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { sdk } from '../../lib/sdk';
import { NOTIFICATIONS_BELL_POLL_MS } from '../notifications/notificationsPolling';
import {
  incomingFollowRequestsQueryKey,
  incomingFollowRequestsSummaryQueryKey,
} from './followRequestsQuery';

export function useFollowRequestsSummary(options?: { enabled?: boolean }) {
  return useQuery({
    enabled: options?.enabled ?? true,
    queryFn: () => sdk.users.me.getFollowRequestsSummary(),
    queryKey: incomingFollowRequestsSummaryQueryKey(),
    refetchInterval: NOTIFICATIONS_BELL_POLL_MS,
    refetchOnWindowFocus: true,
  });
}

export function useMarkFollowRequestsSeen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ seenBefore }: { seenBefore: string }) =>
      sdk.users.me.markFollowRequestsSeen({ seenBefore }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: incomingFollowRequestsSummaryQueryKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: incomingFollowRequestsQueryKey(),
        }),
      ]);
    },
  });
}
