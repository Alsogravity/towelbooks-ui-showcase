import {
  collectionItemLookupQuerySchema,
  collectionItemLookupResponseSchema,
  collectionItemSchema,
  collectionSchema,
  createCollectionRequestSchema,
  createCollectionItemRequestSchema,
  paginatedCollectionItemsResponseSchema,
  paginatedCollectionsResponseSchema,
  paginatedProfileCollectionsResponseSchema,
  paginatedPublicCollectionItemsResponseSchema,
  publicCollectionDetailSchema,
  updateCollectionItemRequestSchema,
  updateCollectionRequestSchema,
  type Collection,
  type CollectionItem,
  type CollectionItemLookupQuery,
  type CollectionItemLookupResponse,
  type CreateCollectionRequest,
  type CreateCollectionItemRequest,
  type PaginatedCollectionItemsResponse,
  type PaginatedCollectionsResponse,
  type PaginatedProfileCollectionsResponse,
  type PaginatedPublicCollectionItemsResponse,
  type PublicCollectionDetail,
  type UpdateCollectionItemRequest,
  type UpdateCollectionRequest,
} from '@towelbooks/schemas';

import type { Transport } from '../transport.js';

export type CollectionsResource = {
  list(query?: {
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedCollectionsResponse>;
  listProfileCollections(
    username: string,
    query?: { page?: number; pageSize?: number },
  ): Promise<PaginatedProfileCollectionsResponse>;
  get(collectionId: string): Promise<PublicCollectionDetail>;
  listPublicItems(
    collectionId: string,
    query?: { page?: number; pageSize?: number },
  ): Promise<PaginatedPublicCollectionItemsResponse>;
  create(body: CreateCollectionRequest): Promise<Collection>;
  update(
    collectionId: string,
    body: UpdateCollectionRequest,
  ): Promise<Collection>;
  remove(collectionId: string): Promise<void>;
  listItems(
    collectionId: string,
    query?: { page?: number; pageSize?: number },
  ): Promise<PaginatedCollectionItemsResponse>;
  lookupItem(
    collectionId: string,
    query: CollectionItemLookupQuery,
  ): Promise<CollectionItemLookupResponse>;
  addItem(
    collectionId: string,
    body: CreateCollectionItemRequest,
  ): Promise<CollectionItem>;
  updateItem(
    collectionId: string,
    collectionItemId: string,
    body: UpdateCollectionItemRequest,
  ): Promise<CollectionItem>;
  removeItem(collectionId: string, collectionItemId: string): Promise<void>;
};

export function createCollectionsResource(
  transport: Transport,
): CollectionsResource {
  return {
    list(query = {}) {
      return transport.request({
        method: 'GET',
        path: '/me/collections',
        query,
        schema: paginatedCollectionsResponseSchema,
      });
    },
    listProfileCollections(username, query = {}) {
      return transport.request({
        method: 'GET',
        path: `/profiles/${encodeURIComponent(username)}/collections`,
        query,
        schema: paginatedProfileCollectionsResponseSchema,
      });
    },
    get(collectionId) {
      return transport.request({
        method: 'GET',
        path: '/collections/:collectionId',
        pathParams: { collectionId },
        schema: publicCollectionDetailSchema,
      });
    },
    listPublicItems(collectionId, query = {}) {
      return transport.request({
        method: 'GET',
        path: '/collections/:collectionId/items',
        pathParams: { collectionId },
        query,
        schema: paginatedPublicCollectionItemsResponseSchema,
      });
    },
    create(body) {
      return transport.request({
        method: 'POST',
        path: '/me/collections',
        body: createCollectionRequestSchema.parse(body),
        schema: collectionSchema,
      });
    },
    update(collectionId, body) {
      return transport.request({
        method: 'PATCH',
        path: '/me/collections/:collectionId',
        pathParams: { collectionId },
        body: updateCollectionRequestSchema.parse(body),
        schema: collectionSchema,
      });
    },
    remove(collectionId) {
      return transport.requestVoid({
        method: 'DELETE',
        path: '/me/collections/:collectionId',
        pathParams: { collectionId },
      });
    },
    listItems(collectionId, query = {}) {
      return transport.request({
        method: 'GET',
        path: '/me/collections/:collectionId/items',
        pathParams: { collectionId },
        query,
        schema: paginatedCollectionItemsResponseSchema,
      });
    },
    lookupItem(collectionId, query) {
      return transport.request({
        method: 'GET',
        path: '/me/collections/:collectionId/items/lookup',
        pathParams: { collectionId },
        query: collectionItemLookupQuerySchema.parse(query),
        schema: collectionItemLookupResponseSchema,
      });
    },
    addItem(collectionId, body) {
      return transport.request({
        method: 'POST',
        path: '/me/collections/:collectionId/items',
        pathParams: { collectionId },
        body: createCollectionItemRequestSchema.parse(body),
        schema: collectionItemSchema,
      });
    },
    updateItem(collectionId, collectionItemId, body) {
      return transport.request({
        method: 'PATCH',
        path: '/me/collections/:collectionId/items/:collectionItemId',
        pathParams: { collectionId, collectionItemId },
        body: updateCollectionItemRequestSchema.parse(body),
        schema: collectionItemSchema,
      });
    },
    removeItem(collectionId, collectionItemId) {
      return transport.requestVoid({
        method: 'DELETE',
        path: '/me/collections/:collectionId/items/:collectionItemId',
        pathParams: { collectionId, collectionItemId },
      });
    },
  };
}
