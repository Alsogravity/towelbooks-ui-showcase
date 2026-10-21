import { z } from 'zod';

import {
  adminTaxonomyAliasAffectedWorkResponseSchema,
  adminTaxonomyAliasListQuerySchema,
  adminTaxonomyAliasListResponseSchema,
  adminTaxonomyAliasSchema,
  adminTaxonomyCategoryAffectedWorkResponseSchema,
  adminTaxonomyCategoryDetailResponseSchema,
  adminTaxonomyCategoryListQuerySchema,
  adminTaxonomyCategoryListResponseSchema,
  adminTaxonomyCategorySchema,
  adminTaxonomyCategoryTranslationResponseSchema,
  adminTaxonomyCategoryTreeSchema,
  adminTaxonomyObservationListQuerySchema,
  adminTaxonomyObservationListResponseSchema,
  adminTaxonomyObservationSchema,
  createAdminTaxonomyAliasRequestSchema,
  deleteAdminTaxonomyAliasResponseSchema,
  deleteAdminTaxonomyCategoryResponseSchema,
  deleteAdminTaxonomyCategoryTranslationResponseSchema,
  ignoreAdminTaxonomyObservationRequestSchema,
  mapAdminTaxonomyObservationRequestSchema,
  mapAdminTaxonomyObservationResponseSchema,
  replaceAdminTaxonomyCategoryResponseSchema,
  updateAdminTaxonomyAliasRequestSchema,
  type AdminTaxonomyAlias,
  type AdminTaxonomyAliasAffectedWorkResponse,
  type AdminTaxonomyAliasListQuery,
  type AdminTaxonomyAliasListResponse,
  type AdminTaxonomyCategory,
  type AdminTaxonomyCategoryAffectedWorkResponse,
  type AdminTaxonomyCategoryDetailResponse,
  type AdminTaxonomyCategoryListQuery,
  type AdminTaxonomyCategoryListResponse,
  type AdminTaxonomyCategoryTranslationResponse,
  type AdminTaxonomyCategoryTree,
  type AdminTaxonomyObservation,
  type AdminTaxonomyObservationListQuery,
  type AdminTaxonomyObservationListResponse,
  type CreateAdminTaxonomyAliasRequest,
  type CreateAdminTaxonomyCategoryRequest,
  type DeleteAdminTaxonomyAliasResponse,
  type DeleteAdminTaxonomyCategoryResponse,
  type DeleteAdminTaxonomyCategoryTranslationResponse,
  type IgnoreAdminTaxonomyObservationRequest,
  type MapAdminTaxonomyObservationRequest,
  type MapAdminTaxonomyObservationResponse,
  type ReplaceAdminTaxonomyCategoryRequest,
  type ReplaceAdminTaxonomyCategoryResponse,
  type UpdateAdminTaxonomyAliasRequest,
  type UpdateAdminTaxonomyCategoryRequest,
  type UpsertAdminTaxonomyCategoryTranslationRequest,
  upsertAdminTaxonomyCategoryTranslationRequestSchema,
} from '@towelbooks/schemas';

import type { Transport } from '../transport.js';

const adminTaxonomyCategoryTreeListResponseSchema = z.array(
  adminTaxonomyCategoryTreeSchema,
);

/**
 * Admin catalog taxonomy (epic #693, children #703 and #704): the final
 * category hierarchy/lifecycle management surface and the alias +
 * unmatched-label curation surface under `/v1/admin/catalog/taxonomy/*`
 * (docs/architecture/catalog-taxonomy.md §11). Every method is typed by the
 * shared zod schemas, so the SDK stays in lockstep with the API contract; the
 * update methods deliberately take body types with no normalizedLabel/slug
 * keys (normalization is server-side only).
 */
