import { z } from 'zod';

import type { AppLocale } from '../common/app-locale.js';

/**
 * Canonical language tags stored on catalog editions. This is deliberately a
 * separate domain type from AppLocale: an edition language describes a work,
 * while an app locale describes the product UI.
 */
export const CATALOG_LANGUAGE_TAG_VALUES = [
  'pt-BR',
  'en-US',
  'es-ES',
  'fr-FR',
  'de-DE',
  'it-IT',
  'ja-JP',
  'ko-KR',
  'zh-CN',
] as const;

export type CatalogLanguageTag = (typeof CATALOG_LANGUAGE_TAG_VALUES)[number];

export const catalogLanguageTagSchema = z.enum(CATALOG_LANGUAGE_TAG_VALUES);

export const CATALOG_LANGUAGE_TAG_MAX_LENGTH = Math.max(
  ...CATALOG_LANGUAGE_TAG_VALUES.map((value) => value.length),
);

/**
 * Formats a canonical catalog language for a product locale. Regional tags
 * remain canonical for storage, while labels use the base language so the UI
 * presents generic language names (for example, Portuguese).
 */
export function formatCatalogLanguageLabel(
  language: CatalogLanguageTag | null,
  locale: AppLocale,
): string | null {
  if (language === null) {
    return null;
  }

  const languageSubtag = new Intl.Locale(language).language;

  return (
    new Intl.DisplayNames(locale, { type: 'language' }).of(languageSubtag) ??
    null
  );
}
