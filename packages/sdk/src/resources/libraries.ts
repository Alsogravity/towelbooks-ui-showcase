import {
  createLibraryItemRequestSchema,
  createLibraryItemOwnershipRequestSchema,
  createLibraryItemReadingNoteRequestSchema,
  createLibraryItemReadingSessionRequestSchema,
  createLibraryRequestSchema,
  deleteLibraryItemReadingSessionQuerySchema,
  libraryItemFacetsResponseSchema,
  libraryItemDetailSchema,
  libraryItemSchema,
  libraryItemReadingNoteSchema,
  libraryItemReadingNotesQuerySchema,
  libraryItemReadingSessionSchema,
  myLibraryItemLookupResponseSchema,
  libraryDetailSchema,
  librarySchema,
  paginatedLibraryItemsResponseSchema,
  paginatedLibraryItemReadingNotesResponseSchema,
  paginatedLibrariesResponseSchema,
  updateLibraryItemRequestSchema,
  updateLibraryItemOwnershipRequestSchema,
  updateLibraryItemReadingNoteRequestSchema,
  updateLibraryItemReadingSessionRequestSchema,
  updateLibraryRequestSchema,
  type CreateLibraryItemRequest,
  type CreateLibraryItemOwnershipRequest,
  type CreateLibraryItemReadingNoteRequest,
  type CreateLibraryItemReadingSessionRequest,
  type CreateLibraryRequest,
  type Library,
  type LibraryDetail,
  type LibraryItem,
  type LibraryItemDetail,
  type LibraryItemReadingSession,
  type LibraryItemReadingNote,
  type LibraryItemReadingNotesQuery,
  type LibraryItemFacetsResponse,
  type LibraryItemsQuery,
  type MyLibraryItemLookupQuery,
  type MyLibraryItemLookupResponse,
  type PaginatedLibraryItemsResponse,
  type PaginatedLibraryItemReadingNotesResponse,
  type PaginatedLibrariesResponse,
  type UpdateLibraryItemRequest,
  type UpdateLibraryItemOwnershipRequest,
  type UpdateLibraryItemReadingNoteRequest,
  type UpdateLibraryItemReadingSessionRequest,
  type UpdateLibraryRequest,
} from '@towelbooks/schemas';

import type { Transport } from '../transport.js';

