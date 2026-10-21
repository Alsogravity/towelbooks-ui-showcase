import { Icon } from '../../components/primitives';
import { useI18n } from '../../i18n';

export function NotificationEmptyState() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center gap-3 rounded-[var(--radius-paper-4)] border border-dashed border-ink-6 px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-paper-2 text-ink-3">
        <Icon name="bell" size={24} />
      </span>
      <div className="space-y-1">
        <p className="text-base font-semibold text-ink">
          {t('notifications.empty.title')}
        </p>
        <p className="text-sm text-ink-3">{t('notifications.empty.body')}</p>
      </div>
    </div>
  );
}
