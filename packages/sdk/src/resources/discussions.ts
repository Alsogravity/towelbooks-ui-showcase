import {
  discussionSchema,
  messageResponseSchema,
  paginatedDiscussionsResponseSchema,
  type CreateDiscussionRequest,
  type Discussion,
  type MessageResponse,
  type PaginatedDiscussionsResponse,
  type UpdateDiscussionRequest,
} from '@towelbooks/schemas';

import type { Transport } from '../transport.js';

export type DiscussionsResource = {
  listDiscussions(
    roomId: string,
    query?: { page?: number; pageSize?: number },
  ): Promise<PaginatedDiscussionsResponse>;
  createDiscussion(
    roomId: string,
    body: CreateDiscussionRequest,
  ): Promise<Discussion>;
  getDiscussion(roomId: string, discussionId: string): Promise<Discussion>;
  updateDiscussion(
    roomId: string,
    discussionId: string,
    body: UpdateDiscussionRequest,
  ): Promise<Discussion>;
  deleteDiscussion(
    roomId: string,
    discussionId: string,
  ): Promise<MessageResponse>;
  pinDiscussion(roomId: string, discussionId: string): Promise<Discussion>;
  unpinDiscussion(roomId: string, discussionId: string): Promise<Discussion>;
  lockDiscussion(roomId: string, discussionId: string): Promise<Discussion>;
  unlockDiscussion(roomId: string, discussionId: string): Promise<Discussion>;
};

export function createDiscussionsResource(
  transport: Transport,
): DiscussionsResource {
  return {
    listDiscussions(roomId, query = {}) {
      return transport.request({
        method: 'GET',
        path: '/rooms/:roomId/discussions',
        pathParams: { roomId },
        query,
        schema: paginatedDiscussionsResponseSchema,
      });
    },
    createDiscussion(roomId, body) {
      return transport.request({
        method: 'POST',
        path: '/rooms/:roomId/discussions',
        pathParams: { roomId },
        body,
        schema: discussionSchema,
      });
    },
    getDiscussion(roomId, discussionId) {
      return transport.request({
        method: 'GET',
        path: '/rooms/:roomId/discussions/:discussionId',
        pathParams: { roomId, discussionId },
        schema: discussionSchema,
      });
    },
    updateDiscussion(roomId, discussionId, body) {
      return transport.request({
        method: 'PATCH',
        path: '/rooms/:roomId/discussions/:discussionId',
        pathParams: { roomId, discussionId },
        body,
        schema: discussionSchema,
      });
    },
    deleteDiscussion(roomId, discussionId) {
      return transport.request({
        method: 'DELETE',
        path: '/rooms/:roomId/discussions/:discussionId',
        pathParams: { roomId, discussionId },
        schema: messageResponseSchema,
      });
    },
    pinDiscussion(roomId, discussionId) {
      return transport.request({
        method: 'POST',
        path: '/rooms/:roomId/discussions/:discussionId/pin',
        pathParams: { roomId, discussionId },
        schema: discussionSchema,
      });
    },
    unpinDiscussion(roomId, discussionId) {
      return transport.request({
        method: 'DELETE',
        path: '/rooms/:roomId/discussions/:discussionId/pin',
        pathParams: { roomId, discussionId },
        schema: discussionSchema,
      });
    },
    lockDiscussion(roomId, discussionId) {
      return transport.request({
        method: 'POST',
        path: '/rooms/:roomId/discussions/:discussionId/lock',
        pathParams: { roomId, discussionId },
        schema: discussionSchema,
      });
    },
    unlockDiscussion(roomId, discussionId) {
      return transport.request({
        method: 'DELETE',
        path: '/rooms/:roomId/discussions/:discussionId/lock',
        pathParams: { roomId, discussionId },
        schema: discussionSchema,
      });
    },
  };
}
