import { z } from 'zod';

import { offsetPaginatedResponseSchema } from '../common/pagination.js';
import { categoryAliasScopeSchema } from '../catalog/taxonomy.js';
import {
  CATEGORY_TRANSLATION_LABEL_MAX_LENGTH,
  categoryTranslationSchema,
  categoryTranslationSetSchema,
  supportedLocaleSchema,
} from '../catalog/taxonomy-localization.js';
import { catalogSourceProviderSchema } from '../enums/catalog-work.js';

/**
 * Admin catalog taxonomy shared contract (epic #693, child #703).
 *
 * The single shared zod contract for the final category hierarchy and
 * lifecycle management surface under `/v1/admin/catalog/taxonomy/*`
 * (docs/architecture/catalog-taxonomy.md §11). The NestJS DTOs mirror these
 * shapes and the SDK is typed by them, so the wire contract stays in lockstep.
 *
 * Rules encoded here:
 * - the category slug is the stable portable identity (contract §2) — the
 *   create request carries it and the update request has NO slug key by
 *   construction (slug changes are replace operations only);
 * - every schema is a strict allowlist (no unknown keys, no raw payloads);
 * - pagination reuses the offset envelope; sort and active filters are
 *   bounded enums.
 */

export const adminTaxonomyCategorySchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    displayName: z.string(),
    isActive: z.boolean(),
    orderIndex: z.number().int().nonnegative(),
    parentCategoryId: z.string().nullable(),
    parentSlug: z.string().nullable(),
    /** Number of work assignments on this category (list-surface usage). */
    usageCount: z.number().int().nonnegative(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .strict();

export type AdminTaxonomyCategory = z.infer<typeof adminTaxonomyCategorySchema>;

/** Full translation set returned only by the category detail surface. */
export const adminTaxonomyCategoryDetailSchema = adminTaxonomyCategorySchema
  .extend({
    translations: categoryTranslationSetSchema,
  })
  .strict();

export type AdminTaxonomyCategoryDetail = z.infer<
  typeof adminTaxonomyCategoryDetailSchema
>;

export type AdminTaxonomyCategoryTreeNode = {
  children: AdminTaxonomyCategoryTreeNode[];
  displayName: string;
  id: string;
  isActive: boolean;
  orderIndex: number;
  slug: string;
};

/** Recursive hierarchy read (contract §3): children ordered by
 * (orderIndex asc, slug asc). Depth is derivable and intentionally absent. */
export const adminTaxonomyCategoryTreeSchema: z.ZodType<AdminTaxonomyCategoryTreeNode> =
  z.lazy(() =>
    z
      .object({
        children: z.array(adminTaxonomyCategoryTreeSchema),
        displayName: z.string(),
        id: z.string(),
        isActive: z.boolean(),
        orderIndex: z.number().int().nonnegative(),
        slug: z.string(),
      })
      .strict(),
  );

export type AdminTaxonomyCategoryTree = z.infer<
  typeof adminTaxonomyCategoryTreeSchema
>;

export const adminTaxonomyCategoryAliasSchema = z
  .object({
    id: z.string(),
    label: z.string(),
    normalizedLabel: z.string(),
    scope: categoryAliasScopeSchema,
    sourceProvider: catalogSourceProviderSchema.nullable(),
  })
  .strict();

export type AdminTaxonomyCategoryAlias = z.infer<
  typeof adminTaxonomyCategoryAliasSchema
>;

/** Usage breakdown of one category (assignment provenance counts plus
 * relationship counts), used by the detail and affected-work surfaces. */
export const adminTaxonomyCategoryUsageSchema = z
  .object({
    assignmentCount: z.number().int().nonnegative(),
    primaryCount: z.number().int().nonnegative(),
    providerManagedCount: z.number().int().nonnegative(),
    editorialCount: z.number().int().nonnegative(),
    userContributedCount: z.number().int().nonnegative(),
    childCategoryCount: z.number().int().nonnegative(),
    aliasCount: z.number().int().nonnegative(),
  })
  .strict();

export type AdminTaxonomyCategoryUsage = z.infer<
  typeof adminTaxonomyCategoryUsageSchema
>;

export const adminTaxonomyCategoryDetailResponseSchema = z
  .object({
    category: adminTaxonomyCategoryDetailSchema,
    aliases: z.array(adminTaxonomyCategoryAliasSchema),
    usage: adminTaxonomyCategoryUsageSchema,
  })
  .strict();

export type AdminTaxonomyCategoryDetailResponse = z.infer<
  typeof adminTaxonomyCategoryDetailResponseSchema
>;

/** Body for the explicit category translation upsert route. The category id
 * and locale are path identity, so they are intentionally not duplicated in
 * the body. */
export const upsertAdminTaxonomyCategoryTranslationRequestSchema = z
  .object({
    label: z.string().trim().min(1).max(CATEGORY_TRANSLATION_LABEL_MAX_LENGTH),
  })
  .strict();

export type UpsertAdminTaxonomyCategoryTranslationRequest = z.infer<
  typeof upsertAdminTaxonomyCategoryTranslationRequestSchema
>;

export const adminTaxonomyCategoryTranslationResponseSchema = z
  .object({
    categoryId: z.string(),
    label: categoryTranslationSchema.shape.label,
    locale: supportedLocaleSchema,
  })
  .strict();

export type AdminTaxonomyCategoryTranslationResponse = z.infer<
  typeof adminTaxonomyCategoryTranslationResponseSchema
>;

export const deleteAdminTaxonomyCategoryTranslationResponseSchema = z
  .object({
    deleted: z.literal(true),
    categoryId: z.string(),
    locale: supportedLocaleSchema,
  })
  .strict();

export type DeleteAdminTaxonomyCategoryTranslationResponse = z.infer<
  typeof deleteAdminTaxonomyCategoryTranslationResponseSchema
>;

export const adminTaxonomyCategoryAffectedWorkCategorySchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    displayName: z.string(),
    isActive: z.boolean(),
  })
  .strict();

