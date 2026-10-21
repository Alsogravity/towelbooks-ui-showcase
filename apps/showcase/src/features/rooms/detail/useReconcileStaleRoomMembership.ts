import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import {
  isRoomAccessForbiddenError,
  isRoomOverviewQueryKey,
  isRoomScopedQueryKey,
  reconcileRoomAccessAfterForbidden,
  type RoomAccessMutationMeta,
} from './reconcileRoomAccess';

/**
 * Listens for ROOM_FORBIDDEN on room-scoped queries/mutations (except overview)
 * and refreshes overview so removed members leave the stale member shell.
 */
export function useReconcileStaleRoomMembership(roomId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!roomId) {
      return;
    }

    const maybeReconcile = (error: unknown, queryKey?: readonly unknown[]) => {
      if (!isRoomAccessForbiddenError(error)) {
        return;
      }

      if (queryKey && isRoomOverviewQueryKey(queryKey, roomId)) {
        return;
      }

      if (queryKey && !isRoomScopedQueryKey(queryKey, roomId)) {
        return;
      }

      void reconcileRoomAccessAfterForbidden(queryClient, roomId);
    };

    const unsubscribeQuery = queryClient.getQueryCache().subscribe((event) => {
      if (event.type !== 'updated') {
        return;
      }

      const { query } = event;
      if (query.state.status !== 'error') {
        return;
      }

      maybeReconcile(query.state.error, query.queryKey);
    });

    const unsubscribeMutation = queryClient
      .getMutationCache()
      .subscribe((event) => {
        if (event.type !== 'updated') {
          return;
        }

        const { mutation } = event;
        if (mutation.state.status !== 'error') {
          return;
        }

        const meta = mutation.options.meta as
          RoomAccessMutationMeta | undefined;
        if (meta?.roomId !== roomId) {
          return;
        }

        maybeReconcile(mutation.state.error);
      });

    return () => {
      unsubscribeQuery();
      unsubscribeMutation();
    };
  }, [queryClient, roomId]);
}
