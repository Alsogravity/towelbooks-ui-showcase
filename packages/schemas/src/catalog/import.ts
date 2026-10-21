import { z } from 'zod';

import { catalogWorkTypeSchema } from '../enums.js';
import { utcDateTimeStringSchema } from '../common/utc-datetime.js';
import {
  READING_AUTHOR_MAX_LENGTH,
  READING_TITLE_MAX_LENGTH,
} from '../limits.js';

import { parseCanonicalIsbn } from './isbn.js';
import { READING_ISBN_MAX_LENGTH } from '../limits.js';
import { catalogContributorNameSchema } from './search.js';

import {
  categoryResolutionDerivationSchema,
  categoryResolutionExclusionReasonSchema,
  categoryResolutionMatchKindSchema,
  bookCatalogImportTaxonomyOriginSchema,
} from './taxonomy.js';

export const catalogImportSourceSchema = z.enum(['open_library']);

export type CatalogImportSource = z.infer<typeof catalogImportSourceSchema>;

export const catalogImportRequestSchema = z.object({
  kind: catalogWorkTypeSchema,
  source: catalogImportSourceSchema,
  sourceId: z.string().min(1).max(128),
});

export type CatalogImportRequest = z.infer<typeof catalogImportRequestSchema>;

export const catalogImportResponseSchema = z.object({
  catalogWorkId: z.string().uuid(),
  catalogEditionId: z.string().uuid().nullable(),
});

export type CatalogImportResponse = z.infer<typeof catalogImportResponseSchema>;

export const bookCatalogImportProviderSchema = z.literal('open_library');
export type BookCatalogImportProvider = z.infer<
  typeof bookCatalogImportProviderSchema
>;

export const BOOK_CATALOG_IMPORT_LANGUAGE_VALUES = ['en-US', 'pt-BR'] as const;
export const bookCatalogImportLanguageSchema = z.enum(
  BOOK_CATALOG_IMPORT_LANGUAGE_VALUES,
);
export type BookCatalogImportLanguage = z.infer<
  typeof bookCatalogImportLanguageSchema
>;

/** Operator-selectable bounds for ranked edition candidates per language. */
export const BOOK_CATALOG_IMPORT_RESULTS_PER_LANGUAGE_VALUES = [
  5, 10, 15, 20,
] as const;

export const BOOK_CATALOG_IMPORT_DEFAULT_RESULTS_PER_LANGUAGE = 5;
export const BOOK_CATALOG_IMPORT_MAX_RESULTS_PER_LANGUAGE = 20;

export const bookCatalogImportResultsPerLanguageSchema = z.union([
  z.literal(5),
  z.literal(10),
  z.literal(15),
  z.literal(20),
]);

export type BookCatalogImportResultsPerLanguage = z.infer<
  typeof bookCatalogImportResultsPerLanguageSchema
>;

export const bookCatalogImportWorkStatusSchema = z.enum([
  'created',
  'reused',
  'skipped',
  'failed',
]);

export type BookCatalogImportWorkStatus = z.infer<
  typeof bookCatalogImportWorkStatusSchema
>;

export const bookCatalogImportEditionStatusSchema = z.enum([
  'created',
  'reused',
  'skipped',
  'not_found',
  'failed',
]);

export const BOOK_CATALOG_IMPORT_ISBN_INVALID_MESSAGE =
  'isbn must be a valid ISBN-10 or ISBN-13.';

/**
 * Single canonical ISBN input pipeline: formats a valid ISBN-10/ISBN-13 into
 * canonical digits (spaces/hyphens allowed on input, uppercase X check digit)
 * and rejects every malformed value with a field-scoped `isbn` error. Empty
 * strings are rejected; absent fields stay optional.
 */
export const canonicalIsbnInputSchema = z
  .string()
  .trim()
  .max(READING_ISBN_MAX_LENGTH)
  .transform((value, context) => {
    const parsed = parseCanonicalIsbn(value);

    if (!parsed) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: BOOK_CATALOG_IMPORT_ISBN_INVALID_MESSAGE,
      });

      return z.NEVER;
    }

    return parsed.value;
  });

export const BOOK_CATALOG_IMPORT_CRITERIA_REQUIRED_MESSAGE =
  'At least one of query or isbn is required.';

