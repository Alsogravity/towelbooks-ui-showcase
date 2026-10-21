import type { AppLocale } from '../../i18n';

export const homeCatalogQueryRoot = ['catalog', 'home'] as const;

export function homeCatalogQueryKey(locale: AppLocale) {
  return [...homeCatalogQueryRoot, locale] as const;
}

export function catalogWorkDetailQueryKey(
  catalogWorkId: string,
  locale: AppLocale,
) {
  return ['catalog', 'works', catalogWorkId, locale] as const;
}
