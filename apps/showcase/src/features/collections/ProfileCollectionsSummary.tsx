import { ErrorState, LoadingState } from '../../components/feedback';
import { Button } from '../../components/primitives';
import { useI18n } from '../../i18n';
import { CollectionSummaryRow } from './CollectionSummaryRow';
import {
  PROFILE_COLLECTIONS_PREVIEW_LIMIT,
  useProfileCollections,
} from './queries';

type ProfileCollectionsSummaryProps = {
  username: string;
  viewerUserId?: string | null;
};

export function ProfileCollectionsSummary({
  username,
  viewerUserId = null,
}: ProfileCollectionsSummaryProps) {
  const { t } = useI18n();
  const collectionsQuery = useProfileCollections({
    limit: PROFILE_COLLECTIONS_PREVIEW_LIMIT,
    username,
    viewerUserId,
  });

  return (
    <section
      aria-labelledby="profile-collections-title"
      className="mt-8 border-t border-rule/70 pt-6"
    >
      <div>
        <h2
          className="app-text-section-title m-0 text-ink"
          id="profile-collections-title"
        >
          {t('profile.collections.title')}
        </h2>
        <p className="app-text-body mt-1 text-ink-3">
          {t('profile.collections.description')}
        </p>
      </div>

      <div className="mt-3">
        {collectionsQuery.isFetching ? (
          <LoadingState label={{ key: 'profile.collections.loading' }} />
        ) : collectionsQuery.isError ? (
          <ErrorState
            body={{ key: 'profile.collections.error.body' }}
            title={{ key: 'profile.collections.error.title' }}
            action={
              <Button
                onClick={() => void collectionsQuery.refetch()}
                type="button"
                variant="secondary"
              >
                {t('profile.collections.retry')}
              </Button>
            }
          />
        ) : collectionsQuery.data?.items.length ? (
          <ul className="flex list-none flex-col gap-4 p-0" role="list">
            {collectionsQuery.data.items.map((collection) => (
              <CollectionSummaryRow
                collection={collection}
                key={collection.id}
              />
            ))}
          </ul>
        ) : (
          <p className="app-text-body border-y border-rule/70 py-4 text-ink-3">
            {t('profile.collections.empty')}
          </p>
        )}
      </div>
    </section>
  );
}
