import {
  messageResponseSchema,
  paginatedPollsResponseSchema,
  pollSchema,
  type AnnouncePollResultRequest,
  type CreatePollRequest,
  type MessageResponse,
  type PaginatedPollsResponse,
  type Poll,
  type SubmitPollResponseRequest,
  type UpdatePollRequest,
} from '@towelbooks/schemas';

import type { Transport } from '../transport.js';

export type PollsResource = {
  listPolls(
    roomId: string,
    query?: { page?: number; pageSize?: number },
  ): Promise<PaginatedPollsResponse>;
  createPoll(roomId: string, body: CreatePollRequest): Promise<Poll>;
  getPoll(roomId: string, pollId: string): Promise<Poll>;
  updatePoll(
    roomId: string,
    pollId: string,
    body: UpdatePollRequest,
  ): Promise<Poll>;
  deletePoll(roomId: string, pollId: string): Promise<MessageResponse>;
  submitResponses(
    roomId: string,
    pollId: string,
    body: SubmitPollResponseRequest,
  ): Promise<Poll>;
  withdrawResponse(roomId: string, pollId: string): Promise<Poll>;
  announceResult(
    roomId: string,
    pollId: string,
    body: AnnouncePollResultRequest,
  ): Promise<Poll>;
  closePoll(roomId: string, pollId: string): Promise<Poll>;
  archivePoll(roomId: string, pollId: string): Promise<Poll>;
};

export function createPollsResource(transport: Transport): PollsResource {
  return {
    listPolls(roomId, query = {}) {
      return transport.request({
        method: 'GET',
        path: '/rooms/:roomId/polls',
        pathParams: { roomId },
        query,
        schema: paginatedPollsResponseSchema,
      });
    },
    createPoll(roomId, body) {
      return transport.request({
        method: 'POST',
        path: '/rooms/:roomId/polls',
        pathParams: { roomId },
        body,
        schema: pollSchema,
      });
    },
    getPoll(roomId, pollId) {
      return transport.request({
        method: 'GET',
        path: '/rooms/:roomId/polls/:pollId',
        pathParams: { roomId, pollId },
        schema: pollSchema,
      });
    },
    updatePoll(roomId, pollId, body) {
      return transport.request({
        method: 'PATCH',
        path: '/rooms/:roomId/polls/:pollId',
        pathParams: { roomId, pollId },
        body,
        schema: pollSchema,
      });
    },
    deletePoll(roomId, pollId) {
      return transport.request({
        method: 'DELETE',
        path: '/rooms/:roomId/polls/:pollId',
        pathParams: { roomId, pollId },
        schema: messageResponseSchema,
      });
    },
    submitResponses(roomId, pollId, body) {
      return transport.request({
        method: 'POST',
        path: '/rooms/:roomId/polls/:pollId/responses',
        pathParams: { roomId, pollId },
        body,
        schema: pollSchema,
      });
    },
    withdrawResponse(roomId, pollId) {
      return transport.request({
        method: 'DELETE',
        path: '/rooms/:roomId/polls/:pollId/responses',
        pathParams: { roomId, pollId },
        schema: pollSchema,
      });
    },
    announceResult(roomId, pollId, body) {
      return transport.request({
        method: 'POST',
        path: '/rooms/:roomId/polls/:pollId/announce-result',
        pathParams: { roomId, pollId },
        body,
        schema: pollSchema,
      });
    },
    closePoll(roomId, pollId) {
      return transport.request({
        method: 'POST',
        path: '/rooms/:roomId/polls/:pollId/close',
        pathParams: { roomId, pollId },
        schema: pollSchema,
      });
    },
    archivePoll(roomId, pollId) {
      return transport.request({
        method: 'POST',
        path: '/rooms/:roomId/polls/:pollId/archive',
        pathParams: { roomId, pollId },
        schema: pollSchema,
      });
    },
  };
}
