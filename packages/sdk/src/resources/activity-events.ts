import {
  cursorPaginatedActivityEventsResponseSchema,
  cursorPaginatedViewerRoomActivityEventsResponseSchema,
  paginatedRoomActivityFeedPreferencesResponseSchema,
  type CursorPaginatedActivityEventsResponse,
  type CursorPaginatedViewerRoomActivityEventsResponse,
  type PaginatedRoomActivityFeedPreferencesResponse,
  type UpdateRoomActivityFeedPreferencesRequest,
} from '@towelbooks/schemas';

import type { Transport } from '../transport.js';

export type ActivityEventsResource = {
  listForRoom(
    roomId: string,
    options?: {
      cursor?: string;
      limit?: number;
    },
  ): Promise<CursorPaginatedActivityEventsResponse>;
  listForViewer(options?: {
    cursor?: string;
    limit?: number;
  }): Promise<CursorPaginatedViewerRoomActivityEventsResponse>;
  getRoomPreferences(
    roomId: string,
  ): Promise<PaginatedRoomActivityFeedPreferencesResponse>;
  updateRoomPreferences(
    roomId: string,
    body: UpdateRoomActivityFeedPreferencesRequest,
  ): Promise<PaginatedRoomActivityFeedPreferencesResponse>;
};

export function createActivityEventsResource(
  transport: Transport,
): ActivityEventsResource {
  return {
    listForRoom(roomId, options = {}) {
      return transport.request({
        method: 'GET',
        path: '/rooms/:roomId/activities',
        pathParams: { roomId },
        query: options,
        schema: cursorPaginatedActivityEventsResponseSchema,
      });
    },
    listForViewer(options = {}) {
      return transport.request({
        method: 'GET',
        path: '/me/room-activities',
        query: options,
        schema: cursorPaginatedViewerRoomActivityEventsResponseSchema,
      });
    },
    getRoomPreferences(roomId) {
      return transport.request({
        method: 'GET',
        path: '/rooms/:roomId/activity-feed-preferences',
        pathParams: { roomId },
        schema: paginatedRoomActivityFeedPreferencesResponseSchema,
      });
    },
    updateRoomPreferences(roomId, body) {
      return transport.request({
        method: 'PATCH',
        path: '/rooms/:roomId/activity-feed-preferences',
        pathParams: { roomId },
        body,
        schema: paginatedRoomActivityFeedPreferencesResponseSchema,
      });
    },
  };
}
