import { z } from 'zod';

import { offsetPaginatedResponseSchema } from '../common/pagination.js';
import {
  categoryAliasScopeSchema,
  unmatchedCategoryLabelStatusSchema,
} from '../catalog/taxonomy.js';
import { catalogSourceProviderSchema } from '../enums/catalog-work.js';

export const ADMIN_TAXONOMY_OBSERVATION_CURSOR_MAX_LENGTH = 512;
export const ADMIN_TAXONOMY_OBSERVATION_ACTIVE_SINCE_MAX_LENGTH = 64;

const isoDateOrDateTimeSchema = z.union([
  z.string().date(),
  z.string().datetime({ offset: true }),
]);

/**
 * Admin catalog taxonomy curation shared contract (epic #693, child #704).
 *
 * The single shared zod contract for the final alias and unmatched-label
 * curation surface under `/v1/admin/catalog/taxonomy/*`
 * (docs/architecture/catalog-taxonomy.md §5/§9/§11). The NestJS DTOs mirror
 * these shapes and the SDK is typed by them, so the wire contract stays in
 * lockstep.
 *
 * Rules encoded here:
 * - every schema is a strict allowlist (no unknown keys, no raw provider
 *   payloads, no review notes on the audit wire);
 * - scope/provider cross-field rules: a provider-scoped alias requires its
 *   source provider, a global alias forbids it (contract §5);
 * - the observation list defaults to the `open` queue status and stays
 *   keyset-paginated with a bounded page size (contract §9);
 * - alias responses carry the mapped category's slug and display name;
 *   observation responses carry the mapped category and reviewer context.
 */

export const adminTaxonomyAliasSchema = z
  .object({
    id: z.string(),
    label: z.string(),
    normalizedLabel: z.string(),
    scope: categoryAliasScopeSchema,
    sourceProvider: catalogSourceProviderSchema.nullable(),
    categoryId: z.string(),
    categorySlug: z.string(),
    categoryDisplayName: z.string(),
    createdAt: z.string(),
  })
  .strict();

export type AdminTaxonomyAlias = z.infer<typeof adminTaxonomyAliasSchema>;

export const adminTaxonomyAliasListQuerySchema = z
  .object({
    categoryId: z.string().optional(),
    scope: z.enum(['all', 'global', 'provider']).optional(),
    provider: catalogSourceProviderSchema.optional(),
    /** Case-insensitive substring match on the label or normalized label. */
    q: z.string().max(100).optional(),
    page: z.number().int().positive().optional(),
    pageSize: z.number().int().positive().max(100).optional(),
  })
  .strict();

export type AdminTaxonomyAliasListQuery = z.infer<
  typeof adminTaxonomyAliasListQuerySchema
>;

export const adminTaxonomyAliasListResponseSchema =
  offsetPaginatedResponseSchema(adminTaxonomyAliasSchema);

export type AdminTaxonomyAliasListResponse = z.infer<
  typeof adminTaxonomyAliasListResponseSchema
>;

/**
 * Create alias (contract §5): the label is normalized server-side with
 * `normalizeCategoryAliasLabel` (the stored `normalizedLabel` is never
 * client-supplied). A provider-scoped alias requires `sourceProvider`; a
 * global alias forbids it.
 */
export const createAdminTaxonomyAliasRequestSchema = z
  .object({
    label: z.string().min(1).max(160),
    categoryId: z.string(),
    scope: categoryAliasScopeSchema,
    sourceProvider: catalogSourceProviderSchema.optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.scope === 'provider' && value.sourceProvider === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'scope=provider requires a sourceProvider.',
        path: ['sourceProvider'],
      });
    }
    if (value.scope === 'global' && value.sourceProvider !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'scope=global forbids a sourceProvider.',
        path: ['sourceProvider'],
      });
    }
  });

export type CreateAdminTaxonomyAliasRequest = z.infer<
  typeof createAdminTaxonomyAliasRequestSchema
>;

/**
 * Ordinary alias edit: rename the display label (re-normalized server-side),
 * reassign the category, or change the provider scope. At least one field is
 * required, and scope/provider move together (a scope change must carry the
 * new provider; a provider change must carry the new scope). There is no
 * normalizedLabel key by construction — normalization is server-side only.
 */
export const updateAdminTaxonomyAliasRequestSchema = z
  .object({
    label: z.string().min(1).max(160).optional(),
    categoryId: z.string().optional(),
    scope: categoryAliasScopeSchema.optional(),
    sourceProvider: catalogSourceProviderSchema.optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.scope === 'provider' && value.sourceProvider === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'scope=provider requires a sourceProvider.',
        path: ['sourceProvider'],
      });
    }
    if (value.scope === 'global' && value.sourceProvider !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'scope=global forbids a sourceProvider.',
        path: ['sourceProvider'],
      });
    }
    if (value.sourceProvider !== undefined && value.scope === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Changing the sourceProvider requires a scope change.',
        path: ['scope'],
      });
    }
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one alias field is required.',
  });

export type UpdateAdminTaxonomyAliasRequest = z.infer<
  typeof updateAdminTaxonomyAliasRequestSchema
>;

/** Per-slug aggregate of the assignments an alias change would touch. */
export const adminTaxonomyAliasAffectedWorkBySlugSchema = z
  .object({
    categorySlug: z.string(),
    assignmentCount: z.number().int().nonnegative(),
  })
  .strict();