export type AdminTaxonomyResource = {
  listCategories(
    query?: AdminTaxonomyCategoryListQuery,
  ): Promise<AdminTaxonomyCategoryListResponse>;
  getTree(): Promise<AdminTaxonomyCategoryTree[]>;
  getCategory(categoryId: string): Promise<AdminTaxonomyCategoryDetailResponse>;
  getAffectedWork(
    categoryId: string,
  ): Promise<AdminTaxonomyCategoryAffectedWorkResponse>;
  createCategory(
    body: CreateAdminTaxonomyCategoryRequest,
  ): Promise<AdminTaxonomyCategory>;
  updateCategory(
    categoryId: string,
    body: UpdateAdminTaxonomyCategoryRequest,
  ): Promise<AdminTaxonomyCategory>;
  replaceCategory(
    categoryId: string,
    body: ReplaceAdminTaxonomyCategoryRequest,
  ): Promise<ReplaceAdminTaxonomyCategoryResponse>;
  deleteCategory(
    categoryId: string,
  ): Promise<DeleteAdminTaxonomyCategoryResponse>;
  upsertCategoryTranslation(
    categoryId: string,
    locale: string,
    body: UpsertAdminTaxonomyCategoryTranslationRequest,
  ): Promise<AdminTaxonomyCategoryTranslationResponse>;
  deleteCategoryTranslation(
    categoryId: string,
    locale: string,
  ): Promise<DeleteAdminTaxonomyCategoryTranslationResponse>;
  listAliases(
    query?: AdminTaxonomyAliasListQuery,
  ): Promise<AdminTaxonomyAliasListResponse>;
  createAlias(
    body: CreateAdminTaxonomyAliasRequest,
  ): Promise<AdminTaxonomyAlias>;
  updateAlias(
    aliasId: string,
    body: UpdateAdminTaxonomyAliasRequest,
  ): Promise<AdminTaxonomyAlias>;
  getAliasAffectedWork(
    aliasId: string,
  ): Promise<AdminTaxonomyAliasAffectedWorkResponse>;
  deleteAlias(aliasId: string): Promise<DeleteAdminTaxonomyAliasResponse>;
  listObservations(
    query?: AdminTaxonomyObservationListQuery,
  ): Promise<AdminTaxonomyObservationListResponse>;
  getObservation(observationId: string): Promise<AdminTaxonomyObservation>;
  mapObservation(
    observationId: string,
    body: MapAdminTaxonomyObservationRequest,
  ): Promise<MapAdminTaxonomyObservationResponse>;
  ignoreObservation(
    observationId: string,
    body?: IgnoreAdminTaxonomyObservationRequest,
  ): Promise<AdminTaxonomyObservation>;
  reopenObservation(observationId: string): Promise<AdminTaxonomyObservation>;
};

