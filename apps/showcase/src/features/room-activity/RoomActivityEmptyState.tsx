import { Icon } from '../../components/primitives';
import { useI18n } from '../../i18n';

export function RoomActivityEmptyState() {
  const { t } = useI18n();

  return (
    <div className="flex items-start gap-4 rounded-2xl border border-dashed border-rule/80 bg-paper/70 p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-vellum text-ink-3">
        <Icon name="feather" size={20} />
      </div>
      <div className="min-w-0">
        <p className="app-text-body font-serif text-ink">
          {t('rooms.detail.activity.emptyTitle')}
        </p>
        <p className="mt-1 text-sm leading-6 text-ink-3">
          {t('rooms.detail.activity.emptyBody')}
        </p>
      </div>
    </div>
  );
}