export const bookCatalogImportRequestSchema = z
  .object({
    query: z.string().min(1).max(READING_TITLE_MAX_LENGTH).optional(),
    author: z.string().min(1).max(READING_AUTHOR_MAX_LENGTH).optional(),
    isbn: canonicalIsbnInputSchema.optional(),
    provider: bookCatalogImportProviderSchema.optional(),
    languages: z
      .array(bookCatalogImportLanguageSchema)
      .min(1)
      .max(2)
      .refine((value) => new Set(value).size === value.length, {
        message: 'languages must not contain duplicates.',
      })
      .optional(),
    primaryLanguage: bookCatalogImportLanguageSchema.optional(),
    resultsPerLanguage: bookCatalogImportResultsPerLanguageSchema.optional(),
  })
  .superRefine((value, context) => {
    if (!value.query && !value.isbn) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: BOOK_CATALOG_IMPORT_CRITERIA_REQUIRED_MESSAGE,
        path: ['query'],
      });
    }

    if (
      value.primaryLanguage &&
      value.languages &&
      !value.languages.includes(value.primaryLanguage)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'primaryLanguage must be included in languages.',
        path: ['primaryLanguage'],
      });
    }
  });

export type BookCatalogImportRequest = z.infer<
  typeof bookCatalogImportRequestSchema
>;

/**
 * Maximum number of entries per taxonomy projection array (`categories`,
 * `excluded`, `unmatchedLabels`) exposed on a resolved work. The server
 * caps the persisted projection at this bound before it is written to the
 * preview snapshot, so every response validates against the wire schema.
 */
export const BOOK_CATALOG_IMPORT_TAXONOMY_PROJECTION_LIMIT = 50;

/** Named confidence bands derived from the provider score scale. */
export const bookCatalogImportConfidenceBandSchema = z.enum([
  'high',
  'medium',
  'low',
  'rejected',
]);

export type BookCatalogImportConfidenceBand = z.infer<
  typeof bookCatalogImportConfidenceBandSchema
>;

/**
 * Preview-time projection of what confirming a candidate would do. This
 * vocabulary is distinct from the factual completed-import statuses
 * (`created`/`reused`/`skipped`/`not_found`/`failed`): a preview never
 * describes persisted state, only a projected action.
 *
 * - `will_create` — confirming would create a new local record;
 * - `will_reuse` — confirming would reuse an existing local record;
 * - `will_skip` — the candidate would be skipped;
 * - `not_found` — the provider record could not be resolved;
 * - `blocked` — the candidate is not confirmable (e.g. its local preview
 *   failed).
 */
export const bookCatalogImportPreviewProjectionSchema = z.enum([
  'will_create',
  'will_reuse',
  'will_skip',
  'not_found',
  'blocked',
]);

export type BookCatalogImportPreviewProjection = z.infer<
  typeof bookCatalogImportPreviewProjectionSchema
>;

export const bookCatalogImportPreviewProjectionValues =
  bookCatalogImportPreviewProjectionSchema.options;

/**
 * Stable machine-readable codes explaining why a candidate is blocked. The
 * operator-facing message stays in the candidate `rationale`; codes support
 * tests, analytics, audit queries, and localized UI copy.
 */
export const bookCatalogImportPreviewReasonCodeSchema = z.enum([
  'LOCAL_PREVIEW_FAILED',
]);

export type BookCatalogImportPreviewReasonCode = z.infer<
  typeof bookCatalogImportPreviewReasonCodeSchema
>;

export const bookCatalogImportPreviewWarningCodeSchema = z.enum([
  'OPEN_LIBRARY_WORK_EDITIONS_UNAVAILABLE',
  'OPEN_LIBRARY_LANGUAGE_SEARCH_UNAVAILABLE',
  'OPEN_LIBRARY_TAXONOMY_UNAVAILABLE',
]);

export type BookCatalogImportPreviewWarningCode = z.infer<
  typeof bookCatalogImportPreviewWarningCodeSchema
>;

export const bookCatalogImportPreviewWarningSchema = z
  .object({
    code: bookCatalogImportPreviewWarningCodeSchema,
    language: bookCatalogImportLanguageSchema.nullable(),
    provider: bookCatalogImportProviderSchema,
    retryable: z.boolean(),
  })
  .strict();

export type BookCatalogImportPreviewWarning = z.infer<
  typeof bookCatalogImportPreviewWarningSchema
>;

/**
 * One recognized category inside a preview taxonomy projection. The category
 * slug is the stable portable identity (contract §2); the internal category
 * UUID, depth, and orderIndex are never exposed on the wire.
 */
