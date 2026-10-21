import { useQuery } from '@tanstack/react-query';

import { ProfileTabsLoadingState } from '../../ProfileTabsLoadingState';
import { EmptyPanel } from './EmptyPanel';
import { ProfilePreviewNotice } from './ProfilePreviewNotice';
import { shouldShowProfilePreviewNotice } from '../profileStatPreview';
import { useI18n } from '../../../../i18n';
import { sdk } from '../../../../lib/sdk';
import { Icon } from '../../../primitives';

export interface BooksReadPanelProps {
  emptyCompact?: boolean;
  totalCount?: number;
  username: string;
}

export function BooksReadPanel({
  emptyCompact = false,
  totalCount,
  username,
}: BooksReadPanelProps) {
  const { locale, t } = useI18n();
  const { data, isLoading } = useQuery({
    queryKey: ['profiles', username, 'books-read', locale],
    queryFn: () => sdk.users.listProfileBooksRead(username),
  });

  if (isLoading) {
    return (
      <ProfileTabsLoadingState
        icon="book-open"
        label={t('profile.booksRead.loading')}
      />
    );
  }

  const items = data?.items ?? [];

  if (items.length === 0) {
    return (
      <EmptyPanel
        compact={emptyCompact}
        icon="book-open"
        message={t('profile.empty.booksRead')}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const coverUrl = item.work.display.coverUrl;
          const author =
            item.work.contributors[0] ?? t('profile.booksRead.untitledAuthor');

          return (
            <article
              key={item.id}
              className="flex gap-3 rounded-2xl border border-rule bg-paper-2 p-3"
            >
              <div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg border border-rule bg-paper-3">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-ink-4">
                    <Icon name="book-open" size={18} strokeWidth={1.6} />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="app-text-card-title line-clamp-2 text-ink">
                  {item.work.display.title}
                </h2>
                <p className="app-text-supporting-copy mt-1 text-ink-3">
                  {t('profile.booksRead.by', { values: { author } })}
                </p>
                {item.readingSummary.completedCount > 0 ? (
                  <p className="app-text-metadata mt-2 text-ink-4">
                    {t('profile.booksRead.completedSessions', {
                      values: { count: item.readingSummary.completedCount },
                    })}
                  </p>
                ) : null}
              </div>
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
