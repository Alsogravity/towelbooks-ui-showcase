import { z } from 'zod';

import { utcDateTimeStringSchema } from '../common/utc-datetime.js';
import { categoryAliasScopeSchema } from './taxonomy.js';
import { taxonomySnapshotCategoryTranslationSetSchema } from './taxonomy-localization.js';

/**
 * Catalog taxonomy snapshot intake contract (epic #693, child #708).
 *
 * Shared contract for the validate → plan → transactional apply pipeline that
 * consumes the #707 taxonomy snapshot artifact. The plan is the deterministic,
 * machine-readable and operator-readable diff between the artifact and the
 * target database taxonomy state: every category and alias change is one
 * operation, no-ops and conflicts are explicit, and usage-sensitive lifecycle
 * and alias operations carry the affected-work counts so an operator can
 * review the impact before applying. The plan is fingerprinted against the
 * artifact checksum and the current classification revision so a stale plan
 * can be rejected at apply time. Full taxonomy content remains bound by the
 * artifact checksum and taxonomy version.
 *
 * The plan is intentionally free of environment-specific identifiers: it
 * references categories by slug and aliases by their (scope, provider,
 * normalized label) key, exactly like the artifact. It never carries database
 * UUIDs, user data, provider raw payloads, or secrets.
 */

/**
 * Format marker of the intake plan artifact. Every plan starts with this
 * literal so consumers can reject foreign payloads before parsing.
 */
export const TAXONOMY_SNAPSHOT_PLAN_FORMAT = 'catalog-taxonomy-snapshot-plan';

/**
 * Version of the plan format itself. Bumped when the JSON shape or the
 * operation vocabulary changes; independent of the taxonomy content version.
 */
export const TAXONOMY_SNAPSHOT_PLAN_SCHEMA_VERSION = 2;

/**
 * The operation kinds the planner can emit (issue #708 scope): category and
 * alias create/update/activate/deactivate/reparent/reorder/reassign/change
 * scope/remove, plus no-op (the entity already matches the artifact) and
 * conflict (the change cannot be applied automatically and needs operator
 * attention). A plan containing conflicts must not be applied.
 */
export const taxonomySnapshotPlanOperationKindSchema = z.enum([
  'create',
  'update',
  'activate',
  'deactivate',
  'reparent',
  'reorder',
  'reassign',
  'change-scope',
  'remove',
  'no-op',
  'conflict',
]);

export type TaxonomySnapshotPlanOperationKind = z.infer<
  typeof taxonomySnapshotPlanOperationKindSchema
>;

/** Affected-work counts of a lifecycle or alias operation (counts only —
 * never work lists). */
export const taxonomySnapshotCategoryUsageSchema = z
  .object({
    assignmentCount: z.number().int().nonnegative(),
    primaryCount: z.number().int().nonnegative(),
  })
  .strict();

export type TaxonomySnapshotCategoryUsage = z.infer<
  typeof taxonomySnapshotCategoryUsageSchema
>;

/** Affected-work counts of an alias operation, mirroring the repository's
 * deterministic affected-work preview (contract §5/#704). */
export const taxonomySnapshotAliasUsageSchema = z
  .object({
    assignmentCount: z.number().int().nonnegative(),
    workCount: z.number().int().nonnegative(),
    primaryCount: z.number().int().nonnegative(),
    providerManagedCount: z.number().int().nonnegative(),
    editorialCount: z.number().int().nonnegative(),
  })
  .strict();

export type TaxonomySnapshotAliasUsage = z.infer<
  typeof taxonomySnapshotAliasUsageSchema
>;

/** Full target category state carried by every category operation, so the
 * plan is self-describing and the apply is deterministic. */
const categoryOperationStateSchema = z
  .object({
    entity: z.literal('category'),
    slug: z.string().min(1).max(120),
    translations: taxonomySnapshotCategoryTranslationSetSchema,
    isActive: z.boolean(),
    orderIndex: z.number().int().nonnegative(),
    parentSlug: z.string().min(1).max(120).nullable(),
  })
  .strict();

/** Full target alias state carried by every alias operation. */
const aliasOperationStateSchema = z
  .object({
    entity: z.literal('alias'),
    normalizedLabel: z.string().min(1).max(160),
    label: z.string().min(1).max(160),
    scope: categoryAliasScopeSchema,
    provider: z.string().nullable(),
    categorySlug: z.string().min(1).max(120),
  })
  .strict();

/**
 * One plan operation: a union over the operation kind. The `kind` literal
 * alone is not a unique discriminator (category and alias operations share
 * `create`/`update`/`remove`), so this is a plain union; the `entity` field
 * disambiguates the shared kinds.
 */
