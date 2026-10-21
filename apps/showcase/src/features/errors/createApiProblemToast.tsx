import { handleApiProblem } from './handleApiProblem';

import type { ToastInput } from '../../components/feedback';
import type { TranslationValues } from '../../i18n';

type Translate = (
  key: string,
  options?: {
    fallback?: string;
    values?: TranslationValues;
  },
) => string;

type MessageKeyMap = Partial<Record<string, string>>;

export function createApiProblemToast(
  error: unknown,
  options: {
    fallbackKey: string;
    fallback?: string;
    messageKeys?: MessageKeyMap;
    t: Translate;
    titleKey?: string;
    titleFallback?: string;
  },
): ToastInput {
  const handled = handleApiProblem(error, options);

  return {
    variant: 'error',
    title: options.t(options.titleKey ?? 'errors.toast.title', {
      fallback: options.titleFallback ?? 'Something needs attention',
    }),
    message: handled.message,
  };
}
