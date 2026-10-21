import { useQuery } from '@tanstack/react-query';

import { ProfileTabsLoadingState } from '../../ProfileTabsLoadingState';
import { EmptyPanel } from './EmptyPanel';
import { ProfilePreviewNotice } from './ProfilePreviewNotice';
import { shouldShowProfilePreviewNotice } from '../profileStatPreview';
import { useI18n } from '../../../../i18n';
import { sdk } from '../../../../lib/sdk';

export interface RatingsPanelProps {
  emptyCompact?: boolean;
  totalCount?: number;
  username: string;
}

export function RatingsPanel({
  emptyCompact = false,
  totalCount,
  username,
}: RatingsPanelProps) {
  const { formatDate, t } = useI18n();
  const { data, isLoading } = useQuery({
    queryKey: ['profiles', username, 'ratings'],
    queryFn: () => sdk.users.listProfileRatings(username),
  });

  if (isLoading) {
    return (
      <ProfileTabsLoadingState
        icon="message-square-quote"
        label={t('profile.ratings.loading')}
      />
    );
  }

  const items = data?.items ?? [];

  if (items.length === 0) {
    return (
      <EmptyPanel
        compact={emptyCompact}
        icon="message-square-quote"
        message={t('profile.empty.ratings')}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        {items.map((item) => {
          return (
            <article
              key={item.id}
              className="rounded-2xl border border-rule bg-paper-2 px-4 py-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="app-text-caption text-ink-4">
                    {t('profile.ratings.catalogWork')}
                  </p>
                  <h2 className="app-text-card-title mt-1 line-clamp-2 text-ink">
                    {item.catalogWork.title}
                  </h2>
                  {item.catalogWork.subtitle ? (
                    <p className="app-text-supporting-copy mt-1 line-clamp-1 text-ink-3">
                      {item.catalogWork.subtitle}
                    </p>
                  ) : null}
                </div>
                <p className="app-text-label rounded-full border border-gold-soft/50 bg-gold-soft/10 px-3 py-1 text-ink-2">
                  {t('profile.ratings.rating', {
                    values: { rating: item.rating },
                  })}
                </p>
              </div>
              {item.note ? (
                <h3 className="app-text-row-title mt-4 text-ink">
                  {item.note}
                </h3>
              ) : null}
              {item.note ? (
                <p className="app-text-supporting-copy mt-2 line-clamp-3 text-ink-2">
                  {item.note}
                </p>
              ) : null}
              <p className="app-text-metadata mt-3 text-ink-4">
                {t('profile.ratings.writtenOn', {
                  values: { date: formatDate(item.createdAt) },
                })}
              </p>
            </article>
          );
        })}
      </div>
      {shouldShowProfilePreviewNotice(totalCount, items.length) ? (
        <ProfilePreviewNotice
          shownCount={items.length}
          totalCount={totalCount!}
        />
      ) : null}
    </div>
  );
}
