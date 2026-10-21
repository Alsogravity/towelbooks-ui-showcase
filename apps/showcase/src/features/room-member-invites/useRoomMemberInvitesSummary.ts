import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { sdk } from '../../lib/sdk';
import { NOTIFICATIONS_BELL_POLL_MS } from '../notifications/notificationsPolling';
import {
  incomingRoomMemberInvitesQueryKey,
  incomingRoomMemberInvitesSummaryQueryKey,
} from './roomMemberInvitesQuery';

export function useRoomMemberInvitesSummary(options?: { enabled?: boolean }) {
  return useQuery({
    enabled: options?.enabled ?? true,
    queryFn: () => sdk.users.me.memberInvites.summary(),
    queryKey: incomingRoomMemberInvitesSummaryQueryKey(),
    refetchInterval: NOTIFICATIONS_BELL_POLL_MS,
    refetchOnWindowFocus: true,
  });
}

export function useMarkRoomMemberInvitesSeen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ seenBefore }: { seenBefore: string }) =>
      sdk.users.me.memberInvites.markSeen({ seenBefore }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: incomingRoomMemberInvitesSummaryQueryKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: incomingRoomMemberInvitesQueryKey(),
        }),
      ]);
    },
  });
}
