import {
  createRatingRequestSchema,
  messageResponseSchema,
  paginatedRatingsResponseSchema,
  ratingSchema,
  updateRatingRequestSchema,
  type CreateRatingRequest,
  type MessageResponse,
  type PaginatedRatingsResponse,
  type Rating,
  type UpdateRatingRequest,
  type ViewerRatingResponse,
  viewerRatingResponseSchema,
} from '@towelbooks/schemas';

import type { Transport } from '../transport.js';

export type ListCatalogWorkRatingsQuery = {
  authorUserId?: string;
  page?: number;
  pageSize?: number;
};

export type RatingsResource = {
  create(body: CreateRatingRequest): Promise<Rating>;
  delete(ratingId: string): Promise<MessageResponse>;
  get(ratingId: string): Promise<Rating>;
  getViewerForCatalogWork(catalogWorkId: string): Promise<ViewerRatingResponse>;
  listForCatalogWork(
    catalogWorkId: string,
    query?: ListCatalogWorkRatingsQuery,
  ): Promise<PaginatedRatingsResponse>;
  update(ratingId: string, body: UpdateRatingRequest): Promise<Rating>;
};

export function createRatingsResource(transport: Transport): RatingsResource {
  return {
    create(body) {
      return transport.request({
        body: createRatingRequestSchema.parse(body),
        method: 'POST',
        path: '/ratings',
        schema: ratingSchema,
      });
    },
    delete(ratingId) {
      return transport.request({
        method: 'DELETE',
        path: `/ratings/${encodeURIComponent(ratingId)}`,
        schema: messageResponseSchema,
      });
    },
    get(ratingId) {
      return transport.request({
        method: 'GET',
        path: `/ratings/${encodeURIComponent(ratingId)}`,
        schema: ratingSchema,
      });
    },
    getViewerForCatalogWork(catalogWorkId) {
      return transport.request({
        method: 'GET',
        path: '/ratings/catalog-works/:catalogWorkId/me',
        pathParams: { catalogWorkId },
        schema: viewerRatingResponseSchema,
      });
    },
    listForCatalogWork(catalogWorkId, query = {}) {
      return transport.request({
        method: 'GET',
        path: '/ratings/catalog-works/:catalogWorkId',
        pathParams: { catalogWorkId },
        query,
        schema: paginatedRatingsResponseSchema,
      });
    },
    update(ratingId, body) {
      return transport.request({
        body: updateRatingRequestSchema.parse(body),
        method: 'PATCH',
        path: `/ratings/${encodeURIComponent(ratingId)}`,
        schema: ratingSchema,
      });
    },
  };
}