export type LibrariesResource = {
  list(query?: {
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedLibrariesResponse>;
  getMyLibrary(): Promise<Library>;
  lookupMyLibraryItem(
    query: MyLibraryItemLookupQuery,
  ): Promise<MyLibraryItemLookupResponse>;
  get(libraryId: string): Promise<LibraryDetail>;
  create(body: CreateLibraryRequest): Promise<Library>;
  update(libraryId: string, body: UpdateLibraryRequest): Promise<Library>;
  listItems(
    libraryId: string,
    query?: LibraryItemsQuery,
  ): Promise<PaginatedLibraryItemsResponse>;
  getItemFacets(libraryId: string): Promise<LibraryItemFacetsResponse>;
  addItem(
    libraryId: string,
    body: CreateLibraryItemRequest,
  ): Promise<LibraryItem>;
  getItem(libraryId: string, libraryItemId: string): Promise<LibraryItemDetail>;
  updateItem(
    libraryId: string,
    libraryItemId: string,
    body: UpdateLibraryItemRequest,
  ): Promise<LibraryItem>;
  removeItem(libraryId: string, libraryItemId: string): Promise<void>;
  createItemOwnership(
    libraryId: string,
    libraryItemId: string,
    body: CreateLibraryItemOwnershipRequest,
  ): Promise<LibraryItem['ownerships'][number]>;
  updateItemOwnership(
    libraryId: string,
    libraryItemId: string,
    ownershipId: string,
    body: UpdateLibraryItemOwnershipRequest,
  ): Promise<LibraryItem['ownerships'][number]>;
  removeItemOwnership(
    libraryId: string,
    libraryItemId: string,
    ownershipId: string,
  ): Promise<void>;
  createItemReadingSession(
    libraryId: string,
    libraryItemId: string,
    body: CreateLibraryItemReadingSessionRequest,
  ): Promise<LibraryItemReadingSession>;
  listItemReadingSessions(
    libraryId: string,
    libraryItemId: string,
  ): Promise<LibraryItemReadingSession[]>;
  getItemReadingSession(
    libraryId: string,
    libraryItemId: string,
    sessionId: string,
  ): Promise<LibraryItemReadingSession>;
  updateItemReadingSession(
    libraryId: string,
    libraryItemId: string,
    sessionId: string,
    body: UpdateLibraryItemReadingSessionRequest,
  ): Promise<LibraryItemReadingSession>;
  removeItemReadingSession(
    libraryId: string,
    libraryItemId: string,
    sessionId: string,
    version: number,
  ): Promise<void>;
  createItemReadingNote(
    libraryId: string,
    libraryItemId: string,
    sessionId: string,
    body: CreateLibraryItemReadingNoteRequest,
  ): Promise<LibraryItemReadingNote>;
  listItemReadingNotes(
    libraryId: string,
    libraryItemId: string,
    sessionId: string,
    query?: LibraryItemReadingNotesQuery,
  ): Promise<PaginatedLibraryItemReadingNotesResponse>;
  updateItemReadingNote(
    libraryId: string,
    libraryItemId: string,
    sessionId: string,
    noteId: string,
    body: UpdateLibraryItemReadingNoteRequest,
  ): Promise<LibraryItemReadingNote>;
  removeItemReadingNote(
    libraryId: string,
    libraryItemId: string,
    sessionId: string,
    noteId: string,
  ): Promise<void>;
};

export function createLibrariesResource(
  transport: Transport,
): LibrariesResource {
  return {
    list(query = {}) {
      return transport.request({
        method: 'GET',
        path: '/libraries',
        query,
        schema: paginatedLibrariesResponseSchema,
      });
    },
    getMyLibrary() {
      return transport.request({
        method: 'GET',
        path: '/libraries/my-library',
        schema: librarySchema,
      });
    },
    lookupMyLibraryItem(query) {
      return transport.request({
        method: 'GET',
        path: '/libraries/my-library/items/lookup',
        query,
        schema: myLibraryItemLookupResponseSchema,
      });
    },
    get(libraryId) {
      return transport.request({
        method: 'GET',
        path: '/libraries/:libraryId',
        pathParams: { libraryId },
        schema: libraryDetailSchema,
      });
    },
    create(body) {
      return transport.request({
        method: 'POST',
        path: '/libraries',
        body: createLibraryRequestSchema.parse(body),
        schema: librarySchema,
      });
    },
    update(libraryId, body) {
      return transport.request({
        method: 'PATCH',
        path: '/libraries/:libraryId',
        pathParams: { libraryId },
        body: updateLibraryRequestSchema.parse(body),
        schema: librarySchema,
      });
    },
    listItems(libraryId, query = {}) {
      return transport.request({
        method: 'GET',
        path: '/libraries/:libraryId/items',
        pathParams: { libraryId },
        query,
        schema: paginatedLibraryItemsResponseSchema,
      });
    },
    getItemFacets(libraryId) {
      return transport.request({
        method: 'GET',
        path: '/libraries/:libraryId/items/facets',
        pathParams: { libraryId },
        schema: libraryItemFacetsResponseSchema,
      });
    },
    addItem(libraryId, body) {
      return transport.request({
        method: 'POST',
        path: '/libraries/:libraryId/items',
        pathParams: { libraryId },
        body: createLibraryItemRequestSchema.parse(body),
        schema: libraryItemSchema,
      });
    },
    getItem(libraryId, libraryItemId) {
      return transport.request({
        method: 'GET',
        path: '/libraries/:libraryId/items/:libraryItemId',
        pathParams: { libraryId, libraryItemId },
        schema: libraryItemDetailSchema,
      });
    },
    updateItem(libraryId, libraryItemId, body) {
      return transport.request({
        method: 'PATCH',
        path: '/libraries/:libraryId/items/:libraryItemId',
        pathParams: { libraryId, libraryItemId },
        body: updateLibraryItemRequestSchema.parse(body),
        schema: libraryItemSchema,
      });
    },
    removeItem(libraryId, libraryItemId) {
      return transport.requestVoid({
        method: 'DELETE',
        path: '/libraries/:libraryId/items/:libraryItemId',
        pathParams: { libraryId, libraryItemId },
      });
    },
    createItemOwnership(libraryId, libraryItemId, body) {
      return transport.request({
        method: 'POST',
        path: '/libraries/:libraryId/items/:libraryItemId/ownerships',
        pathParams: { libraryId, libraryItemId },
        body: createLibraryItemOwnershipRequestSchema.parse(body),
        schema: libraryItemSchema.shape.ownerships.element,
      });
    },
    updateItemOwnership(libraryId, libraryItemId, ownershipId, body) {
      return transport.request({
        method: 'PATCH',
        path: '/libraries/:libraryId/items/:libraryItemId/ownerships/:ownershipId',
        pathParams: { libraryId, libraryItemId, ownershipId },
        body: updateLibraryItemOwnershipRequestSchema.parse(body),
        schema: libraryItemSchema.shape.ownerships.element,
      });
    },
    removeItemOwnership(libraryId, libraryItemId, ownershipId) {
      return transport.requestVoid({
        method: 'DELETE',
        path: '/libraries/:libraryId/items/:libraryItemId/ownerships/:ownershipId',
        pathParams: { libraryId, libraryItemId, ownershipId },
      });
    },
    createItemReadingSession(libraryId, libraryItemId, body) {
      return transport.request({
        method: 'POST',
        path: '/libraries/:libraryId/items/:itemId/reading-sessions',
        pathParams: { itemId: libraryItemId, libraryId },
        body: createLibraryItemReadingSessionRequestSchema.parse(body),
        schema: libraryItemReadingSessionSchema,
      });
    },
    listItemReadingSessions(libraryId, libraryItemId) {
      return transport.request({
        method: 'GET',
        path: '/libraries/:libraryId/items/:itemId/reading-sessions',
        pathParams: { itemId: libraryItemId, libraryId },
        schema: libraryItemReadingSessionSchema.array(),
      });
    },
    getItemReadingSession(libraryId, libraryItemId, sessionId) {
      return transport.request({
        method: 'GET',
        path: '/libraries/:libraryId/items/:itemId/reading-sessions/:sessionId',
        pathParams: { itemId: libraryItemId, libraryId, sessionId },
        schema: libraryItemReadingSessionSchema,
      });
    },
    updateItemReadingSession(libraryId, libraryItemId, sessionId, body) {
      return transport.request({
        method: 'PATCH',
        path: '/libraries/:libraryId/items/:itemId/reading-sessions/:sessionId',
        pathParams: { itemId: libraryItemId, libraryId, sessionId },
        body: updateLibraryItemReadingSessionRequestSchema.parse(body),
        schema: libraryItemReadingSessionSchema,
      });
    },
    removeItemReadingSession(libraryId, libraryItemId, sessionId, version) {
      const query = deleteLibraryItemReadingSessionQuerySchema.parse({
        version,
      });
      return transport.requestVoid({
        method: 'DELETE',
        path: '/libraries/:libraryId/items/:itemId/reading-sessions/:sessionId',
        pathParams: { itemId: libraryItemId, libraryId, sessionId },
        query,
      });
    },
    createItemReadingNote(libraryId, libraryItemId, sessionId, body) {
      return transport.request({
        method: 'POST',
        path: '/libraries/:libraryId/items/:itemId/reading-sessions/:sessionId/notes',
        pathParams: { itemId: libraryItemId, libraryId, sessionId },
        body: createLibraryItemReadingNoteRequestSchema.parse(body),
        schema: libraryItemReadingNoteSchema,
      });
    },
    listItemReadingNotes(libraryId, libraryItemId, sessionId, query = {}) {
      return transport.request({
        method: 'GET',
        path: '/libraries/:libraryId/items/:itemId/reading-sessions/:sessionId/notes',
        pathParams: { itemId: libraryItemId, libraryId, sessionId },
        query: libraryItemReadingNotesQuerySchema.parse(query),
        schema: paginatedLibraryItemReadingNotesResponseSchema,
      });
    },
    updateItemReadingNote(libraryId, libraryItemId, sessionId, noteId, body) {
      return transport.request({
        method: 'PATCH',
        path: '/libraries/:libraryId/items/:itemId/reading-sessions/:sessionId/notes/:noteId',
        pathParams: { itemId: libraryItemId, libraryId, noteId, sessionId },
        body: updateLibraryItemReadingNoteRequestSchema.parse(body),
        schema: libraryItemReadingNoteSchema,
      });
    },
    removeItemReadingNote(libraryId, libraryItemId, sessionId, noteId) {
      return transport.requestVoid({
        method: 'DELETE',
        path: '/libraries/:libraryId/items/:itemId/reading-sessions/:sessionId/notes/:noteId',
        pathParams: { itemId: libraryItemId, libraryId, noteId, sessionId },
      });
    },
  };
}
