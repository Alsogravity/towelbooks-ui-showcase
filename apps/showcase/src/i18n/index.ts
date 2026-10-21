export {
  APP_LOCALES,
  DEFAULT_APP_LOCALE,
  localeSelfLabels,
  type AppLocale,
  type TranslationValues,
} from './locales';
export {
  ensureLocaleMessages,
  isLocaleCatalogLoaded,
  loadEnMessages,
  messagesByLocale,
  ptBRMessages,
  type MessageKey,
} from './messages';
export { formatNotificationTimestamp } from './formatNotificationTimestamp';
export { formatLocalizedRelativeTime } from './formatLocalizedRelativeTime';
export {
  buildLocalizedSegments,
  buildTranslationSegments,
  type TranslationSegment,
} from './translationSegments';
export {
  getBrowserLocale,
  getDocumentLocale,
  getInitialLocale,
  I18nProvider,
  isCanonicalAppLocale,
  resolveBrowserLocale,
  useI18n,
  resolveLocalizedText,
  type LocalizedText,
  type Translate,
  type TranslationDescriptor,
} from './I18nProvider';
