import { z } from 'zod';

import { utcDateTimeStringSchema } from '../common/utc-datetime.js';
import {
  containsTextUrl,
  TEXT_URL_NOT_ALLOWED_MESSAGE,
} from '../common/text-url.js';
import {
  READING_AUTHOR_MAX_LENGTH,
  READING_ISBN_MAX_LENGTH,
  READING_TITLE_MAX_LENGTH,
} from '../limits.js';
import { normalizeIdentifierFormatting } from './identifier-formatting.js';
import { parseCanonicalIsbn } from './isbn.js';
import { catalogEditionSchema } from './search.js';
import { catalogWorkProjectionSchema } from './work-projection.js';
import { catalogWorkTypeSchema } from '../enums/catalog-work.js';
import { catalogLanguageTagSchema } from './language.js';
import { supportedLocaleSchema } from './taxonomy-localization.js';
import { CONTRIBUTOR_MATCH_REASON_VALUES } from './contributor-resolution.js';

export const CONTRIBUTION_IDENTIFIER_MAX_LENGTH = READING_ISBN_MAX_LENGTH;
export const CONTRIBUTION_MAX_CONTRIBUTORS_PER_ROLE = 15;
export const CONTRIBUTION_CONTRIBUTOR_ROLE_VALUES = [
  'author',
  'editor',
  'illustrator',
  'translator',
  'narrator',
  'contributor',
] as const;
export const CONTRIBUTION_MAX_CONTRIBUTORS =
  CONTRIBUTION_MAX_CONTRIBUTORS_PER_ROLE *
  CONTRIBUTION_CONTRIBUTOR_ROLE_VALUES.length;
export const CONTRIBUTION_PREFILL_MAX_CONTRIBUTORS =
  CONTRIBUTION_MAX_CONTRIBUTORS;
export const CONTRIBUTION_PREFILL_MAX_TAXONOMY_SUGGESTIONS = 30;
export const CONTRIBUTION_PREFILL_MAX_SYNPOSIS_LENGTH = 5_000;
export const CONTRIBUTION_PREFILL_MAX_PUBLISHER_LENGTH = 500;
export const CONTRIBUTION_MAX_TAGS = 30;
export const CONTRIBUTION_MAX_CATEGORY_SLUGS = 30;
export const CONTRIBUTION_MAX_OPEN_LIBRARY_CATEGORY_KEYS = 30;
export const CONTRIBUTION_MAX_PAGE_COUNT = 1_000_000;
export const CONTRIBUTION_HUMAN_VERIFICATION_ACTION = 'catalog_contribution';
export const CONTRIBUTION_HUMAN_VERIFICATION_TOKEN_MAX_LENGTH = 2_048;

export const contributionIdentifierKindSchema = z.enum([
  'isbn10',
  'isbn13',
  'asin',
]);

export type ContributionIdentifierKind = z.infer<
  typeof contributionIdentifierKindSchema
>;

export const contributionIdentifierSchema = z
  .object({
    kind: contributionIdentifierKindSchema,
    value: z.string().min(1).max(CONTRIBUTION_IDENTIFIER_MAX_LENGTH),
  })
  .strict();

export type ContributionIdentifier = z.infer<
  typeof contributionIdentifierSchema
>;

export const contributionIdentifierRequestSchema = z
  .object({
    identifier: z
      .string()
      .trim()
      .min(1)
      .max(CONTRIBUTION_IDENTIFIER_MAX_LENGTH)
      .refine((value) => parseContributionIdentifier(value) !== null, {
        message: 'identifier must be a valid ISBN-10, ISBN-13, or ASIN.',
      }),
  })
  .strict();

export type ContributionIdentifierRequest = z.infer<
  typeof contributionIdentifierRequestSchema
>;

export const contributionContributorRoleSchema = z.enum(
  CONTRIBUTION_CONTRIBUTOR_ROLE_VALUES,
);

export type ContributionContributorRole = z.infer<
  typeof contributionContributorRoleSchema
>;

export const contributionContributorSchema = z
  .object({
    name: z.string().trim().min(1).max(READING_AUTHOR_MAX_LENGTH),
    role: contributionContributorRoleSchema,
  })
  .strict();

export type ContributionContributor = z.infer<
  typeof contributionContributorSchema
>;

export const contributionContributorExternalIdentitySchema = z
  .object({
    id: z.string().trim().min(1).max(128),
    provider: z.string().trim().min(1).max(64),
  })
  .strict();

export type ContributionContributorExternalIdentity = z.infer<
  typeof contributionContributorExternalIdentitySchema
>;

const contributionContributorMatchParticipantSchema = z
  .object({
    canonical: contributionContributorSchema,
    clusterId: z.string().min(1).max(128),
    members: z
      .array(
        contributionContributorSchema.extend({
          externalIdentity:
            contributionContributorExternalIdentitySchema.nullable(),
          isExisting: z.boolean(),
          source: z.string().trim().min(1).max(64).nullable(),
        }),
      )
      .min(1)
      .max(CONTRIBUTION_PREFILL_MAX_CONTRIBUTORS),
  })
  .strict();