export function createAdminTaxonomyResource(
  transport: Transport,
): AdminTaxonomyResource {
  return {
    listCategories(query) {
      const parsedQuery = adminTaxonomyCategoryListQuerySchema.parse(
        query ?? {},
      );
      return transport.request({
        method: 'GET',
        path: '/admin/catalog/taxonomy/categories',
        query: parsedQuery,
        schema: adminTaxonomyCategoryListResponseSchema,
      });
    },
    getTree() {
      return transport.request({
        method: 'GET',
        path: '/admin/catalog/taxonomy/tree',
        schema: adminTaxonomyCategoryTreeListResponseSchema,
      });
    },
    getCategory(categoryId) {
      return transport.request({
        method: 'GET',
        path: '/admin/catalog/taxonomy/categories/:categoryId',
        pathParams: { categoryId },
        schema: adminTaxonomyCategoryDetailResponseSchema,
      });
    },
    getAffectedWork(categoryId) {
      return transport.request({
        method: 'GET',
        path: '/admin/catalog/taxonomy/categories/:categoryId/affected-work',
        pathParams: { categoryId },
        schema: adminTaxonomyCategoryAffectedWorkResponseSchema,
      });
    },
    createCategory(body) {
      return transport.request({
        method: 'POST',
        path: '/admin/catalog/taxonomy/categories',
        body,
        schema: adminTaxonomyCategorySchema,
      });
    },
    updateCategory(categoryId, body) {
      return transport.request({
        method: 'PATCH',
        path: '/admin/catalog/taxonomy/categories/:categoryId',
        pathParams: { categoryId },
        body,
        schema: adminTaxonomyCategorySchema,
      });
    },
    replaceCategory(categoryId, body) {
      return transport.request({
        method: 'POST',
        path: '/admin/catalog/taxonomy/categories/:categoryId/replace',
        pathParams: { categoryId },
        body,
        schema: replaceAdminTaxonomyCategoryResponseSchema,
      });
    },
    deleteCategory(categoryId) {
      return transport.request({
        method: 'DELETE',
        path: '/admin/catalog/taxonomy/categories/:categoryId',
        pathParams: { categoryId },
        schema: deleteAdminTaxonomyCategoryResponseSchema,
      });
    },
    upsertCategoryTranslation(categoryId, locale, body) {
      const parsedBody =
        upsertAdminTaxonomyCategoryTranslationRequestSchema.parse(body);
      return transport.request({
        method: 'PUT',
        path: '/admin/catalog/taxonomy/categories/:categoryId/translations/:locale',
        pathParams: { categoryId, locale },
        body: parsedBody,
        schema: adminTaxonomyCategoryTranslationResponseSchema,
      });
    },
    deleteCategoryTranslation(categoryId, locale) {
      return transport.request({
        method: 'DELETE',
        path: '/admin/catalog/taxonomy/categories/:categoryId/translations/:locale',
        pathParams: { categoryId, locale },
        schema: deleteAdminTaxonomyCategoryTranslationResponseSchema,
      });
    },
    listAliases(query) {
      const parsedQuery = adminTaxonomyAliasListQuerySchema.parse(query ?? {});
      return transport.request({
        method: 'GET',
        path: '/admin/catalog/taxonomy/aliases',
        query: parsedQuery,
        schema: adminTaxonomyAliasListResponseSchema,
      });
    },
    createAlias(body) {
      const parsedBody = createAdminTaxonomyAliasRequestSchema.parse(body);
      return transport.request({
        method: 'POST',
        path: '/admin/catalog/taxonomy/aliases',
        body: parsedBody,
        schema: adminTaxonomyAliasSchema,
      });
    },
    updateAlias(aliasId, body) {
      const parsedBody = updateAdminTaxonomyAliasRequestSchema.parse(body);
      return transport.request({
        method: 'PATCH',
        path: '/admin/catalog/taxonomy/aliases/:aliasId',
        pathParams: { aliasId },
        body: parsedBody,
        schema: adminTaxonomyAliasSchema,
      });
    },
    getAliasAffectedWork(aliasId) {
      return transport.request({
        method: 'GET',
        path: '/admin/catalog/taxonomy/aliases/:aliasId/affected-work',
        pathParams: { aliasId },
        schema: adminTaxonomyAliasAffectedWorkResponseSchema,
      });
    },
    deleteAlias(aliasId) {
      return transport.request({
        method: 'DELETE',
        path: '/admin/catalog/taxonomy/aliases/:aliasId',
        pathParams: { aliasId },
        schema: deleteAdminTaxonomyAliasResponseSchema,
      });
    },
    listObservations(query) {
      const parsedQuery = adminTaxonomyObservationListQuerySchema.parse(
        query ?? {},
      );
      return transport.request({
        method: 'GET',
        path: '/admin/catalog/taxonomy/observations',
        query: parsedQuery,
        schema: adminTaxonomyObservationListResponseSchema,
      });
    },
    getObservation(observationId) {
      return transport.request({
        method: 'GET',
        path: '/admin/catalog/taxonomy/observations/:observationId',
        pathParams: { observationId },
        schema: adminTaxonomyObservationSchema,
      });
    },
    mapObservation(observationId, body) {
      const parsedBody = mapAdminTaxonomyObservationRequestSchema.parse(body);
      return transport.request({
        method: 'POST',
        path: '/admin/catalog/taxonomy/observations/:observationId/map',
        pathParams: { observationId },
        body: parsedBody,
        schema: mapAdminTaxonomyObservationResponseSchema,
      });
    },
    ignoreObservation(observationId, body) {
      const parsedBody = ignoreAdminTaxonomyObservationRequestSchema.parse(
        body ?? {},
      );
      return transport.request({
        method: 'POST',
        path: '/admin/catalog/taxonomy/observations/:observationId/ignore',
        pathParams: { observationId },
        body: parsedBody,
        schema: adminTaxonomyObservationSchema,
      });
    },
    reopenObservation(observationId) {
      return transport.request({
        method: 'POST',
        path: '/admin/catalog/taxonomy/observations/:observationId/reopen',
        pathParams: { observationId },
        schema: adminTaxonomyObservationSchema,
      });
    },
  };
}
