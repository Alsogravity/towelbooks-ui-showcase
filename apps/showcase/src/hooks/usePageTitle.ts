import { useEffect } from 'react';
import { useI18n } from '../i18n';
export function usePageTitle(
  title: string | { key: string; fallback?: string },
) {
  const { t } = useI18n();
  const resolved =
    typeof title === 'string'
      ? title
      : t(title.key, { fallback: title.fallback });
  useEffect(() => {
    document.title = `${resolved} · TowelBooks UI`;
  }, [resolved]);
}