export type AdminTaxonomyAliasAffectedWorkBySlug = z.infer<
  typeof adminTaxonomyAliasAffectedWorkBySlugSchema
>;

/**
 * Pre-reprocessing inspection for one alias: deterministic counts of the
 * assignments whose introducing source label normalizes (exact §8 SQL
 * normalization) to this alias's normalized label under its provider scope —
 * counts and per-slug aggregates only, never work lists.
 */
export const adminTaxonomyAliasAffectedWorkResponseSchema = z
  .object({
    alias: adminTaxonomyAliasSchema,
    counts: z
      .object({
        assignmentCount: z.number().int().nonnegative(),
        workCount: z.number().int().nonnegative(),
        primaryCount: z.number().int().nonnegative(),
        providerManagedCount: z.number().int().nonnegative(),
        editorialCount: z.number().int().nonnegative(),
        userContributedCount: z.number().int().nonnegative(),
      })
      .strict(),
    bySlug: z.array(adminTaxonomyAliasAffectedWorkBySlugSchema),
  })
  .strict();

export type AdminTaxonomyAliasAffectedWorkResponse = z.infer<
  typeof adminTaxonomyAliasAffectedWorkResponseSchema
>;

export const deleteAdminTaxonomyAliasResponseSchema = z
  .object({
    deleted: z.literal(true),
    aliasId: z.string(),
    normalizedLabel: z.string(),
  })
  .strict();

export type DeleteAdminTaxonomyAliasResponse = z.infer<
  typeof deleteAdminTaxonomyAliasResponseSchema
>;

/** One aggregated unmatched provider-label observation (contract §9). */
export const adminTaxonomyObservationSchema = z
  .object({
    id: z.string(),
    provider: catalogSourceProviderSchema,
    representativeLabel: z.string(),
    normalizedLabel: z.string(),
    occurrenceCount: z.number().int().positive(),
    firstSeenAt: z.string(),
    lastSeenAt: z.string(),
    status: unmatchedCategoryLabelStatusSchema,
    sampleCatalogWorkId: z.string().nullable(),
    mappedCategoryId: z.string().nullable(),
    mappedCategorySlug: z.string().nullable(),
    mappedCategoryDisplayName: z.string().nullable(),
    reviewerUserId: z.string().nullable(),
    reviewedAt: z.string().nullable(),
    reviewNote: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .strict();

export type AdminTaxonomyObservation = z.infer<
  typeof adminTaxonomyObservationSchema
>;

export const adminTaxonomyObservationListQuerySchema = z
  .object({
    provider: catalogSourceProviderSchema.optional(),
    /** Defaults to `open`: the curation queue. `all` reads every status. */
    status: z.enum(['open', 'resolved', 'ignored', 'all']).optional(),
    minOccurrenceCount: z.number().int().positive().optional(),
    activeSince: z
      .string()
      .max(ADMIN_TAXONOMY_OBSERVATION_ACTIVE_SINCE_MAX_LENGTH)
      .refine(
        (value) => isoDateOrDateTimeSchema.safeParse(value).success,
        'Expected an ISO-8601 date or an offset datetime.',
      )
      .optional(),
    pageSize: z.number().int().positive().max(100).optional(),
    cursor: z
      .string()
      .max(ADMIN_TAXONOMY_OBSERVATION_CURSOR_MAX_LENGTH)
      .optional(),
  })
  .strict();

export type AdminTaxonomyObservationListQuery = z.infer<
  typeof adminTaxonomyObservationListQuerySchema
>;

export const adminTaxonomyObservationListResponseSchema = z
  .object({
    items: z.array(adminTaxonomyObservationSchema),
    total: z.number().int().nonnegative(),
    nextCursor: z.string().nullable(),
  })
  .strict();

export type AdminTaxonomyObservationListResponse = z.infer<
  typeof adminTaxonomyObservationListResponseSchema
>;

/**
 * Map a pending observation (contract §9): create-or-reuse the final
 * provider-scoped alias for the observation's label and close the observation
 * atomically. The review note is optional and bounded; it is stored on the
 * observation row and never enters audit metadata.
 */
export const mapAdminTaxonomyObservationRequestSchema = z
  .object({
    categoryId: z.string(),
    reviewNote: z.string().max(500).optional(),
  })
  .strict();

export type MapAdminTaxonomyObservationRequest = z.infer<
  typeof mapAdminTaxonomyObservationRequestSchema
>;

/** Ignore an open observation (optional bounded review note). */
export const ignoreAdminTaxonomyObservationRequestSchema = z
  .object({
    reviewNote: z.string().max(500).optional(),
  })
  .strict();

export type IgnoreAdminTaxonomyObservationRequest = z.infer<
  typeof ignoreAdminTaxonomyObservationRequestSchema
>;

export const mapAdminTaxonomyObservationResponseSchema = z
  .object({
    observation: adminTaxonomyObservationSchema,
    alias: adminTaxonomyAliasSchema,
    aliasCreated: z.boolean(),
    affectedWorkCount: z.number().int().nonnegative(),
  })
  .strict();

export type MapAdminTaxonomyObservationResponse = z.infer<
  typeof mapAdminTaxonomyObservationResponseSchema
>;
