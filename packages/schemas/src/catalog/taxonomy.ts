import { z } from 'zod';

import { supportedLocaleSchema } from './taxonomy-localization.js';

/**
 * Catalog taxonomy shared contract constants (epic #693, child #694).
 *
 * Single source of truth for the taxonomy vocabulary shared by the API DTOs,
 * the SDK, and the Admin frontend. The domain rules behind these values live
 * in docs/architecture/catalog-taxonomy.md; later catalog-taxonomy children
 * (epic #693) implement against both without reopening the decisions.
 */

/**
 * Alias scope: a global alias has no source provider and applies to every
 * provider; a provider-scoped alias applies only to its source provider. For
 * a label from provider P, a provider-scoped alias for P wins over a global
 * alias.
 */
export const categoryAliasScopeSchema = z.enum(['global', 'provider']);

export type CategoryAliasScope = z.infer<typeof categoryAliasScopeSchema>;

export const CATEGORY_ALIAS_SCOPES = categoryAliasScopeSchema.options;

/**
 * Assignment provenance: `provider_managed` assignments are created by import
 * classification and reconciled by the classifying provider; `editorial`
 * assignments are created, kept, or converted by an Admin operator and are
 * always preserved by reconciliation.
 */
export const catalogWorkCategoryAssignmentProvenanceSchema = z.enum([
  'provider_managed',
  'editorial',
  'user_contributed',
]);

export type CatalogWorkCategoryAssignmentProvenance = z.infer<
  typeof catalogWorkCategoryAssignmentProvenanceSchema
>;

export const CATALOG_WORK_CATEGORY_ASSIGNMENT_PROVENANCES =
  catalogWorkCategoryAssignmentProvenanceSchema.options;

/**
 * Unmatched provider-label observation lifecycle: `open` observations sit in
 * the curation queue; `resolved` observations are linked to a category
 * through an alias; `ignored` observations were dismissed by an operator.
 * Resolved and ignored observations leave the curation queue.
 */
export const unmatchedCategoryLabelStatusSchema = z.enum([
  'open',
  'resolved',
  'ignored',
]);

export type UnmatchedCategoryLabelStatus = z.infer<
  typeof unmatchedCategoryLabelStatusSchema
>;

export const UNMATCHED_CATEGORY_LABEL_STATUSES =
  unmatchedCategoryLabelStatusSchema.options;

/**
 * Resolution evidence class of a recognized category (contract §7.2, §8):
 * `provider_scoped` when the category was resolved through a provider-scoped
 * alias of the importing provider, `global` when resolved only through a
 * global alias. Mirrors the persisted `CatalogWorkCategoryResolutionKind`
 * column and the API projection vocabulary.
 */
export const categoryResolutionMatchKindSchema = z.enum([
  'provider_scoped',
  'global',
]);

export type CategoryResolutionMatchKind = z.infer<
  typeof categoryResolutionMatchKindSchema
>;

export const CATEGORY_RESOLUTION_MATCH_KINDS =
  categoryResolutionMatchKindSchema.options;

/**
 * How a recognized category entered a resolution (contract §3, §5): a direct
 * `full_label` match, a hierarchy `segment` match, or an `ancestor` appended
 * from the matched category's active ancestor chain.
 */
export const categoryResolutionDerivationSchema = z.enum([
  'full_label',
  'segment',
  'ancestor',
]);

export type CategoryResolutionDerivation = z.infer<
  typeof categoryResolutionDerivationSchema
>;

export const CATEGORY_RESOLUTION_DERIVATIONS =
  categoryResolutionDerivationSchema.options;

/**
 * Why a matched category is excluded from a resolution (contract §4, §3):
 * `inactive_category` (the matched category is deactivated), `inactive_ancestor`
 * (an ancestor of the matched category is deactivated), or `hierarchy_conflict`
 * (the ancestor chain is broken). Excluded categories are surfaced explicitly
 * so operators can curate them.
 */
export const categoryResolutionExclusionReasonSchema = z.enum([
  'inactive_category',
  'inactive_ancestor',
  'hierarchy_conflict',
]);

export type CategoryResolutionExclusionReason = z.infer<
  typeof categoryResolutionExclusionReasonSchema
>;

export const CATEGORY_RESOLUTION_EXCLUSION_REASONS =
  categoryResolutionExclusionReasonSchema.options;

/**
 * Canonical reader-facing category identity and localized presentation. This
 * is shared by category-backed profile preferences and taxonomy option lists so
 * consumers never need to reconstruct category identity from labels.
 */
export const catalogCategoryReferenceSchema = z
  .object({
    displayName: z.string().min(1).max(120),
    displayNameLocale: supportedLocaleSchema,
    id: z.string().uuid(),
    slug: z.string().min(1).max(120),
  })
  .strict();

export type CatalogCategoryReference = z.infer<
  typeof catalogCategoryReferenceSchema
>;

/**
 * Reader-facing active taxonomy options used by catalog contribution and room
 * settings forms. This is intentionally smaller than the admin category
 * contract: lifecycle metadata, usage counts, and aliases stay behind the
 * admin boundary. The stable UUID is included so room mutations can reference
 * the selected category without making clients infer identity from labels.
 */
export const catalogTaxonomyCategoryOptionSchema =
  catalogCategoryReferenceSchema.extend({
    parentSlug: z.string().min(1).max(120).nullable(),
  });

export type CatalogTaxonomyCategoryOption = z.infer<
  typeof catalogTaxonomyCategoryOptionSchema
>;

export const catalogTaxonomyOptionsResponseSchema = z
  .object({
    categories: z.array(catalogTaxonomyCategoryOptionSchema),
  })
  .strict();

export type CatalogTaxonomyOptionsResponse = z.infer<
  typeof catalogTaxonomyOptionsResponseSchema
>;

/**
 * Origin of a preview taxonomy projection (contract §6): `canonical_work` when
 * the classification source is the canonical work record itself (including the
 * empty case where neither the work nor a fallback edition carries labels),
 * `edition_fallback` when the deterministic single-edition fallback supplied
 * the labels.
 */
export const bookCatalogImportTaxonomyOriginSchema = z.enum([
  'canonical_work',
  'edition_fallback',
]);

export type BookCatalogImportTaxonomyOrigin = z.infer<
  typeof bookCatalogImportTaxonomyOriginSchema
>;

export const BOOK_CATALOG_IMPORT_TAXONOMY_ORIGINS =
  bookCatalogImportTaxonomyOriginSchema.options;
