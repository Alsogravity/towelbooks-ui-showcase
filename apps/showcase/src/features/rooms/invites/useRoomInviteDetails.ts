import { useQuery } from '@tanstack/react-query';

import { sdk } from '../../../lib/sdk';

import type { RoomInviteDetailsResponse } from '../types';

const QUEUED_EMAIL_DELIVERY_POLL_MS = 15_000;

export function roomInviteDetailsQueryKey(
  roomId: string,
  inviteId: string | null,
) {
  return ['rooms', roomId, 'invites', 'details', inviteId] as const;
}

export function useRoomInviteDetails(roomId: string, inviteId: string | null) {
  return useQuery({
    queryKey: roomInviteDetailsQueryKey(roomId, inviteId),
    queryFn: () => {
      if (!inviteId) {
        throw new Error('Invite id is required to load invite details.');
      }

      return sdk.invites.getDetails(roomId, inviteId);
    },
    enabled: Boolean(roomId) && Boolean(inviteId),
    refetchInterval: (query) =>
      hasQueuedEmailDelivery(query.state.data)
        ? QUEUED_EMAIL_DELIVERY_POLL_MS
        : false,
    refetchOnWindowFocus: true,
    staleTime: 5_000,
  });
}

function hasQueuedEmailDelivery(
  details: RoomInviteDetailsResponse | undefined,
): boolean {
  return (
    details?.allowedEmails.some(
      (allowedEmail) => allowedEmail.emailDelivery?.status === 'queued',
    ) ?? false
  );
}
