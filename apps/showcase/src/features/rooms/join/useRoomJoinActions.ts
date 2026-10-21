import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiErrorCode } from '@towelbooks/sdk';
import {
  type CreateRoomJoinRequestResponse,
  type JoinRoomResponse,
  type RoomOverview,
} from '@towelbooks/schemas';

import { handleApiProblem } from '../../errors';
import { roomOverviewQueryKey } from '../detail/reconcileRoomAccess';
import { useI18n } from '../../../i18n';
import { sdk } from '../../../lib/sdk';

const roomJoinErrorMessageKeys = {
  ROOM_JOIN_FORBIDDEN: 'rooms.join.error.forbidden',
  ROOM_REJOIN_FORBIDDEN: 'rooms.join.error.rejoinForbidden',
  ROOM_JOIN_REQUEST_NOT_FOUND: 'rooms.join.error.requestNotFound',
} as const;

export type JoinAttemptResult =
  | { kind: 'joined'; response: JoinRoomResponse }
  | { kind: 'needs_request' }
  | { kind: 'entry_closed' };

export type RequestAttemptResult =
  | { kind: 'requested'; response: CreateRoomJoinRequestResponse }
  | { kind: 'joined'; response: JoinRoomResponse }
  | { kind: 'entry_closed' };

export function useRoomJoinActions(roomId: string) {
  const { locale, t } = useI18n();
  const queryClient = useQueryClient();

  const invalidateRoom = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['rooms', roomId] }),
      queryClient.invalidateQueries({
        queryKey: ['rooms', roomId, 'overview'],
      }),
      queryClient.invalidateQueries({ queryKey: ['rooms', 'list'] }),
      queryClient.invalidateQueries({ queryKey: ['rooms', 'discover'] }),
    ]);
  };

  const fetchFreshOverview = async (
    actionError: unknown,
  ): Promise<RoomOverview> => {
    try {
      const overview = await sdk.rooms.getOverview(roomId);
      queryClient.setQueryData(roomOverviewQueryKey(roomId, locale), overview);
      return overview;
    } catch {
      // Prefer the original join/request failure over a secondary overview error
      // (e.g. room became private and overview is no longer readable).
      throw actionError;
    }
  };

  const requestJoinOrEnter = async (): Promise<RequestAttemptResult> => {
    try {
      const response = await sdk.rooms.createJoinRequest(roomId);
      return { kind: 'requested', response };
    } catch (error) {
      if (getApiErrorCode(error) !== 'ROOM_JOIN_FORBIDDEN') {
        throw error;
      }

      const overview = await fetchFreshOverview(error);
      if (overview.viewer.entry.canJoinDirectly) {
        const response = await sdk.rooms.join(roomId);
        return { kind: 'joined', response };
      }

      if (!overview.viewer.entry.canRequestJoin) {
        return { kind: 'entry_closed' };
      }

      throw error;
    }
  };

  const joinOrRecoverPolicy = async (): Promise<JoinAttemptResult> => {
    try {
      const response = await sdk.rooms.join(roomId);
      return { kind: 'joined', response };
    } catch (error) {
      if (getApiErrorCode(error) !== 'ROOM_JOIN_FORBIDDEN') {
        throw error;
      }

      const overview = await fetchFreshOverview(error);
      if (overview.viewer.entry.canRequestJoin) {
        return { kind: 'needs_request' };
      }

      if (!overview.viewer.entry.canJoinDirectly) {
        return { kind: 'entry_closed' };
      }

      throw error;
    }
  };

  const joinMutation = useMutation({
    mutationFn: joinOrRecoverPolicy,
    onSuccess: async (result) => {
      if (result.kind === 'joined') {
        await invalidateRoom();
      }
    },
  });

  const requestJoinMutation = useMutation({
    mutationFn: requestJoinOrEnter,
    onSuccess: async (result) => {
      if (result.kind === 'requested' || result.kind === 'joined') {
        await invalidateRoom();
      }
    },
  });

  const cancelRequestMutation = useMutation({
    mutationFn: () => sdk.rooms.cancelJoinRequest(roomId),
    onSuccess: invalidateRoom,
  });

  const getErrorMessage = (error: unknown) =>
    handleApiProblem(error, {
      fallbackKey: 'rooms.join.error.generic',
      messageKeys: roomJoinErrorMessageKeys,
      t,
    }).message;

  return {
    cancelRequestMutation,
    getErrorMessage,
    joinMutation,
    requestJoinMutation,
  };
}
