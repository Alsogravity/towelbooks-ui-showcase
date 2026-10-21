import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ApiRequestError, getApiErrorCode } from '@towelbooks/sdk';
import type { RoomMemberInvite } from '@towelbooks/schemas';

import { useToast } from '../../../components/feedback';
import { handleApiProblem } from '../../errors';
import { useI18n } from '../../../i18n';
import { sdk } from '../../../lib/sdk';

export const roomMemberInvitesQueryKey = (roomId: string) =>
  ['rooms', roomId, 'member-invites'] as const;

export function useRoomMemberInvitesManagement(
  roomId: string,
  enabled: boolean,
) {
  const { t } = useI18n();
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const [identifier, setIdentifier] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: roomMemberInvitesQueryKey(roomId),
    enabled,
    queryFn: async () => {
      const response = await sdk.rooms.listMemberInvites(roomId, {
        page: 1,
        pageSize: 50,
      });
      return response.items;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (value: string) =>
      sdk.rooms.createMemberInvite(roomId, { identifier: value }),
    onSuccess: async () => {
      setIdentifier('');
      setFormError(null);
      pushToast({
        title: t('rooms.memberInvites.create.success'),
        variant: 'success',
      });
      await queryClient.invalidateQueries({
        queryKey: roomMemberInvitesQueryKey(roomId),
      });
    },
    onError: (error) => {
      if (error instanceof ApiRequestError) {
        const detail = error.problem.detail ?? '';
        const code = getApiErrorCode(error);

        if (code === 'CONFLICT') {
          const titleKey = detail.includes('pending invite')
            ? 'rooms.memberInvites.create.pendingConflict'
            : 'rooms.memberInvites.create.memberConflict';

          pushToast({
            title: t(titleKey),
            variant: 'error',
          });
          return;
        }

        if (
          code === 'VALIDATION_FAILED' &&
          detail.includes('invite yourself')
        ) {
          pushToast({
            title: t('rooms.memberInvites.create.selfConflict'),
            variant: 'error',
          });
          return;
        }

        const problem = handleApiProblem(error, {
          fallbackKey: 'rooms.memberInvites.create.error',
          t,
        });

        pushToast({
          title: problem.message,
          variant: 'error',
        });
        return;
      }

      const problem = handleApiProblem(error, {
        fallbackKey: 'rooms.memberInvites.create.error',
        t,
      });
      setFormError(problem.message);
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (inviteId: string) =>
      sdk.rooms.revokeMemberInvite(roomId, inviteId),
    onSuccess: async () => {
      pushToast({
        title: t('rooms.memberInvites.revoke.success'),
        variant: 'success',
      });
      await queryClient.invalidateQueries({
        queryKey: roomMemberInvitesQueryKey(roomId),
      });
    },
    onError: (error) => {
      const problem = handleApiProblem(error, {
        fallbackKey: 'rooms.memberInvites.revoke.error',
        t,
      });
      pushToast({
        title: problem.message,
        variant: 'error',
      });
    },
  });

  const submit = () => {
    const trimmed = identifier.trim();
    if (!trimmed) {
      setFormError(t('rooms.memberInvites.create.identifierRequired'));
      return;
    }
    createMutation.mutate(trimmed);
  };

  return {
    createMutation,
    formError,
    identifier,
    invites: (listQuery.data ?? []) as RoomMemberInvite[],
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    listError: listQuery.error,
    pendingRevokeInviteId: revokeMutation.isPending
      ? (revokeMutation.variables ?? null)
      : null,
    refetch: listQuery.refetch,
    revokeMutation,
    setIdentifier,
    submit,
  };
}
