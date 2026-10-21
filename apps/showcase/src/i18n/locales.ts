import type { AppLocale } from '@towelbooks/schemas';

export {
  APP_LOCALES,
  DEFAULT_APP_LOCALE,
  type AppLocale,
} from '@towelbooks/schemas';

export type TranslationValues = Record<string, number | string>;

export const localeSelfLabels: Record<AppLocale, string> = {
  'pt-BR': 'Português (Brasil)',
  'en-US': 'English',
};