export const contributionPossibleContributorMatchSchema = z
  .object({
    confidence: z.literal('possible'),
    id: z.string().min(1).max(256),
    left: contributionContributorMatchParticipantSchema,
    reason: z.enum(CONTRIBUTOR_MATCH_REASON_VALUES),
    right: contributionContributorMatchParticipantSchema,
  })
  .strict();

export type ContributionPossibleContributorMatch = z.infer<
  typeof contributionPossibleContributorMatchSchema
>;

// Kept below the bounded prefill contributor count so one provider response
// cannot turn the review surface into an unbounded pair list.
export const CONTRIBUTION_PREFILL_MAX_POSSIBLE_MATCHES =
  CONTRIBUTION_PREFILL_MAX_CONTRIBUTORS;

const contributionPrefillText = (max: number) => z.string().max(max).nullable();

export const contributionTaxonomyCategoryOptionSchema = z
  .object({
    displayName: z.string().min(1).max(120),
    displayNameLocale: supportedLocaleSchema,
    slug: z.string().min(1).max(120),
  })
  .strict();

export type ContributionTaxonomyCategoryOption = z.infer<
  typeof contributionTaxonomyCategoryOptionSchema
>;

export const contributionTaxonomyUnmatchedLabelSchema = z
  .object({
    displayName: z.string().min(1).max(240),
    normalizedKey: z
      .string()
      .min(1)
      .max(160)
      .regex(/^[a-z0-9]+(?: [a-z0-9]+)*$/u),
  })
  .strict();

export type ContributionTaxonomyUnmatchedLabel = z.infer<
  typeof contributionTaxonomyUnmatchedLabelSchema
>;

export const contributionTaxonomySuggestionsSchema = z
  .object({
    categories: z.array(contributionTaxonomyCategoryOptionSchema).max(30),
    unmatchedLabels: z.array(contributionTaxonomyUnmatchedLabelSchema).max(30),
  })
  .strict();

export type ContributionTaxonomySuggestions = z.infer<
  typeof contributionTaxonomySuggestionsSchema
>;

export const contributionCoverReferenceSchema = z
  .object({
    editionOlid: z.string().max(128).nullable(),
    openLibraryCoverId: z.string().max(128).nullable(),
    thumbnailUrl: z.string().url().nullable(),
    url: z.string().url().nullable(),
  })
  .strict();

export type ContributionCoverReference = z.infer<
  typeof contributionCoverReferenceSchema
>;

export const contributionPrefillSchema = z
  .object({
    contributors: z
      .array(contributionContributorSchema)
      .max(CONTRIBUTION_PREFILL_MAX_CONTRIBUTORS),
    cover: contributionCoverReferenceSchema.nullable(),
    editionNumber: contributionPrefillText(80),
    language: catalogLanguageTagSchema.nullable(),
    pageCount: z.number().int().positive().nullable(),
    publicationDate: utcDateTimeStringSchema.nullable(),
    publisher: contributionPrefillText(
      CONTRIBUTION_PREFILL_MAX_PUBLISHER_LENGTH,
    ),
    possibleContributorMatches: z
      .array(contributionPossibleContributorMatchSchema)
      .max(CONTRIBUTION_PREFILL_MAX_POSSIBLE_MATCHES)
      .optional(),
    seriesOrCollection: contributionPrefillText(240),
    synopsis: contributionPrefillText(CONTRIBUTION_PREFILL_MAX_SYNPOSIS_LENGTH),
    subtitle: contributionPrefillText(READING_TITLE_MAX_LENGTH),
    taxonomySuggestions: contributionTaxonomySuggestionsSchema,
    title: contributionPrefillText(READING_TITLE_MAX_LENGTH),
  })
  .strict();

export type ContributionPrefill = z.infer<typeof contributionPrefillSchema>;

export const contributionProviderEvidenceSchema = z
  .object({
    editionId: z.string().max(128).nullable(),
    provider: z.literal('open_library'),
    status: z.enum(['found', 'not_found', 'unavailable']),
    workId: z.string().max(128).nullable(),
  })
  .strict();

export type ContributionProviderEvidence = z.infer<
  typeof contributionProviderEvidenceSchema
>;

export const contributionResolutionSchema = z.enum([
  'blocked_existing',
  'existing_edition',
  'new_edition_existing_work',
  'new_work',
]);

export type ContributionResolution = z.infer<
  typeof contributionResolutionSchema
>;

const contributionLocalEditionSchema = catalogEditionSchema.extend({
  asin: z.string().nullable(),
});

const contributionLocalWorkProjectionSchema =
  catalogWorkProjectionSchema.extend({
    display: catalogWorkProjectionSchema.shape.display.extend({
      language: catalogLanguageTagSchema.nullable(),
    }),
    tags: z.array(z.string()).max(30),
  });

export const contributionLocalProjectionSchema = z
  .object({
    edition: contributionLocalEditionSchema.nullable(),
    work: contributionLocalWorkProjectionSchema,
  })
  .strict();

