import { utcDateTimeStringSchema } from '../common/utc-datetime.js';
import { z } from 'zod';

import { catalogPurchaseLinkSchema } from '../catalog/search.js';
import { catalogLanguageTagSchema } from '../catalog/language.js';
import { catalogWorkProjectionSchema } from '../catalog/work-projection.js';
import { dateOnlyStringSchema } from '../common/date-only.js';
import {
  libraryItemAcquisitionSourceSchema,
  libraryItemDigitalPlatformSchema,
  libraryItemOwnershipFormatSchema,
  libraryItemPhysicalConditionSchema,
  libraryItemReadingStatusSchema,
  catalogSourceProviderSchema,
} from '../enums.js';
import { catalogWorkTypeSchema } from '../enums/catalog-work.js';

const libraryItemDateOnlySchema = dateOnlyStringSchema;

export const LIBRARY_ITEM_PERSONAL_NOTE_MAX_LENGTH = 10_000;
export const LIBRARY_ITEM_OWNERSHIPS_MAX_COUNT = 20;
export const LIBRARY_ITEM_OWNERSHIP_NOTE_MAX_LENGTH = 2_000;

export const libraryCatalogEditionSchema = z.object({
  purchaseLink: catalogPurchaseLinkSchema.nullable(),
  asin: z.string().nullable().optional(),
  id: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().nullable(),
  synopsis: z.string().nullable(),
  language: catalogLanguageTagSchema.nullable(),
  publisher: z.string().nullable(),
  imprint: z.string().nullable(),
  isbn10: z.string().nullable(),
  isbn13: z.string().nullable(),
  editionNumber: z.string().max(80).nullable(),
  publishedDate: utcDateTimeStringSchema.nullable(),
  seriesOrCollection: z.string().max(240).nullable(),
  pageCount: z.number().int().nonnegative().nullable(),
  volume: z.string().max(80).nullable(),
  verificationStatus: z.enum([
    'unverified',
    'provider_matched',
    'manually_verified',
  ]),
  coverUrl: z.string().nullable(),
  coverThumbnailUrl: z.string().nullable(),
  source: catalogSourceProviderSchema,
  sourceId: z.string().min(1).nullable(),
  sourceUrl: z.string().nullable(),
});

export type LibraryCatalogEdition = z.infer<typeof libraryCatalogEditionSchema>;

export const libraryItemOwnershipSchema = z.object({
  id: z.string().min(1),
  libraryItemId: z.string().min(1),
  format: libraryItemOwnershipFormatSchema,
  acquiredAt: libraryItemDateOnlySchema.nullable(),
  source: libraryItemAcquisitionSourceSchema.nullable(),
  condition: libraryItemPhysicalConditionSchema.nullable(),
  platform: libraryItemDigitalPlatformSchema.nullable(),
  note: z.string().max(LIBRARY_ITEM_OWNERSHIP_NOTE_MAX_LENGTH).nullable(),
  createdAt: utcDateTimeStringSchema,
  updatedAt: utcDateTimeStringSchema,
});

export type LibraryItemOwnership = z.infer<typeof libraryItemOwnershipSchema>;

/** Structurally reusable, but current product scope only allows book items to write ownership metadata. */
export const libraryItemOwnershipInputSchema = z.object({
  format: libraryItemOwnershipFormatSchema,
  acquiredAt: libraryItemDateOnlySchema.nullable().optional(),
  source: libraryItemAcquisitionSourceSchema.nullable().optional(),
  condition: libraryItemPhysicalConditionSchema.nullable().optional(),
  platform: libraryItemDigitalPlatformSchema.nullable().optional(),
  note: z
    .string()
    .trim()
    .max(LIBRARY_ITEM_OWNERSHIP_NOTE_MAX_LENGTH)
    .nullable()
    .optional(),
});

export type LibraryItemOwnershipInput = z.infer<
  typeof libraryItemOwnershipInputSchema
>;

export const createLibraryItemOwnershipRequestSchema =
  libraryItemOwnershipInputSchema;
export type CreateLibraryItemOwnershipRequest = z.infer<
  typeof createLibraryItemOwnershipRequestSchema
>;

