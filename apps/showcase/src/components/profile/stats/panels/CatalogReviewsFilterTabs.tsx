import { useI18n } from '../../../../i18n';

import type { CatalogReviewsFilter } from './useCatalogReviewsPanelState';

export function CatalogReviewsFilterTabs({
  filter,
  onChange,
}: {
  filter: CatalogReviewsFilter;
  onChange: (next: CatalogReviewsFilter) => void;
}) {
  const { t } = useI18n();
  const filters: { key: CatalogReviewsFilter; label: string }[] = [
    {
      key: 'published',
      label: t('profile.catalog-reviews.filters.published'),
    },
    { key: 'drafts', label: t('profile.catalog-reviews.filters.drafts') },
  ];

  return (
    <div
      aria-label={t('profile.catalog-reviews.filters.ariaLabel')}
      className="flex flex-wrap justify-end gap-2"
      role="tablist"
    >
      {filters.map((option) => {
        const isActive = option.key === filter;

        return (
          <button
            key={option.key}
            aria-selected={isActive}
            className={[
              'rounded-full border px-4 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus-visible:ring-offset-2',
              isActive
                ? 'border-brick bg-brick-soft/20 text-ink'
                : 'border-rule bg-paper-2 text-ink-3 hover:text-ink',
            ].join(' ')}
            role="tab"
            type="button"
            onClick={() => onChange(option.key)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
