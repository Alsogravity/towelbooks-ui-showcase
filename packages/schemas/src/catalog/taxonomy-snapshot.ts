import { z } from 'zod';

import { utcDateTimeStringSchema } from '../common/utc-datetime.js';
import { catalogSourceProviderSchema } from '../enums/catalog-work.js';
import { categoryAliasScopeSchema } from './taxonomy.js';
import { taxonomySnapshotCategoryTranslationSetSchema } from './taxonomy-localization.js';

/**
 * Catalog taxonomy snapshot shared contract (epic #693, child #707).
 *
 * Single source of truth for the portable, versioned taxonomy snapshot JSON
 * artifact. The artifact is the deterministic, self-contained export of the
 * authoritative taxonomy state (categories, translations, hierarchy,
 * lifecycle, order, and provider-scoped aliases) that the API export service
 * writes and that later
 * catalog-taxonomy children (epic #693) validate and apply. The domain rules
 * behind the artifact live in docs/architecture/catalog-taxonomy.md
 * (versioning and snapshot portability section).
 *
 * The artifact is intentionally free of environment-specific identifiers:
 * it carries no database UUIDs, no user data, no provider raw payloads, no
 * unmatched-label observations, no audit or workflow records, and no secrets.
 * Identity is expressed through category slugs and provider-scoped alias
 * keys, so the artifact is portable across environments.
 */

/**
 * Format marker of the artifact. Every taxonomy snapshot artifact starts with
 * this literal so consumers can reject foreign payloads before parsing.
 */
export const TAXONOMY_SNAPSHOT_FORMAT = 'catalog-taxonomy-snapshot';

/**
 * Version of the artifact format itself. Bumped only when the JSON shape or
 * the canonical serialization rules change; independent of the taxonomy
 * content version carried in `taxonomyVersion` and the classification-only
 * revision carried in `classificationRevision`.
 */
export const TAXONOMY_SNAPSHOT_SCHEMA_VERSION = 2;

/**
 * Generation source marker written into every artifact. Kept as a literal so
 * consumers can distinguish artifacts produced by the canonical export path
 * from any future producer without loosening the schema.
 */
export const TAXONOMY_SNAPSHOT_GENERATION_SOURCE = 'catalog-taxonomy-export';

/**
 * A category in the snapshot. Identity is the slug; hierarchy is expressed
 * through `parentSlug` (null for root categories). `isActive` carries the
 * lifecycle state and `orderIndex` the sibling ordering, both authoritative
 * at export time. The complete default-backed translation set is embedded in
 * the category and ordered by canonical locale.
 */
export const taxonomySnapshotCategorySchema = z
  .object({
    slug: z.string().min(1).max(120),
    translations: taxonomySnapshotCategoryTranslationSetSchema,
    isActive: z.boolean(),
    orderIndex: z.number().int().nonnegative(),
    parentSlug: z.string().min(1).max(120).nullable(),
  })
  .strict();

export type TaxonomySnapshotCategory = z.infer<
  typeof taxonomySnapshotCategorySchema
>;

/**
 * An alias in the snapshot. `scope` is `global` (no source provider, applies
 * to every provider) or `provider` (applies only to `provider`). `provider`
 * is null exactly when `scope` is `global`. `categorySlug` is the category
 * the alias resolves to; `label` is the display form and `normalizedLabel`
 * the canonical matching form.
 */
export const taxonomySnapshotAliasSchema = z
  .object({
    label: z.string().min(1).max(160),
    normalizedLabel: z.string().min(1).max(160),
    scope: categoryAliasScopeSchema,
    provider: catalogSourceProviderSchema.nullable(),
    categorySlug: z.string().min(1).max(120),
  })
  .strict()
  .superRefine((alias, context) => {
    if (alias.scope === 'global' && alias.provider !== null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'a global alias must not carry a provider',
        path: ['provider'],
      });
    }
    if (alias.scope === 'provider' && alias.provider === null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'a provider-scoped alias must carry a provider',
        path: ['provider'],
      });
    }
  });

export type TaxonomySnapshotAlias = z.infer<typeof taxonomySnapshotAliasSchema>;

/**
 * Counts of the snapshot content. `activeCategories` counts categories with
 * `isActive: true`; `translations` counts embedded category translations;
 * `globalAliases` and `providerAliases` split the alias count by scope. Counts
 * must match the arrays they describe.
 */
export const taxonomySnapshotCountsSchema = z
  .object({
    categories: z.number().int().nonnegative(),
    activeCategories: z.number().int().nonnegative(),
    translations: z.number().int().nonnegative(),
    aliases: z.number().int().nonnegative(),
    globalAliases: z.number().int().nonnegative(),
    providerAliases: z.number().int().nonnegative(),
  })
  .strict();

export type TaxonomySnapshotCounts = z.infer<
  typeof taxonomySnapshotCountsSchema
>;

/**
 * Generation metadata: when the artifact was generated (UTC, explicit
 * offset) and by which producer.
 */
export const taxonomySnapshotGenerationSchema = z
  .object({
    generatedAt: utcDateTimeStringSchema,
    source: z.literal(TAXONOMY_SNAPSHOT_GENERATION_SOURCE),
  })
  .strict();

export type TaxonomySnapshotGeneration = z.infer<
  typeof taxonomySnapshotGenerationSchema
>;

/**
 * The final taxonomy snapshot artifact. `taxonomyVersion` is the content
 * revision derived from all authoritative portable taxonomy state (including
 * translations), while `classificationRevision` is derived only from state
 * that can affect classification. `snapshotId` identifies this exact
 * artifact, and `checksum` is the canonical sha256 of the whole artifact.
 * All four are lowercase 64-char hex strings.
 */
export const taxonomySnapshotSchema = z
  .object({
    format: z.literal(TAXONOMY_SNAPSHOT_FORMAT),
    schemaVersion: z.literal(TAXONOMY_SNAPSHOT_SCHEMA_VERSION),
    taxonomyVersion: z.string().regex(/^[0-9a-f]{64}$/),
    classificationRevision: z.string().regex(/^[0-9a-f]{64}$/),
    snapshotId: z.string().regex(/^[0-9a-f]{64}$/),
    generation: taxonomySnapshotGenerationSchema,
    counts: taxonomySnapshotCountsSchema,
    categories: z.array(taxonomySnapshotCategorySchema),
    aliases: z.array(taxonomySnapshotAliasSchema),
    checksum: z.string().regex(/^[0-9a-f]{64}$/),
  })
  .strict();

export type TaxonomySnapshot = z.infer<typeof taxonomySnapshotSchema>;
