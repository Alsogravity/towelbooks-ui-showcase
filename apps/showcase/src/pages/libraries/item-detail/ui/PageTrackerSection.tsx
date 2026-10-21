import { Button, FormField, Input } from '../../../../components/primitives';
import { useI18n } from '../../../../i18n';
import { LibrarySection } from '../../ui/LibrarySection';

interface PageTrackerSectionProps {
  currentPage: string;
  isSaving: boolean;
  lastUpdated: string;
  onCurrentPageChange: (value: string) => void;
  onUpdate: () => void;
  totalPages: string;
}

export function PageTrackerSection({
  currentPage,
  isSaving,
  lastUpdated,
  onCurrentPageChange,
  onUpdate,
  totalPages,
}: PageTrackerSectionProps) {
  const { t, formatDateTime } = useI18n();
  const current = Number(currentPage) || 0;
  const total = Number(totalPages) || 0;
  const percentage =
    total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  const segmentValues = Array.from({ length: 4 }, (_, index) =>
    Math.max(0, Math.min(25, percentage - index * 25)),
  );

  return (
    <LibrarySection
      icon="square-chart-gantt"
      title={t('myLibrary.items.progress.question')}
    >
      <div className="rounded-2xl border border-rule/30 bg-paper-2/40 p-8 shadow-sm">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-2 lg:max-w-md">
            <FormField
              label={t('myLibrary.items.progress.currentPage')}
              htmlFor="current-page"
            >
              <Input
                id="current-page"
                type="number"
                min={0}
                className="bg-vellum/50"
                value={currentPage}
                onChange={(event) => onCurrentPageChange(event.target.value)}
              />
            </FormField>

            <FormField
              label={t('myLibrary.items.progress.totalPages')}
              htmlFor="total-pages"
            >
              <Input
                id="total-pages"
                type="number"
                min={0}
                className="bg-vellum/50"
                value={totalPages}
                readOnly
              />
            </FormField>
          </div>

          <div className="text-center lg:text-right">
            <div className="inline-flex flex-col items-center lg:items-end">
              <div className="flex items-baseline gap-1">
                <span className="text-6xl font-display font-bold leading-none text-ink">
                  {percentage}
                </span>
                <span className="app-text-stat-value font-display text-ink-3">
                  %
                </span>
              </div>
              <span className="app-text-caption mt-1 font-bold uppercase tracking-[0.2em] text-ink-3">
                {t('myLibrary.items.progress.complete')}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 space-y-4">
          <div className="grid grid-cols-4 divide-x divide-rule/20 overflow-hidden rounded-full border border-rule/20 bg-paper-2">
            {segmentValues.map((segmentValue, index) => (
              <div key={index} className="min-w-0">
                <progress
                  className="app-progress app-progress--sm app-progress--forest rounded-none bg-transparent"
                  max={25}
                  value={segmentValue}
                  aria-valuemax={25}
                  aria-valuemin={0}
                  aria-valuenow={segmentValue}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="mono app-text-metadata font-medium text-ink-3">
                {t('myLibrary.items.progress.status', {
                  values: { current, total },
                })}
              </p>
            </div>

            <div className="text-right">
              <p className="app-text-caption mb-4 italic text-ink-4">
                {t('myLibrary.items.progress.lastUpdated', {
                  values: { date: formatDateTime(new Date(lastUpdated)) },
                })}
              </p>

              <Button
                variant="primary"
                size="sm"
                className="rounded-md px-6 shadow-sm"
                prependIcon="pencil-line"
                isLoading={isSaving}
                onClick={onUpdate}
              >
                {t('myLibrary.items.progress.update')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </LibrarySection>
  );
}
