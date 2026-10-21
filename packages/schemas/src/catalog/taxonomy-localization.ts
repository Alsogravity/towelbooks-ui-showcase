import { z } from 'zod';

/**
 * Catalog taxonomy localization contract (issue #896).
 *
 * Category identity remains the slug. This module owns the locale and
 * translation contracts used by future Catalog, Admin, Web, seed, snapshot,
 * and cross-domain reader implementations. It deliberately does not reuse
 * `AppLocale`: the current product UI locale is a persisted account concern,
 * while taxonomy presentation is content owned by Catalog.
 */

/** Maximum accepted length for a locale tag before BCP 47 parsing. */
export const LOCALE_TAG_MAX_LENGTH = 100;

/** Maximum human-facing label length for one category translation. */
export const CATEGORY_TRANSLATION_LABEL_MAX_LENGTH = 120;

/**
 * Application locales that may have category translations. This is a shared
 * code source of truth, not a Prisma enum, so adding a locale does not require
 * a database schema migration. Keep values canonical BCP 47 tags.
 */
export const SUPPORTED_LOCALES = ['en', 'es', 'pt', 'pt-BR', 'pt-PT'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/** The one required translation for every category. */
export const DEFAULT_LOCALE: SupportedLocale = 'en';

/**
 * A canonical BCP 47 locale tag. Parsing trims input and canonicalizes
 * casing/subtag form through the platform Intl implementation (for example,
 * ` pt-br ` becomes `pt-BR`). Unsupported-but-valid tags remain valid here;
 * the supported application locale schema below applies the allowlist when a
 * category translation is being authored or stored.
 */
export function normalizeLocale(value: string): string {
  const trimmedValue = value.trim();

  if (
    trimmedValue.length === 0 ||
    trimmedValue.length > LOCALE_TAG_MAX_LENGTH
  ) {
    throw new RangeError('Invalid BCP 47 locale tag.');
  }

  try {
    const locale = new Intl.Locale(trimmedValue);

    if (locale.language.length === 0) {
      throw new RangeError('Invalid BCP 47 locale tag.');
    }

    return locale.toString();
  } catch {
    throw new RangeError('Invalid BCP 47 locale tag.');
  }
}

/** Runtime-validating canonical BCP 47 locale schema. */
export const localeSchema = z.string().transform((value, context) => {
  try {
    return normalizeLocale(value);
  } catch {
    context.addIssue({
      code: 'custom',
      message: 'Must be a valid BCP 47 locale tag.',
    });
    return z.NEVER;
  }
});

export type Locale = z.infer<typeof localeSchema>;

/** Runtime-validating schema for the application-supported locale set. */
export const supportedLocaleSchema = localeSchema.pipe(
  z.enum(SUPPORTED_LOCALES),
);

/**
 * Returns the only fallback chain used for category presentation:
 * exact locale, primary language, then the default locale. Duplicate entries
 * are removed while preserving order.
 */
export function getLocaleFallbackChain(requestedLocale: string): Locale[] {
  const normalizedLocale = localeSchema.parse(requestedLocale);
  const baseLanguage = normalizeLocale(
    new Intl.Locale(normalizedLocale).language,
  );

  return [...new Set([normalizedLocale, baseLanguage, DEFAULT_LOCALE])];
}

/** One stored category translation. Identity is `(categoryId, locale)`. */
export const categoryTranslationSchema = z
  .object({
    label: z.string().trim().min(1).max(CATEGORY_TRANSLATION_LABEL_MAX_LENGTH),
    locale: supportedLocaleSchema,
  })
  .strict();

export type CategoryTranslation = z.infer<typeof categoryTranslationSchema>;

/**
 * The translation set invariant for one category: locales are unique and the
 * default locale is always present. A category never has an empty translation
 * set and never needs a label stored on Category itself.
 */
export const categoryTranslationSetSchema = z
  .array(categoryTranslationSchema)
  .min(1)
  .superRefine((translations, context) => {
    const seenLocales = new Set<SupportedLocale>();

    translations.forEach((translation, index) => {
      if (seenLocales.has(translation.locale)) {
        context.addIssue({
          code: 'custom',
          message: 'Each category translation locale must be unique.',
          path: [index, 'locale'],
        });
      }

      seenLocales.add(translation.locale);
    });

    if (!seenLocales.has(DEFAULT_LOCALE)) {
      context.addIssue({
        code: 'custom',
        message: `Every category must have a ${DEFAULT_LOCALE} translation.`,
        path: [],
      });
    }
  });

export type CategoryTranslationSet = z.infer<
  typeof categoryTranslationSetSchema
>;

/**
 * The ordinary reader projection. Readers receive one label and the locale
 * that supplied it, never the category's complete translation set.
 */
export const resolvedCategoryTranslationSchema = z
  .object({
    effectiveLocale: supportedLocaleSchema,
    label: z.string().min(1).max(CATEGORY_TRANSLATION_LABEL_MAX_LENGTH),
  })
  .strict();

export type ResolvedCategoryTranslation = z.infer<
  typeof resolvedCategoryTranslationSchema
>;

/** Raised when invalid taxonomy data violates the required default locale. */
export class MissingDefaultLocaleTranslationError extends Error {
  constructor() {
    super(`Category translations must include the ${DEFAULT_LOCALE} locale.`);
    this.name = 'MissingDefaultLocaleTranslationError';
  }
}

/**
 * Resolves one reader label using the canonical fallback chain. The input is
 * expected to satisfy categoryTranslationSetSchema; a missing default is an
 * invariant violation and therefore fails loudly rather than inventing a
 * second fallback source.
 */
export function resolveCategoryTranslation(
  translations: readonly CategoryTranslation[],
  requestedLocale: string,
): ResolvedCategoryTranslation {
  for (const locale of getLocaleFallbackChain(requestedLocale)) {
    const translation = translations.find(
      (candidate) => candidate.locale === locale,
    );

    if (translation) {
      return {
        effectiveLocale: translation.locale,
        label: translation.label,
      };
    }
  }

  throw new MissingDefaultLocaleTranslationError();
}

/** Shared Admin response shape for the full translation set of one category. */
export const adminCategoryTranslationSetSchema = z
  .object({
    categoryId: z.string().uuid(),
    translations: categoryTranslationSetSchema,
  })
  .strict();

export type AdminCategoryTranslationSet = z.infer<
  typeof adminCategoryTranslationSetSchema
>;

/** Shared Admin create contract for one `(categoryId, locale)` translation. */
export const createCategoryTranslationRequestSchema = z
  .object({
    categoryId: z.string().uuid(),
    label: z.string().trim().min(1).max(CATEGORY_TRANSLATION_LABEL_MAX_LENGTH),
    locale: supportedLocaleSchema,
  })
  .strict();

export type CreateCategoryTranslationRequest = z.infer<
  typeof createCategoryTranslationRequestSchema
>;

/** Shared Admin upsert contract for one `(categoryId, locale)` translation. */
export const upsertCategoryTranslationRequestSchema = z
  .object({
    categoryId: z.string().uuid(),
    label: z.string().trim().min(1).max(CATEGORY_TRANSLATION_LABEL_MAX_LENGTH),
    locale: supportedLocaleSchema,
  })
  .strict();

export type UpsertCategoryTranslationRequest = z.infer<
  typeof upsertCategoryTranslationRequestSchema
>;

/**
 * Shared Admin delete contract. Deleting the default translation is never a
 * valid request; deleting another locale still leaves the category's required
 * default translation untouched.
 */
export const deleteCategoryTranslationRequestSchema = z
  .object({
    categoryId: z.string().uuid(),
    locale: supportedLocaleSchema,
  })
  .strict()
  .superRefine((request, context) => {
    if (request.locale === DEFAULT_LOCALE) {
      context.addIssue({
        code: 'custom',
        message: `The ${DEFAULT_LOCALE} category translation cannot be deleted.`,
        path: ['locale'],
      });
    }
  });

export type DeleteCategoryTranslationRequest = z.infer<
  typeof deleteCategoryTranslationRequestSchema
>;

/** One portable snapshot translation embedded in its category. */
export const taxonomySnapshotCategoryTranslationSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(1)
      .max(CATEGORY_TRANSLATION_LABEL_MAX_LENGTH),
    locale: supportedLocaleSchema,
  })
  .strict();

export type TaxonomySnapshotCategoryTranslation = z.infer<
  typeof taxonomySnapshotCategoryTranslationSchema
>;

/** The complete portable translation set for one category. */
export const taxonomySnapshotCategoryTranslationSetSchema = z
  .array(taxonomySnapshotCategoryTranslationSchema)
  .min(1)
  .superRefine((translations, context) => {
    const seenLocales = new Set<SupportedLocale>();

    translations.forEach((translation, index) => {
      if (seenLocales.has(translation.locale)) {
        context.addIssue({
          code: 'custom',
          message: 'Each category snapshot translation locale must be unique.',
          path: [index, 'locale'],
        });
      }
      seenLocales.add(translation.locale);
    });

    if (!seenLocales.has(DEFAULT_LOCALE)) {
      context.addIssue({
        code: 'custom',
        message: `Every category snapshot must have a ${DEFAULT_LOCALE} translation.`,
        path: [],
      });
    }
  });

export type TaxonomySnapshotCategoryTranslationSet = z.infer<
  typeof taxonomySnapshotCategoryTranslationSetSchema
>;