export const bookCatalogImportTaxonomyCategorySchema = z
  .object({
    slug: z.string().min(1).max(120),
    displayName: z.string().min(1),
    /** Original provider label that introduced this category. */
    sourceLabel: z.string().min(1),
    matchKind: categoryResolutionMatchKindSchema,
    derivation: categoryResolutionDerivationSchema,
  })
  .strict();

export type BookCatalogImportTaxonomyCategory = z.infer<
  typeof bookCatalogImportTaxonomyCategorySchema
>;

/**
 * One excluded category inside a preview taxonomy projection, with the stable
 * machine-readable reason (inactive category, inactive ancestor, or hierarchy
 * conflict).
 */
export const bookCatalogImportTaxonomyExcludedCategorySchema = z
  .object({
    slug: z.string().min(1).max(120),
    displayName: z.string().min(1),
    reason: categoryResolutionExclusionReasonSchema,
  })
  .strict();

export type BookCatalogImportTaxonomyExcludedCategory = z.infer<
  typeof bookCatalogImportTaxonomyExcludedCategorySchema
>;

/**
 * One provider label that matched no alias (contract §9): the original
 * provider label plus its normalized form, kept visible for curation.
 */
export const bookCatalogImportTaxonomyUnmatchedLabelSchema = z
  .object({
    sourceLabel: z.string().min(1),
    normalizedLabel: z.string().min(1),
  })
  .strict();

export type BookCatalogImportTaxonomyUnmatchedLabel = z.infer<
  typeof bookCatalogImportTaxonomyUnmatchedLabelSchema
>;

/**
 * The selected work's final taxonomy projection, persisted with the preview
 * and exposed on the resolved work (contract §6, §7, §9; child #699). The
 * projection is an allowlist — slugs, display names, source labels, match
 * evidence, and exclusion reasons only; it never carries raw provider
 * payloads, internal category UUIDs, depth, or orderIndex. Edition candidates
 * always carry `taxonomy: null`.
 */
export const bookCatalogImportTaxonomyProjectionSchema = z
  .object({
    /** `canonical_work` or `edition_fallback` (contract §6). */
    origin: bookCatalogImportTaxonomyOriginSchema,
    /**
     * Language of the deterministic fallback edition when `origin` is
     * `edition_fallback`; null otherwise.
     */
    fallbackLanguage: bookCatalogImportLanguageSchema.nullable(),
    /** Deduplicated recognized categories plus active ancestors, ordered. */
    categories: z
      .array(bookCatalogImportTaxonomyCategorySchema)
      .max(BOOK_CATALOG_IMPORT_TAXONOMY_PROJECTION_LIMIT),
    /** Inactive categories and hierarchy conflicts, with reasons. */
    excluded: z
      .array(bookCatalogImportTaxonomyExcludedCategorySchema)
      .max(BOOK_CATALOG_IMPORT_TAXONOMY_PROJECTION_LIMIT),
    /** Contract §7 deterministic primary category, when one exists. */
    primary: z
      .object({
        slug: z.string().min(1).max(120),
        displayName: z.string().min(1),
      })
      .strict()
      .nullable(),
    /** Provider labels that matched no alias, kept for curation (§9). */
    unmatchedLabels: z
      .array(bookCatalogImportTaxonomyUnmatchedLabelSchema)
      .max(BOOK_CATALOG_IMPORT_TAXONOMY_PROJECTION_LIMIT),
  })
  .strict();

export type BookCatalogImportTaxonomyProjection = z.infer<
  typeof bookCatalogImportTaxonomyProjectionSchema
>;

/**
 * Review-grade provider candidate DTO. The API never exposes raw provider
 * payloads: every field is a normalized, policy-safe projection (covers are
 * policy-approved URLs only) plus the machine-generated score, confidence
 * band, and selection rationale the operator needs to decide.
 *
 * `projection` describes what confirming this candidate would do — never a
 * persisted result (see `bookCatalogImportPreviewProjectionSchema`).
 * `reasonCode` carries a stable machine-readable code when the candidate is
 * blocked. Candidates in a decision list are always selectable (`rejected`
 * candidates never appear here; they are listed in the decision `reasons`
 * instead).
 *
 * Edition candidates contain only edition facts and selection metadata. Work
 * identity, contributors, and taxonomy are carried by the separate `work`
 * resolution object.
 */
