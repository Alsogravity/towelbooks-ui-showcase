import {
  catalogItemSchema,
  paginatedCatalogSearchResponseSchema,
  catalogWorkCatalogReviewsResponseSchema,
  contributionResolutionResponseSchema,
  contributionResponseSchema,
  catalogTaxonomyOptionsResponseSchema,
  type ContributionIdentifierRequest,
  type ContributionResolutionResponse,
  type ContributionRequest,
  type ContributionResponse,
  type CatalogItem,
  type CatalogSearchQuery,
  type PaginatedCatalogSearchResponse,
  type CatalogWorkCatalogReviewsQuery,
  type CatalogWorkCatalogReviewsResponse,
  type CatalogTaxonomyOptionsResponse,
} from '@towelbooks/schemas';

import type { Transport } from '../transport.js';

export type CatalogResource = {
  listTaxonomyCategories(): Promise<CatalogTaxonomyOptionsResponse>;
  createContribution(body: ContributionRequest): Promise<ContributionResponse>;
  resolveContribution(
    body: ContributionIdentifierRequest,
  ): Promise<ContributionResolutionResponse>;
  search(query?: CatalogSearchQuery): Promise<PaginatedCatalogSearchResponse>;
  get(catalogWorkId: string): Promise<CatalogItem>;
  listCatalogReviews(
    catalogWorkId: string,
    query?: CatalogWorkCatalogReviewsQuery,
  ): Promise<CatalogWorkCatalogReviewsResponse>;
};

export function createCatalogResource(transport: Transport): CatalogResource {
  return {
    listTaxonomyCategories() {
      return transport.request({
        method: 'GET',
        path: '/catalog/taxonomy',
        schema: catalogTaxonomyOptionsResponseSchema,
      });
    },
    createContribution(body) {
      return transport.request({
        method: 'POST',
        path: '/catalog/contributions',
        body,
        schema: contributionResponseSchema,
      });
    },
    resolveContribution(body) {
      return transport.request({
        method: 'POST',
        path: '/catalog/contributions/resolve',
        body,
        schema: contributionResolutionResponseSchema,
      });
    },
    search(query = {}) {
      return transport.request({
        method: 'GET',
        path: '/catalog/search',
        query,
        schema: paginatedCatalogSearchResponseSchema,
      });
    },
    get(catalogWorkId) {
      return transport.request({
        method: 'GET',
        path: '/catalog/items/:catalogWorkId',
        pathParams: { catalogWorkId },
        schema: catalogItemSchema,
      });
    },
    listCatalogReviews(catalogWorkId, query = {}) {
      return transport.request({
        method: 'GET',
        path: '/catalog/works/:catalogWorkId/catalog-reviews',
        pathParams: { catalogWorkId },
        query,
        schema: catalogWorkCatalogReviewsResponseSchema,
      });
    },
  };
}
