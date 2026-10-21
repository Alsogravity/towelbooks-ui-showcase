import { NotificationPreferencesSection } from '../../features/notifications/NotificationPreferencesSection';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useI18n } from '../../i18n';
import { SettingsSectionPageHeader } from './ui/SettingsSectionPageHeader';

export function NotificationsSettingsPage() {
  usePageTitle({
    key: 'page.settings.notifications.title',
    fallback: 'Notifications',
  });

  const { t } = useI18n();

  return (
    <div className="space-y-8">
      <SettingsSectionPageHeader title={t('settings.nav.notifications')} />

      <NotificationPreferencesSection embedded />
    </div>
  );
}