export const updateLibraryItemOwnershipRequestSchema = z.object({
  acquiredAt: libraryItemDateOnlySchema.nullable().optional(),
  source: libraryItemAcquisitionSourceSchema.nullable().optional(),
  condition: libraryItemPhysicalConditionSchema.nullable().optional(),
  platform: libraryItemDigitalPlatformSchema.nullable().optional(),
  note: z
    .string()
    .trim()
    .max(LIBRARY_ITEM_OWNERSHIP_NOTE_MAX_LENGTH)
    .nullable()
    .optional(),
  format: libraryItemOwnershipFormatSchema.optional(),
});
export type UpdateLibraryItemOwnershipRequest = z.infer<
  typeof updateLibraryItemOwnershipRequestSchema
>;

/** A bounded session projection safe for ordinary LibraryItem reads. */
export const libraryItemReadingSessionSummarySchema = z.object({
  id: z.string().uuid(),
  catalogEditionId: z.string().uuid().nullable(),
  status: libraryItemReadingStatusSchema,
  currentPage: z.number().int().nonnegative().nullable(),
  totalPages: z.number().int().positive().nullable(),
  startedAt: libraryItemDateOnlySchema.nullable(),
  finishedAt: libraryItemDateOnlySchema.nullable(),
  updatedAt: utcDateTimeStringSchema,
});

export type LibraryItemReadingSessionSummary = z.infer<
  typeof libraryItemReadingSessionSummarySchema
>;

export const libraryItemReadingStatusCountsSchema = z.object({
  not_started: z.number().int().nonnegative(),
  reading: z.number().int().nonnegative(),
  paused: z.number().int().nonnegative(),
  read: z.number().int().nonnegative(),
  abandoned: z.number().int().nonnegative(),
});

export type LibraryItemReadingStatusCounts = z.infer<
  typeof libraryItemReadingStatusCountsSchema
>;

export const libraryItemReadingSummarySchema = z.object({
  sessionsCount: z.number().int().nonnegative(),
  completedCount: z.number().int().nonnegative(),
  statusCounts: libraryItemReadingStatusCountsSchema,
  mostRecentlyUpdatedSession: libraryItemReadingSessionSummarySchema.nullable(),
});

export type LibraryItemReadingSummary = z.infer<
  typeof libraryItemReadingSummarySchema
>;

export const libraryItemSchema = z
  .object({
    id: z.string().min(1),
    libraryId: z.string().min(1),
    catalogWorkId: z.string().min(1),
    addedByUserId: z.string().min(1),
    viewerRating: z.number().int().min(1).max(5).nullable(),
    personalNote: z
      .string()
      .max(LIBRARY_ITEM_PERSONAL_NOTE_MAX_LENGTH)
      .nullable(),
    createdAt: utcDateTimeStringSchema,
    updatedAt: utcDateTimeStringSchema,
    removedAt: utcDateTimeStringSchema.nullable(),
    work: catalogWorkProjectionSchema,
    ownerships: z
      .array(libraryItemOwnershipSchema)
      .max(LIBRARY_ITEM_OWNERSHIPS_MAX_COUNT),
    readingSummary: libraryItemReadingSummarySchema,
  })
  .strict();

export type LibraryItem = z.infer<typeof libraryItemSchema>;

/** Reader-safe catalog edition metadata included only on item detail reads. */
export const libraryItemDetailEditionSchema = z
  .object({
    asin: z.string().nullable(),
    contributors: z.array(z.string()),
    editionNumber: z.string().max(80).nullable(),
    id: z.string().min(1),
    imprint: z.string().nullable(),
    isbn10: z.string().nullable(),
    isbn13: z.string().nullable(),
    language: catalogLanguageTagSchema.nullable(),
    pageCount: z.number().int().nonnegative().nullable(),
    publishedDate: utcDateTimeStringSchema.nullable(),
    publisher: z.string().nullable(),
    seriesOrCollection: z.string().max(240).nullable(),
    source: catalogSourceProviderSchema,
    sourceId: z.string().min(1).nullable(),
    subtitle: z.string().nullable(),
    synopsis: z.string().nullable(),
    title: z.string().min(1),
    volume: z.string().max(80).nullable(),
  })
  .strict();

export type LibraryItemDetailEdition = z.infer<
  typeof libraryItemDetailEditionSchema
>;

export const libraryItemDetailWorkSchema = catalogWorkProjectionSchema
  .extend({
    catalogEditions: z.array(libraryItemDetailEditionSchema),
  })
  .strict();

export type LibraryItemDetailWork = z.infer<typeof libraryItemDetailWorkSchema>;

/** Full reader-safe projection used by the canonical library item detail page. */
export const libraryItemDetailSchema = libraryItemSchema
  .extend({ work: libraryItemDetailWorkSchema })
  .strict();

