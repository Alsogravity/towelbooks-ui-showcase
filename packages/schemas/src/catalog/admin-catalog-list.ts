import { z } from 'zod';

/**
 * Canonical admin catalog list sort values, shared verbatim by the API DTO,
 * the URL query contract (ATable header buttons write `<sortKey>_<dir>` into
 * the `sort` param), the catalog list loader, and the sort select options.
 * `updatedAt_desc` is the default and preserves the historical implicit
 * ordering (most recently updated first, id ascending as the deterministic
 * tiebreaker).
 */
export const catalogWorkAdminSortSchema = z.enum([
  'updatedAt_desc',
  'updatedAt_asc',
  'createdAt_desc',
  'createdAt_asc',
  'title_asc',
  'title_desc',
  'editionCount_desc',
  'editionCount_asc',
]);

export type CatalogWorkAdminSort = z.infer<typeof catalogWorkAdminSortSchema>;

export const catalogWorkAdminSortValues = catalogWorkAdminSortSchema.options;

export const CATALOG_WORK_ADMIN_DEFAULT_SORT = 'updatedAt_desc' as const;

/**
 * Small per-item descriptor explaining why the item matched the search query.
 * Only present when a non-empty `q` produced a match signal. The value is a
 * single safe string (matched identifier, canonical ISBN-13, normalized OLID,
 * matched contributor/edition name, or the query itself) — never a raw
 * provider payload.
 */
export const adminCatalogItemMatchContextSchema = z.object({
  kind: z.enum([
    'id',
    'isbn',
    'provider_id',
    'title',
    'original_title',
    'subtitle',
    'contributor',
    'edition_title',
  ]),
  value: z.string().min(1),
});

export type AdminCatalogItemMatchContext = z.infer<
  typeof adminCatalogItemMatchContextSchema
>;

export const adminCatalogItemMatchContextKindValues =
  adminCatalogItemMatchContextSchema.shape.kind.options;

/** Maximum length of the unified catalog search query. */
export const ADMIN_CATALOG_SEARCH_QUERY_MAX_LENGTH = 100;

/**
 * Server-authoritative admin catalog list query contract. `q` is the unified
 * operational search (internal ID, edition ISBN, provider identifier, or
 * free text across title/original title/subtitle/contributors/edition titles);
 * the server classifies the query — clients never branch on query shape.
 */
export const adminCatalogItemListQuerySchema = z.object({
  q: z.string().trim().max(ADMIN_CATALOG_SEARCH_QUERY_MAX_LENGTH).optional(),
  listingStatus: z.enum(['all', 'listed', 'hidden', 'under_review']).optional(),
  lifecycle: z.enum(['all', 'active', 'archived']).optional(),
  sort: catalogWorkAdminSortSchema.optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(100).optional(),
});

export type AdminCatalogItemListQuery = z.infer<
  typeof adminCatalogItemListQuerySchema
>;

/** Placeholder for the catalog list search input. */
export const ADMIN_CATALOG_SEARCH_PLACEHOLDER =
  'Search title, contributor, ISBN, item ID, or provider ID';
