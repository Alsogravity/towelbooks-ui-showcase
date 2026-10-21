import { Link } from 'react-router';

import { Tag } from '../../../components/primitives';
import {
  CatalogCoverMedia,
  CatalogCoverSkeleton,
  catalogCoverSourcesFromUrl,
} from '../../reading/ui';
import { UserAvatar } from '../../user/ui';
import { useI18n } from '../../../i18n';

import type { CatalogReviewSummary } from '@towelbooks/schemas';
import type { ReactNode } from 'react';

type CatalogReviewCardAuthor = Pick<
  CatalogReviewSummary['author'],
  'avatar' | 'displayName' | 'username'
>;

type CatalogReviewCardWork = Pick<
  CatalogReviewSummary['catalogWork'],
  'id' | 'title'
> &
  Partial<
    Pick<
      CatalogReviewSummary['catalogWork'],
      'coverGeometry' | 'coverThumbnailUrl' | 'coverUrl' | 'subtitle' | 'type'
    >
  >;

export interface CatalogReviewCardProps {
  author: CatalogReviewCardAuthor;
  catalogEdition?: CatalogReviewSummary['catalogEdition'];
  catalogWork: CatalogReviewCardWork;
  commentCount?: number;
  dateLabel: ReactNode;
  excerpt: string | null;
  href: string;
  linkState?: unknown;
  rightTag?: ReactNode;
  title: string;
  workHref: string;
  workTypeLabel?: string;
}

export function CatalogReviewCard({
  author,
  catalogEdition,
  catalogWork,
  commentCount,
  dateLabel,
  excerpt,
  href,
  linkState,
  rightTag,
  title,
  workHref,
  workTypeLabel,
}: CatalogReviewCardProps) {
  const { formatNumber, t } = useI18n();
  const authorName = author.displayName?.trim() || `@${author.username}`;
  const coverAlt = t('catalog.catalogReviewCard.coverAlt', {
    values: { title: catalogWork.title },
  });
  const commentLabel =
    commentCount === undefined
      ? null
      : t(
          commentCount === 1
            ? 'catalog.catalogReviewCard.comments.one'
            : 'catalog.catalogReviewCard.comments.other',
          { values: { count: formatNumber(commentCount) } },
        );

  return (
    <article className="rounded-2xl border border-rule bg-paper-2 px-4 py-4 transition-colors hover:border-brick/40 hover:bg-vellum/60 sm:px-5">
      <div className="flex min-w-0 gap-4">
        <Link
          aria-label={t('catalog.catalogReviewCard.workLink', {
            values: { title: catalogWork.title },
          })}
          className="block shrink-0 self-start overflow-hidden rounded-sm bg-vellum/20 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus-visible:ring-offset-2"
          to={workHref}
        >
          <CatalogCoverMedia
            alt={coverAlt}
            author={authorName}
            fit="cover"
            imageClassName="h-full w-full object-cover"
            size="sm"
            sources={catalogCoverSourcesFromUrl(
              catalogWork.coverUrl,
              catalogWork.coverThumbnailUrl,
              catalogWork.coverGeometry,
            )}
            theme={(catalogWork.title.codePointAt(0) ?? 0) % 7}
            title={catalogWork.title}
          />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h3 className="app-text-card-title min-w-0 flex-1 break-words text-ink">
              <Link
                className="rounded-sm underline-offset-2 hover:text-brick hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus-visible:ring-offset-2"
                state={linkState}
                to={href}
              >
                {title}
              </Link>
            </h3>
            {rightTag ? <Tag variant="paused">{rightTag}</Tag> : null}
          </div>

          <div className="mt-2 flex min-w-0 items-center gap-2">
            <Link
              aria-label={t('catalog.catalogReviewCard.authorLink', {
                values: { username: author.username },
              })}
              className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus-visible:ring-offset-2"
              to={`/${encodeURIComponent(author.username)}`}
            >
              <UserAvatar
                avatar={author.avatar}
                displayName={authorName}
                size="xs"
              />
            </Link>
            <p className="app-text-supporting-copy min-w-0 truncate text-ink-3">
              <span>{t('catalog.catalogReviewCard.byline')} </span>
              <Link
                className="text-brick underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus-visible:ring-offset-2"
                to={`/${encodeURIComponent(author.username)}`}
              >
                {authorName}
              </Link>
              <span className="text-ink-4">@{author.username}</span>
            </p>
          </div>

          <p className="app-text-supporting-copy mt-3 line-clamp-3 text-ink-2">
            {excerpt ?? t('catalog.catalogReviewCard.noExcerpt')}
          </p>

          <div className="app-text-metadata mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-ink-4">
            <Link
              className="text-brick underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus-visible:ring-offset-2"
              to={workHref}
            >
              {workTypeLabel ? `${workTypeLabel} · ` : null}
              {catalogWork.title}
            </Link>
            {catalogEdition ? (
              <>
                <span aria-hidden>·</span>
                <span>{catalogEdition.title}</span>
              </>
            ) : null}
            <span aria-hidden>·</span>
            <span>{dateLabel}</span>
            {commentLabel ? (
              <>
                <span aria-hidden>·</span>
                <Link
                  aria-label={commentLabel}
                  className="text-brick underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus-visible:ring-offset-2"
                  state={linkState}
                  to={href}
                >
                  {commentLabel}
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

export function CatalogReviewCardSkeleton() {
  return (
    <article
      aria-hidden="true"
      className="rounded-2xl border border-rule bg-paper-2 px-4 py-4 sm:px-5"
    >
      <div className="flex min-w-0 gap-4">
        <CatalogCoverSkeleton className="w-[118px] shrink-0 rounded-sm" />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="h-5 w-3/4 rounded-sm app-shimmer" />
          <div className="h-4 w-1/3 rounded-sm app-shimmer" />
          <div className="h-4 w-full rounded-sm app-shimmer" />
          <div className="h-4 w-5/6 rounded-sm app-shimmer" />
          <div className="h-3 w-2/3 rounded-sm app-shimmer" />
        </div>
      </div>
    </article>
  );
}
