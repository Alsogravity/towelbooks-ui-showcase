import { getApiErrorCode } from '@towelbooks/sdk';
import { type QueryClient } from '@tanstack/react-query';
import { type RoomOverview } from '@towelbooks/schemas';

export const roomOverviewQueryKey = (roomId: string, locale: string) =>
  ['rooms', roomId, 'overview', locale] as const;

export type RoomAccessMutationMeta = {
  roomId?: string;
};

const inFlightReconciles = new Map<string, Promise<void>>();

export function isRoomAccessForbiddenError(error: unknown): boolean {
  return getApiErrorCode(error) === 'ROOM_FORBIDDEN';
}

export function isRoomScopedQueryKey(
  queryKey: readonly unknown[],
  roomId: string,
): boolean {
  return queryKey[0] === 'rooms' && queryKey[1] === roomId;
}

export function isRoomOverviewQueryKey(
  queryKey: readonly unknown[],
  roomId: string,
): boolean {
  return isRoomScopedQueryKey(queryKey, roomId) && queryKey[2] === 'overview';
}

/**
 * When a member-only room request fails with ROOM_FORBIDDEN, refresh overview
 * so the detail page reconciles to the refreshed viewer eligibility state.
 * Skips overview failures to avoid a refetch loop.
 */
export function reconcileRoomAccessAfterForbidden(
  queryClient: QueryClient,
  roomId: string,
): Promise<void> {
  const existing = inFlightReconciles.get(roomId);
  if (existing) {
    return existing;
  }

  const reconcilePromise = (async () => {
    const overviewQueries = queryClient.getQueriesData<RoomOverview>({
      queryKey: ['rooms', roomId, 'overview'],
    });
    const hasAccessibleMemberOverview = overviewQueries.some(
      ([, data]) => data?.viewer.accessState === 'active',
    );

    // A viewer without effective access already has the correct entry state.
    if (!hasAccessibleMemberOverview) {
      return;
    }

    await queryClient.invalidateQueries({
      queryKey: ['rooms', roomId, 'overview'],
    });
  })().finally(() => {
    inFlightReconciles.delete(roomId);
  });

  inFlightReconciles.set(roomId, reconcilePromise);
  return reconcilePromise;
}