export const bookCatalogImportReviewCandidateSchema = z
  .object({
    provider: bookCatalogImportProviderSchema,
    sourceId: z.string().min(1).max(128),
    title: z.string().nullable(),
    subtitle: z.string().nullable(),
    description: z.string().nullable(),
    contributors: z.array(catalogContributorNameSchema),
    language: bookCatalogImportLanguageSchema.nullable(),
    coverThumbnailUrl: z.string().nullable(),
    publisher: z.string().nullable(),
    publishedDate: utcDateTimeStringSchema.nullable(),
    providerFormat: z.string().nullable(),
    isbn10: z.string().nullable(),
    isbn13: z.string().nullable(),
    catalogEditionId: z.string().uuid().nullable(),
    projection: bookCatalogImportPreviewProjectionSchema,
    reasonCode: bookCatalogImportPreviewReasonCodeSchema.nullable(),
    score: z.number().int(),
    confidence: bookCatalogImportConfidenceBandSchema,
    rationale: z.string().nullable(),
  })
  .strict();

export type BookCatalogImportReviewCandidate = z.infer<
  typeof bookCatalogImportReviewCandidateSchema
>;

/**
 * Server-resolved work identity and work-level metadata. A blocked work keeps
 * the provider but has no durable identity and cannot be confirmed.
 */
export const bookCatalogImportWorkResolutionSchema = z
  .object({
    provider: bookCatalogImportProviderSchema,
    identityKey: z.string().min(1).max(128).nullable(),
    catalogWorkId: z.string().uuid().nullable(),
    projection: bookCatalogImportPreviewProjectionSchema,
    contributors: z.array(catalogContributorNameSchema),
    taxonomy: bookCatalogImportTaxonomyProjectionSchema.nullable(),
    reasons: z.array(z.string()).max(10),
  })
  .strict();

export type BookCatalogImportWorkResolution = z.infer<
  typeof bookCatalogImportWorkResolutionSchema
>;

/** One per-language edition review decision with the operator-selected bound. */
export const bookCatalogImportEditionDecisionSchema = z
  .object({
    candidates: z
      .array(bookCatalogImportReviewCandidateSchema)
      .max(BOOK_CATALOG_IMPORT_MAX_RESULTS_PER_LANGUAGE),
    recommendedSourceId: z.string().min(1).max(128).nullable(),
    selectionRequired: z.boolean(),
    reasons: z.array(z.string()).max(10),
    language: bookCatalogImportLanguageSchema,
  })
  .strict();

export type BookCatalogImportEditionDecision = z.infer<
  typeof bookCatalogImportEditionDecisionSchema
>;

/**
 * Server-derived semantic state of a preview at creation time.
 *
 * - `ready`: the work and every language decision resolved to a
 *   preselectable (high/medium confidence) candidate — confirmation can
 *   proceed with the recommended selections;
 * - `needs_selection`: at least one selectable edition candidate requires an
 *   explicit operator choice (low confidence or absent recommendation) before
 *   confirmation;
 * - `unavailable`: no resolved work exists — the preview
 *   cannot be confirmed as-is.
 */
export const bookCatalogImportPreviewOutcomeSchema = z.enum([
  'ready',
  'needs_selection',
  'unavailable',
]);

export type BookCatalogImportPreviewOutcome = z.infer<
  typeof bookCatalogImportPreviewOutcomeSchema
>;

export const bookCatalogImportPreviewOutcomeValues =
  bookCatalogImportPreviewOutcomeSchema.options;

/**
 * Preview-time review response. Each per-language `editions` entry carries
 * ranked alternatives, the recommended selection, and the `selectionRequired`
 * flag the review UI gates confirmation on. Work resolution is server-owned
 * context; no catalog row exists until a confirmation completes against the
 * immutable preview.
 */
export const bookCatalogImportPreviewResponseSchema = z.object({
  previewId: z.string().uuid(),
  expiresAt: utcDateTimeStringSchema,
  work: bookCatalogImportWorkResolutionSchema,
  editions: z.array(bookCatalogImportEditionDecisionSchema).min(1).max(2),
  warnings: z.array(bookCatalogImportPreviewWarningSchema).max(10),
  outcome: bookCatalogImportPreviewOutcomeSchema,
});

export type BookCatalogImportPreviewResponse = z.infer<
  typeof bookCatalogImportPreviewResponseSchema
