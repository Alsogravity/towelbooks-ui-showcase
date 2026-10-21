import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useToast } from '../../components/feedback';
import { handleApiProblem } from '../errors';
import { useI18n } from '../../i18n';
import { sdk } from '../../lib/sdk';
import { roomMemberInvitesQueryKey } from '../rooms/member-invites/useRoomMemberInvitesManagement';
import {
  incomingRoomMemberInvitesQueryKey,
  incomingRoomMemberInvitesSummaryQueryKey,
} from './roomMemberInvitesQuery';

type RoomMemberInviteActionInput = {
  action: 'accept' | 'refuse';
  inviteId: string;
  roomId: string;
};

export function useRoomMemberInviteActions() {
  const queryClient = useQueryClient();
  const { pushToast } = useToast();
  const { t } = useI18n();

  return useMutation({
    mutationFn: async ({ action, inviteId }: RoomMemberInviteActionInput) => {
      if (action === 'accept') {
        return sdk.users.me.memberInvites.accept(inviteId);
      }

      return sdk.users.me.memberInvites.refuse(inviteId);
    },
    onError: (error) => {
      const problem = handleApiProblem(error, {
        fallbackKey: 'rooms.memberInvites.notifications.error',
        t,
      });
      pushToast({
        title: problem.message,
        variant: 'error',
      });
    },
    onSuccess: async (result, variables) => {
      pushToast({
        title:
          variables.action === 'accept'
            ? t('rooms.memberInvites.notifications.accept.success')
            : t('rooms.memberInvites.notifications.refuse.success'),
        variant: 'success',
      });

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: incomingRoomMemberInvitesQueryKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: incomingRoomMemberInvitesSummaryQueryKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: roomMemberInvitesQueryKey(variables.roomId),
        }),
        queryClient.invalidateQueries({
          queryKey: ['rooms', variables.roomId],
        }),
      ]);

      return result;
    },
  });
}
