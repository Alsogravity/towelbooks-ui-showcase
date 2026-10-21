import {
  paginatedReadingsResponseSchema,
  readingSchema,
  type CreateReadingRequest,
  type PaginatedReadingsResponse,
  type Reading,
  type UpdateReadingRequest,
} from '@towelbooks/schemas';

import type { Transport } from '../transport.js';

export type ReadingsResource = {
  listForRoom(roomId: string): Promise<PaginatedReadingsResponse>;
  get(roomId: string, readingId: string): Promise<Reading>;
  create(roomId: string, body: CreateReadingRequest): Promise<Reading>;
  update(
    roomId: string,
    readingId: string,
    body: UpdateReadingRequest,
  ): Promise<Reading>;
  finish(roomId: string, readingId: string): Promise<Reading>;
};

export function createReadingsResource(transport: Transport): ReadingsResource {
  return {
    listForRoom(roomId) {
      return transport.request({
        method: 'GET',
        path: '/rooms/:roomId/readings',
        pathParams: { roomId },
        schema: paginatedReadingsResponseSchema,
      });
    },
    get(roomId, readingId) {
      return transport.request({
        method: 'GET',
        path: '/rooms/:roomId/readings/:readingId',
        pathParams: { roomId, readingId },
        schema: readingSchema,
      });
    },
    create(roomId, body) {
      return transport.request({
        method: 'POST',
        path: '/rooms/:roomId/readings',
        pathParams: { roomId },
        body,
        schema: readingSchema,
      });
    },
    update(roomId, readingId, body) {
      return transport.request({
        method: 'PATCH',
        path: '/rooms/:roomId/readings/:readingId',
        pathParams: { roomId, readingId },
        body,
        schema: readingSchema,
      });
    },
    finish(roomId, readingId) {
      return transport.request({
        method: 'POST',
        path: '/rooms/:roomId/readings/:readingId/finish',
        pathParams: { roomId, readingId },
        schema: readingSchema,
      });
    },
  };
}