export const taxonomySnapshotPlanOperationSchema = z.union([
  categoryOperationStateSchema.extend({ kind: z.literal('create') }),
  categoryOperationStateSchema.extend({ kind: z.literal('update') }),
  categoryOperationStateSchema.extend({ kind: z.literal('activate') }),
  categoryOperationStateSchema.extend({
    kind: z.literal('deactivate'),
    usage: taxonomySnapshotCategoryUsageSchema,
  }),
  categoryOperationStateSchema.extend({ kind: z.literal('reparent') }),
  categoryOperationStateSchema.extend({ kind: z.literal('reorder') }),
  categoryOperationStateSchema.extend({
    kind: z.literal('remove'),
    usage: taxonomySnapshotCategoryUsageSchema,
  }),
  aliasOperationStateSchema.extend({ kind: z.literal('create') }),
  aliasOperationStateSchema.extend({ kind: z.literal('update') }),
  aliasOperationStateSchema.extend({ kind: z.literal('reassign') }),
  aliasOperationStateSchema.extend({ kind: z.literal('change-scope') }),
  aliasOperationStateSchema.extend({
    kind: z.literal('remove'),
    usage: taxonomySnapshotAliasUsageSchema,
  }),
  z
    .object({
      kind: z.literal('no-op'),
      entity: z.enum(['category', 'alias']),
      slug: z.string().min(1).max(160),
    })
    .strict(),
  z
    .object({
      kind: z.literal('conflict'),
      entity: z.enum(['category', 'alias']),
      slug: z.string().min(1).max(160),
      reason: z.string().min(1).max(500),
    })
    .strict(),
]);

export type TaxonomySnapshotPlanOperation = z.infer<
  typeof taxonomySnapshotPlanOperationSchema
>;

/** Per-kind operation totals of a plan (or of an apply). */
export const taxonomySnapshotPlanSummarySchema = z
  .object({
    operations: z.number().int().nonnegative(),
    creates: z.number().int().nonnegative(),
    updates: z.number().int().nonnegative(),
    activates: z.number().int().nonnegative(),
    deactivates: z.number().int().nonnegative(),
    reparents: z.number().int().nonnegative(),
    reorders: z.number().int().nonnegative(),
    reassigns: z.number().int().nonnegative(),
    scopeChanges: z.number().int().nonnegative(),
    removes: z.number().int().nonnegative(),
    noOps: z.number().int().nonnegative(),
    conflicts: z.number().int().nonnegative(),
  })
  .strict();

export type TaxonomySnapshotPlanSummary = z.infer<
  typeof taxonomySnapshotPlanSummarySchema
>;

/**
 * The final intake plan. `snapshotId`/`snapshotChecksum` identify the exact
 * artifact the plan was computed for; the two snapshot revisions describe its
 * full content and classification state; `currentClassificationRevision` is
 * the target database's classification-only revision at plan time;
 * `fingerprint` is the sha256 over the artifact checksum and that current
 * classification revision, so apply can reject a stale classification plan.
 * `generatedAt` is the plan creation time (UTC, explicit offset).
 */
export const taxonomySnapshotPlanSchema = z
  .object({
    format: z.literal(TAXONOMY_SNAPSHOT_PLAN_FORMAT),
    schemaVersion: z.literal(TAXONOMY_SNAPSHOT_PLAN_SCHEMA_VERSION),
    snapshotId: z.string().regex(/^[0-9a-f]{64}$/),
    snapshotChecksum: z.string().regex(/^[0-9a-f]{64}$/),
    snapshotTaxonomyVersion: z.string().regex(/^[0-9a-f]{64}$/),
    snapshotClassificationRevision: z.string().regex(/^[0-9a-f]{64}$/),
    currentClassificationRevision: z.string().regex(/^[0-9a-f]{64}$/),
    fingerprint: z.string().regex(/^[0-9a-f]{64}$/),
    generatedAt: utcDateTimeStringSchema,
    summary: taxonomySnapshotPlanSummarySchema,
    operations: z.array(taxonomySnapshotPlanOperationSchema),
  })
  .strict();

export type TaxonomySnapshotPlan = z.infer<typeof taxonomySnapshotPlanSchema>;

/**
 * The apply result. `status` is `applied` when the plan wrote taxonomy
 * content and recorded a new taxonomy revision, or `noop` when the target
 * database already matched the artifact (repeated apply performs no writes).
 * The taxonomy version fields capture full portable content movement, while
 * the classification revision fields capture classification-bearing state.
 * `operationTotals` are the per-kind counts of the operations that were
 * actually applied.
 */
export const taxonomySnapshotApplyResultSchema = z
  .object({
    format: z.literal(TAXONOMY_SNAPSHOT_PLAN_FORMAT),
    schemaVersion: z.literal(TAXONOMY_SNAPSHOT_PLAN_SCHEMA_VERSION),
    snapshotId: z.string().regex(/^[0-9a-f]{64}$/),
    snapshotChecksum: z.string().regex(/^[0-9a-f]{64}$/),
    status: z.enum(['applied', 'noop']),
    beforeTaxonomyVersion: z.string().regex(/^[0-9a-f]{64}$/),
    afterTaxonomyVersion: z.string().regex(/^[0-9a-f]{64}$/),
    beforeClassificationRevision: z.string().regex(/^[0-9a-f]{64}$/),
    afterClassificationRevision: z.string().regex(/^[0-9a-f]{64}$/),
    appliedAt: utcDateTimeStringSchema,
    operationTotals: taxonomySnapshotPlanSummarySchema,
  })
  .strict();

export type TaxonomySnapshotApplyResult = z.infer<
  typeof taxonomySnapshotApplyResultSchema
>;
