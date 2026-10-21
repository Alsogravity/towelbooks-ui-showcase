import {
  commentSchema,
  createCommentRequestSchema,
  cursorPaginatedCommentsResponseSchema,
  messageResponseSchema,
  updateCommentRequestSchema,
  type Comment,
  type CreateCommentRequest,
  type CursorPaginatedCommentsResponse,
  type MessageResponse,
  type UpdateCommentRequest,
} from '@towelbooks/schemas';

import type { Transport } from '../transport.js';

export type ListCommentsOptions = {
  cursor?: string;
  limit?: number;
  parentCommentId?: string;
  targetType: Comment['targetType'];
  targetId: string;
};

export type CommentsResource = {
  list(options: ListCommentsOptions): Promise<CursorPaginatedCommentsResponse>;
  create(body: CreateCommentRequest): Promise<Comment>;
  update(commentId: string, body: UpdateCommentRequest): Promise<Comment>;
  delete(commentId: string): Promise<MessageResponse>;
};

export function createCommentsResource(transport: Transport): CommentsResource {
  return {
    list(options) {
      return transport.request({
        method: 'GET',
        path: '/comments',
        query: {
          ...(options.cursor ? { cursor: options.cursor } : {}),
          ...(options.limit !== undefined ? { limit: options.limit } : {}),
          ...(options.parentCommentId
            ? { parentCommentId: options.parentCommentId }
            : {}),
          targetId: options.targetId,
          targetType: options.targetType,
        },
        schema: cursorPaginatedCommentsResponseSchema,
      });
    },
    create(body) {
      createCommentRequestSchema.parse(body);

      return transport.request({
        method: 'POST',
        path: '/comments',
        body,
        schema: commentSchema,
      });
    },
    update(commentId, body) {
      updateCommentRequestSchema.parse(body);

      return transport.request({
        method: 'PATCH',
        path: '/comments/:commentId',
        pathParams: { commentId },
        body,
        schema: commentSchema,
      });
    },
    delete(commentId) {
      return transport.request({
        method: 'DELETE',
        path: '/comments/:commentId',
        pathParams: { commentId },
        schema: messageResponseSchema,
      });
    },
  };
}