export type LibraryItemDetail = z.infer<typeof libraryItemDetailSchema>;

export const paginatedLibraryItemsResponseSchema = z.object({
  items: z.array(libraryItemSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

export type PaginatedLibraryItemsResponse = z.infer<
  typeof paginatedLibraryItemsResponseSchema
>;

export const libraryItemSortSchema = z.enum([
  'recently_added',
  'recently_updated',
  'title',
]);
export type LibraryItemSort = z.infer<typeof libraryItemSortSchema>;

export const LIBRARY_ITEMS_SEARCH_MAX_LENGTH = 100;

/** Statuses exposed in library list filters and facet counts. */
export const libraryItemFilterableStatusSchema = libraryItemReadingStatusSchema;
export type LibraryItemFilterableStatus = z.infer<
  typeof libraryItemFilterableStatusSchema
>;

/** Catalog-work kinds exposed in library list filters and facet counts. */
export const libraryItemFilterableKindSchema = catalogWorkTypeSchema;
export type LibraryItemFilterableKind = z.infer<
  typeof libraryItemFilterableKindSchema
>;

export const LIBRARY_ITEM_FILTERABLE_STATUS_VALUES = [
  ...libraryItemFilterableStatusSchema.options,
] as const;

export const LIBRARY_ITEM_FILTERABLE_KIND_VALUES = [
  ...libraryItemFilterableKindSchema.options,
] as const;

function buildLibraryItemFacetCountsSchema<
  const TKeys extends readonly string[],
>(keys: TKeys) {
  return z.object(
    Object.fromEntries(
      keys.map((key) => [key, z.number().int().nonnegative()]),
    ) as { [K in TKeys[number]]: z.ZodNumber },
  );
}

export const libraryItemFacetStatusCountsSchema =
  buildLibraryItemFacetCountsSchema(libraryItemFilterableStatusSchema.options);

export type LibraryItemFacetStatusCounts = z.infer<
  typeof libraryItemFacetStatusCountsSchema
>;

export const libraryItemFacetKindCountsSchema =
  buildLibraryItemFacetCountsSchema(libraryItemFilterableKindSchema.options);

export type LibraryItemFacetKindCounts = z.infer<
  typeof libraryItemFacetKindCountsSchema
>;

export const libraryItemsQuerySchema = z.object({
  kinds: z.array(libraryItemFilterableKindSchema).optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().optional(),
  sort: libraryItemSortSchema.optional(),
  search: z
    .string()
    .trim()
    .min(1)
    .max(LIBRARY_ITEMS_SEARCH_MAX_LENGTH)
    .optional(),
  statuses: z.array(libraryItemFilterableStatusSchema).optional(),
});
export type LibraryItemsQuery = z.infer<typeof libraryItemsQuerySchema>;

export const libraryItemFacetsResponseSchema = z.object({
  statuses: libraryItemFacetStatusCountsSchema,
  kinds: libraryItemFacetKindCountsSchema,
  total: z.number().int().nonnegative(),
});

export type LibraryItemFacetsResponse = z.infer<
  typeof libraryItemFacetsResponseSchema
>;

export const myLibraryItemLookupQuerySchema = z
  .object({
    catalogWorkId: z.string().uuid(),
  })
  .strict();
export type MyLibraryItemLookupQuery = z.infer<
  typeof myLibraryItemLookupQuerySchema
>;

export const myLibraryItemLookupResponseSchema = z.object({
  libraryId: z.string().min(1),
  item: libraryItemSchema.nullable(),
});
export type MyLibraryItemLookupResponse = z.infer<
  typeof myLibraryItemLookupResponseSchema
>;

export const createLibraryItemRequestSchema = z
  .object({
    catalogWorkId: z.string().uuid(),
    // Semantic rule: ownership writes are book-only even though the shape itself is reusable.
    ownerships: z
      .array(libraryItemOwnershipInputSchema)
      .max(LIBRARY_ITEM_OWNERSHIPS_MAX_COUNT)
      .optional(),
  })
  .strict();

export type CreateLibraryItemRequest = z.infer<
  typeof createLibraryItemRequestSchema
>;

export const updateLibraryItemRequestSchema = z
  .object({
    personalNote: z
      .string()
      .max(LIBRARY_ITEM_PERSONAL_NOTE_MAX_LENGTH)
      .nullable()
      .optional(),
  })
  .strict();

export type UpdateLibraryItemRequest = z.infer<
  typeof updateLibraryItemRequestSchema
>;