>;

export const bookCatalogImportConfirmEditionSelectionSchema = z.object({
  language: bookCatalogImportLanguageSchema,
  sourceId: z.string().min(1).max(128),
});

export type BookCatalogImportConfirmEditionSelection = z.infer<
  typeof bookCatalogImportConfirmEditionSelectionSchema
>;

export const bookCatalogImportConfirmRequestSchema = z
  .object({
    previewId: z.string().uuid(),
    selections: z
      .object({
        editions: z
          .array(bookCatalogImportConfirmEditionSelectionSchema)
          .max(2)
          .refine(
            (value) =>
              new Set(value.map((edition) => edition.language)).size ===
              value.length,
            { message: 'editions must not repeat a language.' },
          ),
      })
      .strict(),
    idempotencyKey: z.string().uuid().optional(),
  })
  .strict();

export type BookCatalogImportConfirmRequest = z.infer<
  typeof bookCatalogImportConfirmRequestSchema
>;

export const bookCatalogImportWorkResultSchema = z.object({
  status: bookCatalogImportWorkStatusSchema,
  provider: bookCatalogImportProviderSchema,
  identityKey: z.string().min(1).max(128).nullable(),
  catalogWorkId: z.string().uuid().nullable(),
  contributors: z.array(catalogContributorNameSchema),
});

export type BookCatalogImportWorkResult = z.infer<
  typeof bookCatalogImportWorkResultSchema
>;

export const bookCatalogImportEditionResultSchema = z.object({
  language: bookCatalogImportLanguageSchema,
  status: bookCatalogImportEditionStatusSchema,
  catalogEditionId: z.string().uuid().nullable(),
  source: bookCatalogImportProviderSchema.nullable(),
  sourceId: z.string().min(1).nullable(),
  title: z.string().nullable(),
  isbn10: z.string().nullable(),
  isbn13: z.string().nullable(),
  coverUrl: z.string().nullable(),
  reason: z.string().optional(),
});

export type BookCatalogImportEditionResult = z.infer<
  typeof bookCatalogImportEditionResultSchema
>;

/**
 * Server-derived semantic outcome of a completed book import. Only the
 * backend computes this value; the admin client renders notices from it
 * instead of treating transport success as domain success.
 *
 * - `completed`: at least one requested record was created and no requested
 *   edition failed or was unexpectedly unavailable;
 * - `completed_with_warnings`: useful persistence occurred, but one or more
 *   requested editions failed, were skipped, or were not found;
 * - `no_change`: no new persistence occurred — every result was reused,
 *   intentionally omitted, skipped, or not found without an operational
 *   failure;
 * - `failed`: no usable final import was produced because the work operation
 *   failed or all requested persistence failed.
 */
export const bookCatalogImportOutcomeSchema = z.enum([
  'completed',
  'completed_with_warnings',
  'no_change',
  'failed',
]);

export type BookCatalogImportOutcome = z.infer<
  typeof bookCatalogImportOutcomeSchema
>;

export const bookCatalogImportOutcomeValues =
  bookCatalogImportOutcomeSchema.options;

/**
 * Normalized stable counters for a completed import. The admin client renders
 * counts from this summary and never recalculates them from raw arrays.
 */
export const bookCatalogImportSummarySchema = z.object({
  work: z.object({
    created: z.number().int().nonnegative(),
    reused: z.number().int().nonnegative(),
    skipped: z.number().int().nonnegative(),
    failed: z.number().int().nonnegative(),
  }),
  editions: z.object({
    created: z.number().int().nonnegative(),
    reused: z.number().int().nonnegative(),
    skipped: z.number().int().nonnegative(),
    notFound: z.number().int().nonnegative(),
    failed: z.number().int().nonnegative(),
  }),
  changed: z.boolean(),
});

export type BookCatalogImportSummary = z.infer<
  typeof bookCatalogImportSummarySchema
>;

export const bookCatalogImportResponseSchema = z.object({
  catalogWorkId: z.string().uuid().nullable(),
  primaryCatalogEditionId: z.string().uuid().nullable(),
  work: bookCatalogImportWorkResultSchema,
  editions: z.array(bookCatalogImportEditionResultSchema),
  outcome: bookCatalogImportOutcomeSchema,
  summary: bookCatalogImportSummarySchema,
});

export type BookCatalogImportResponse = z.infer<
  typeof bookCatalogImportResponseSchema
>;