export type ContributionLocalProjection = z.infer<
  typeof contributionLocalProjectionSchema
>;

export const contributionResolutionResponseSchema = z
  .object({
    identifier: contributionIdentifierSchema,
    local: contributionLocalProjectionSchema.nullable(),
    prefill: contributionPrefillSchema,
    providerEvidence: contributionProviderEvidenceSchema.nullable(),
    resolution: contributionResolutionSchema,
  })
  .strict()
  .superRefine((response, context) => {
    if (response.resolution === 'blocked_existing' && response.local !== null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'blocked_existing responses must not expose a local projection',
        path: ['local'],
      });
    }

    if (
      (response.resolution === 'existing_edition' ||
        response.resolution === 'new_edition_existing_work') &&
      response.local === null
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${response.resolution} responses require a local projection`,
        path: ['local'],
      });
    }
  });

export type ContributionResolutionResponse = z.infer<
  typeof contributionResolutionResponseSchema
>;

const contributionOptionalText = (max: number) =>
  z.string().trim().min(1).max(max).nullable().optional();

export const contributionRequestSchema = z
  .object({
    contributors: z
      .array(contributionContributorSchema)
      .max(CONTRIBUTION_MAX_CONTRIBUTORS),
    categorySlugs: z
      .array(z.string().trim().min(1).max(120))
      .max(CONTRIBUTION_MAX_CATEGORY_SLUGS),
    coverMediaAssetId: z.string().uuid().nullable().optional(),
    editionNumber: contributionOptionalText(80),
    identifier: z
      .string()
      .trim()
      .min(1)
      .max(CONTRIBUTION_IDENTIFIER_MAX_LENGTH)
      .refine((value) => parseContributionIdentifier(value) !== null, {
        message: 'identifier must be a valid ISBN-10, ISBN-13, or ASIN.',
      }),
    humanVerificationToken: z
      .string()
      .min(1)
      .max(CONTRIBUTION_HUMAN_VERIFICATION_TOKEN_MAX_LENGTH)
      .optional(),
    imprint: contributionOptionalText(240),
    openLibraryCategoryKeys: z
      .array(
        z
          .string()
          .trim()
          .min(1)
          .max(160)
          .regex(/^[a-z0-9]+(?: [a-z0-9]+)*$/u),
      )
      .max(CONTRIBUTION_MAX_OPEN_LIBRARY_CATEGORY_KEYS),
    language: catalogLanguageTagSchema.nullable().optional(),
    pageCount: z
      .number()
      .int()
      .positive()
      .max(CONTRIBUTION_MAX_PAGE_COUNT)
      .nullable()
      .optional(),
    publicationDate: utcDateTimeStringSchema.nullable().optional(),
    publisher: contributionOptionalText(
      CONTRIBUTION_PREFILL_MAX_PUBLISHER_LENGTH,
    ),
    seriesOrCollection: contributionOptionalText(240),
    subtitle: contributionOptionalText(READING_TITLE_MAX_LENGTH),
    synopsis: contributionOptionalText(
      CONTRIBUTION_PREFILL_MAX_SYNPOSIS_LENGTH,
    ).refine(
      (value) =>
        value === undefined || value === null || !containsTextUrl(value),
      { message: TEXT_URL_NOT_ALLOWED_MESSAGE },
    ),
    tags: z.array(z.string().trim().min(1).max(80)).max(CONTRIBUTION_MAX_TAGS),
    title: z.string().trim().min(1).max(READING_TITLE_MAX_LENGTH),
    type: catalogWorkTypeSchema.optional(),
    volume: contributionOptionalText(80),
  })
  .strict();

export type ContributionRequest = z.infer<typeof contributionRequestSchema>;

export const contributionOutcomeSchema = z.enum([
  'edition_reused',
  'edition_created',
  'work_created',
]);

export type ContributionOutcome = z.infer<typeof contributionOutcomeSchema>;

export const contributionResponseSchema = z
  .object({
    catalogEditionId: z.string().min(1),
    catalogWorkId: z.string().min(1),
    local: contributionLocalProjectionSchema,
    outcome: contributionOutcomeSchema,
  })
  .strict();

export type ContributionResponse = z.infer<typeof contributionResponseSchema>;

/**
 * Parses the single contribution ISBN/ASIN field. ISBN interpretation is
 * deliberately attempted first so a checksum-valid ISBN-10 cannot become an
 * ASIN merely because it is ten characters long.
 */
export function parseContributionIdentifier(
  input: unknown,
): ContributionIdentifier | null {
  if (typeof input !== 'string') {
    return null;
  }

  const isbn = parseCanonicalIsbn(input);

  if (isbn) {
    return isbn;
  }

  const asin = normalizeAsin(input);

  return asin ? { kind: 'asin', value: asin } : null;
}

export function normalizeAsin(input: unknown): string | null {
  if (typeof input !== 'string') {
    return null;
  }

  const normalized = normalizeIdentifierFormatting(input)
    .replace(/-/g, '')
    .toUpperCase();

  return /^[A-Z0-9]{10}$/.test(normalized) ? normalized : null;
}
