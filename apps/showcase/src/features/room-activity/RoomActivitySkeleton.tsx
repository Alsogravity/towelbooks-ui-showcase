import { useI18n } from '../../i18n';

export function RoomActivitySkeleton() {
  const { t } = useI18n();

  return (
    <div
      aria-label={t('rooms.detail.activity.loading')}
      className="space-y-6"
      role="status"
    >
      {[0, 1, 2].map((item) => (
        <div className="flex items-center gap-4" key={item}>
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-vellum" />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="h-4 w-2/3 animate-pulse rounded bg-vellum" />
            <div className="h-3 w-32 animate-pulse rounded bg-vellum/80" />
            <div className="h-16 w-full animate-pulse rounded-xl bg-vellum/70" />
          </div>
        </div>
      ))}
    </div>
  );
}
