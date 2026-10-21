import { useEffect } from 'react';

import { resolveLocalizedText, type LocalizedText, useI18n } from '../i18n';

const APP_NAME = 'TowelBooks';
export const pageTitleChangeEventName = 'towelbooks:page-title-change';

export function usePageTitle(
  title: LocalizedText,
  options: { appendAppName?: boolean } = {},
) {
  const { t } = useI18n();
  const { appendAppName = true } = options;

  useEffect(() => {
    const appName = t('app.name', { fallback: APP_NAME });
    const pageTitle = resolveLocalizedText(title, t);

    document.title =
      appendAppName && pageTitle !== appName
        ? `${pageTitle} · ${appName}`
        : pageTitle;

    window.dispatchEvent(
      new CustomEvent(pageTitleChangeEventName, {
        detail: { pageTitle },
      }),
    );
  }, [appendAppName, t, title]);
}
