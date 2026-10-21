import { useI18n } from '../../../../i18n';
import { ButtonLink } from '../../../primitives';
import { EmptyPanel } from './EmptyPanel';

import type { CatalogReviewsFilter } from './useCatalogReviewsPanelState';

export function CatalogReviewsEmptyState({
  emptyCompact = false,
  filter,
  isOwnProfile,
}: {
  emptyCompact?: boolean;
  filter: CatalogReviewsFilter;
  isOwnProfile: boolean;
}) {
  const { t } = useI18n();

  if (filter === 'drafts') {
    return (
      <EmptyPanel
        compact={emptyCompact}
        icon="feather"
        message={t('profile.catalog-reviews.empty.drafts')}
      />
    );
  }

  if (!isOwnProfile) {
    return (
      <EmptyPanel
        compact={emptyCompact}
        icon="feather"
        message={t('profile.empty.catalog-reviews')}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-rule/60 bg-paper-2/40 px-6 py-10 text-center">
      <p className="text-sm text-ink-3">
        {t('profile.catalog-reviews.empty.ownPublished')}
      </p>
      <ButtonLink to="/catalog" variant="secondary">
        {t('profile.catalog-reviews.empty.chooseWork')}
      </ButtonLink>
    </div>
  );
}
