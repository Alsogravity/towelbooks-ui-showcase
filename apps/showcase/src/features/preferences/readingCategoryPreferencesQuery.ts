import type { AppLocale } from '../../i18n';

export const READING_CATEGORY_PREFERENCES_QUERY_ROOT =
  'reading-category-preferences' as const;

export const ACTIVE_TAXONOMY_QUERY_KEY = 'active' as const;

export function readingCategoryPreferencesQueryKey(locale: AppLocale) {
  return [
    'users',
    'me',
    READING_CATEGORY_PREFERENCES_QUERY_ROOT,
    locale,
  ] as const;
}

export function activeTaxonomyCategoriesQueryKey(locale: AppLocale) {
  return ['catalog', 'taxonomy', ACTIVE_TAXONOMY_QUERY_KEY, locale] as const;
}
