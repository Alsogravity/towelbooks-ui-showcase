import type { TranslateOptions } from '../../i18n/format';

type NotificationsBellTranslator = (
  key: string,
  options?: TranslateOptions,
) => string;

export function getNotificationsBellAriaLabel(
  count: number,
  t: NotificationsBellTranslator,
) {
  return count > 0
    ? t('notifications.bell.unreadAria', { values: { count } })
    : t('notifications.bell.ariaLabel');
}
