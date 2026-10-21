import {
  catalogReviewSchema,
  catalogReviewDiscoveryQuerySchema,
  catalogWorkCatalogReviewsResponseSchema,
  cursorPaginatedCatalogReviewsSchema,
  createCatalogReviewRequestSchema,
  messageResponseSchema,
  myCatalogReviewDraftsResponseSchema,
  publicCatalogReviewSchema,
  publishCatalogReviewRequestSchema,
  updateCatalogReviewRequestSchema,
  viewerCatalogReviewResponseSchema,
  type CatalogReview,
  type CatalogReviewDiscoveryQuery,
  type CursorPaginatedCatalogReviews,
  type CatalogWorkCatalogReviewsQuery,
  type CatalogWorkCatalogReviewsResponse,
  type CreateCatalogReviewRequest,
  type MessageResponse,
  type MyCatalogReviewDraftsResponse,
  type PublicCatalogReview,
  type PublishCatalogReviewRequest,
  type UpdateCatalogReviewRequest,
  type ViewerCatalogReviewResponse,
} from '@towelbooks/schemas';

import type { Transport } from '../transport.js';

export type CatalogReviewsResource = {
  list(
    query?: CatalogReviewDiscoveryQuery,
  ): Promise<CursorPaginatedCatalogReviews>;
  create(body: CreateCatalogReviewRequest): Promise<CatalogReview>;
  delete(catalogReviewId: string): Promise<MessageResponse>;
  get(catalogReviewId: string): Promise<PublicCatalogReview>;
  getEditable(catalogReviewId: string): Promise<CatalogReview>;
  getMineForWork(catalogWorkId: string): Promise<ViewerCatalogReviewResponse>;
  listForCatalogWork(
    catalogWorkId: string,
    query?: CatalogWorkCatalogReviewsQuery,
  ): Promise<CatalogWorkCatalogReviewsResponse>;
  listMyDrafts(): Promise<MyCatalogReviewDraftsResponse>;
  publish(
    catalogReviewId: string,
    body?: PublishCatalogReviewRequest,
  ): Promise<CatalogReview>;
  update(
    catalogReviewId: string,
    body: UpdateCatalogReviewRequest,
  ): Promise<CatalogReview>;
};

export function createCatalogReviewsResource(
  transport: Transport,
): CatalogReviewsResource {
  return {
    list(query = {}) {
      const parsedQuery = catalogReviewDiscoveryQuerySchema.parse(query);

      return transport.request({
        method: 'GET',
        path: '/catalog-reviews',
        query: {
          ...(parsedQuery.cursor !== undefined
            ? { cursor: parsedQuery.cursor }
            : {}),
          ...(parsedQuery.limit !== undefined
            ? { limit: parsedQuery.limit }
            : {}),
        },
        schema: cursorPaginatedCatalogReviewsSchema,
      });
    },
    create(body) {
      return transport.request({
        body: createCatalogReviewRequestSchema.parse(body),
        method: 'POST',
        path: '/catalog-reviews',
        schema: catalogReviewSchema,
      });
    },
    delete(catalogReviewId) {
      return transport.request({
        method: 'DELETE',
        path: `/catalog-reviews/${encodeURIComponent(catalogReviewId)}`,
        schema: messageResponseSchema,
      });
    },
    get(catalogReviewId) {
      return transport.request({
        method: 'GET',
        path: `/catalog-reviews/${encodeURIComponent(catalogReviewId)}`,
        schema: publicCatalogReviewSchema,
      });
    },
    getEditable(catalogReviewId) {
      return transport.request({
        method: 'GET',
        path: `/catalog-reviews/${encodeURIComponent(catalogReviewId)}/edit`,
        schema: catalogReviewSchema,
      });
    },
    getMineForWork(catalogWorkId) {
      return transport.request({
        method: 'GET',
        path: '/catalog-reviews/me',
        query: { catalogWorkId },
        schema: viewerCatalogReviewResponseSchema,
      });
    },
    listForCatalogWork(catalogWorkId, query = {}) {
      return transport.request({
        method: 'GET',
        path: '/catalog/works/:catalogWorkId/catalog-reviews',
        pathParams: { catalogWorkId },
        query,
        schema: catalogWorkCatalogReviewsResponseSchema,
      });
    },
    listMyDrafts() {
      return transport.request({
        method: 'GET',
        path: '/catalog-reviews/me/drafts',
        schema: myCatalogReviewDraftsResponseSchema,
      });
    },
    publish(catalogReviewId, body = {}) {
      return transport.request({
        body: publishCatalogReviewRequestSchema.parse(body),
        method: 'POST',
        path: `/catalog-reviews/${encodeURIComponent(catalogReviewId)}/publish`,
        schema: catalogReviewSchema,
      });
    },
    update(catalogReviewId, body) {
      return transport.request({
        body: updateCatalogReviewRequestSchema.parse(body),
        method: 'PATCH',
        path: `/catalog-reviews/${encodeURIComponent(catalogReviewId)}`,
        schema: catalogReviewSchema,
      });
    },
  };
}