/** Pre-lifecycle-change inspection: what deactivating or deleting this
 * category would touch (assignments with provenance split, children, aliases). */
export const adminTaxonomyCategoryAffectedWorkResponseSchema = z
  .object({
    category: adminTaxonomyCategoryAffectedWorkCategorySchema,
    usage: adminTaxonomyCategoryUsageSchema,
  })
  .strict();

export type AdminTaxonomyCategoryAffectedWorkResponse = z.infer<
  typeof adminTaxonomyCategoryAffectedWorkResponseSchema
>;

export const adminTaxonomyCategorySlugSchema = z.string().min(1).max(120);
export const createAdminTaxonomyCategoryRequestSchema = z
  .object({
    slug: adminTaxonomyCategorySlugSchema,
    translations: categoryTranslationSetSchema,
    isActive: z.boolean().optional(),
    orderIndex: z.number().int().nonnegative().optional(),
    parentCategoryId: z.string().nullable().optional(),
  })
  .strict();

export type CreateAdminTaxonomyCategoryRequest = z.infer<
  typeof createAdminTaxonomyCategoryRequestSchema
>;

/**
 * Ordinary category edit (contract §2/§4): sibling order,
 * parent, and activation state only. Deliberately has NO slug key — a slug
 * change is a replace operation (`replaceAdminTaxonomyCategoryRequestSchema`).
 */
export const updateAdminTaxonomyCategoryRequestSchema = z
  .object({
    orderIndex: z.number().int().nonnegative().optional(),
    isActive: z.boolean().optional(),
    parentCategoryId: z.string().nullable().optional(),
  })
  .strict();

export type UpdateAdminTaxonomyCategoryRequest = z.infer<
  typeof updateAdminTaxonomyCategoryRequestSchema
>;

/**
 * Transactional replace/deprecate (contract §4): create a replacement active
 * category under the desired slug, optionally migrate aliases and assignments
 * from the old category, then deactivate the old category. Migration is
 * explicit and defaults to off — replace never silently drops assignments.
 */
export const replaceAdminTaxonomyCategoryRequestSchema = z
  .object({
    replacementSlug: adminTaxonomyCategorySlugSchema,
    translations: categoryTranslationSetSchema,
    migrateAliases: z.boolean().optional().default(false),
    migrateAssignments: z.boolean().optional().default(false),
  })
  .strict();

export type ReplaceAdminTaxonomyCategoryRequest = z.infer<
  typeof replaceAdminTaxonomyCategoryRequestSchema
>;

export const replaceAdminTaxonomyCategoryResponseSchema = z
  .object({
    replacement: adminTaxonomyCategorySchema,
    deactivated: adminTaxonomyCategorySchema,
    migratedAliasCount: z.number().int().nonnegative(),
    migratedAssignmentCount: z.number().int().nonnegative(),
  })
  .strict();

export type ReplaceAdminTaxonomyCategoryResponse = z.infer<
  typeof replaceAdminTaxonomyCategoryResponseSchema
>;

export const adminTaxonomyCategoryListQuerySchema = z
  .object({
    q: z.string().max(100).optional(),
    isActive: z.enum(['all', 'active', 'inactive']).optional(),
    sort: z.enum(['slug_asc', 'updatedAt_desc']).optional(),
    page: z.number().int().positive().optional(),
    pageSize: z.number().int().positive().max(100).optional(),
  })
  .strict();

export type AdminTaxonomyCategoryListQuery = z.infer<
  typeof adminTaxonomyCategoryListQuerySchema
>;

export const adminTaxonomyCategoryListResponseSchema =
  offsetPaginatedResponseSchema(adminTaxonomyCategorySchema);

export type AdminTaxonomyCategoryListResponse = z.infer<
  typeof adminTaxonomyCategoryListResponseSchema
>;

export const deleteAdminTaxonomyCategoryResponseSchema = z
  .object({
    deleted: z.literal(true),
    categoryId: z.string(),
    slug: z.string(),
  })
  .strict();

export type DeleteAdminTaxonomyCategoryResponse = z.infer<
  typeof deleteAdminTaxonomyCategoryResponseSchema
>;
