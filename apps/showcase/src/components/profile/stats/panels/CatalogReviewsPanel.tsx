import { ProfileTabsLoadingState } from '../../ProfileTabsLoadingState';
import { CatalogReviewsEmptyState } from './CatalogReviewsEmptyState';
import { CatalogReviewsFilterTabs } from './CatalogReviewsFilterTabs';
import { EmptyPanel } from './EmptyPanel';
import { ProfileCatalogReviewCard } from './ProfileCatalogReviewCard';
import { ProfilePreviewNotice } from './ProfilePreviewNotice';
import { useCatalogReviewsPanelState } from './useCatalogReviewsPanelState';
import { shouldShowProfilePreviewNotice } from '../profileStatPreview';
import { useI18n } from '../../../../i18n';
import { Alert } from '../../../primitives';

export interface CatalogReviewsPanelProps {
  emptyCompact?: boolean;
  totalCount?: number;
  username: string;
  isOwnProfile?: boolean;
}

export function CatalogReviewsPanel({
  emptyCompact = false,
  isOwnProfile = false,
  totalCount,
  username,
}: CatalogReviewsPanelProps) {
  const { t } = useI18n();
  const {
    filter,
    isDraftsLoadError,
    isLoading,
    isPublishedLoadError,
    items,
    publishedQuery,
    setFilter,
  } = useCatalogReviewsPanelState({ isOwnProfile, username });

  if (!isOwnProfile) {
    if (publishedQuery.isLoading) {
      return (
        <ProfileTabsLoadingState
          icon="feather"
          label={t('profile.catalog-reviews.loading')}
        />
      );
    }

    if (publishedQuery.error != null) {
      return (
        <Alert variant="error">
          {t('profile.catalog-reviews.error.loadPublished')}
        </Alert>
      );
    }

    const publishedItems = publishedQuery.items;

    if (publishedItems.length === 0) {
      return (
        <EmptyPanel
          compact={emptyCompact}
          icon="feather"
          message={t('profile.empty.catalog-reviews')}
        />
      );
    }

    return (
      <div className="flex flex-col gap-4">
        {publishedItems.map((item) => (
          <ProfileCatalogReviewCard
            key={item.id}
            item={item}
            profileUsername={username}
          />
        ))}
        {shouldShowProfilePreviewNotice(totalCount, publishedItems.length) ? (
          <ProfilePreviewNotice
            shownCount={publishedItems.length}
            totalCount={totalCount!}
          />
        ) : null}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <CatalogReviewsFilterTabs filter={filter} onChange={setFilter} />
        <ProfileTabsLoadingState
          icon="feather"
          label={t('profile.catalog-reviews.loading')}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <CatalogReviewsFilterTabs filter={filter} onChange={setFilter} />

      {isDraftsLoadError ? (
        <Alert variant="error">
          {t('profile.catalog-reviews.error.loadDrafts')}
        </Alert>
      ) : null}

      {isPublishedLoadError ? (
        <Alert variant="error">
          {t('profile.catalog-reviews.error.loadPublished')}
        </Alert>
      ) : items.length === 0 ? (
        <CatalogReviewsEmptyState
          emptyCompact={emptyCompact}
          filter={filter}
          isOwnProfile={isOwnProfile}
        />
      ) : (
        <>
          {items.map((item) => (
            <ProfileCatalogReviewCard
              key={item.id}
              item={item}
              profileUsername={username}
            />
          ))}
          {filter === 'published' &&
          shouldShowProfilePreviewNotice(totalCount, items.length) ? (
            <ProfilePreviewNotice
              shownCount={items.length}
              totalCount={totalCount!}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
