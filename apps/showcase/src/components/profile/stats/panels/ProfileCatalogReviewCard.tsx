import { CatalogReviewCard } from '../../../../entities/catalog-reviews/ui';
import { useI18n } from '../../../../i18n';

import { buildCatalogReviewExcerpt } from '@towelbooks/schemas';

import type { CatalogReview } from '@towelbooks/schemas';

export function ProfileCatalogReviewCard({
  item,
  profileUsername,
}: {
  item: CatalogReview;
  profileUsername: string;
}) {
  const { formatDate, t } = useI18n();
  const isDraft = item.status === 'draft';
  const dateLabel = isDraft
    ? t('profile.catalog-reviews.draftSavedOn', {
        values: { date: formatDate(item.updatedAt) },
      })
    : t('profile.catalog-reviews.publishedOn', {
        values: { date: formatDate(item.publishedAt ?? item.createdAt) },
      });
  const href = isDraft
    ? `/catalog-reviews/${encodeURIComponent(item.id)}/edit`
    : `/catalog-reviews/${encodeURIComponent(item.id)}`;
  const linkState = !isDraft
    ? { origin: { kind: 'profile-reviews', username: profileUsername } }
    : undefined;

  return (
    <CatalogReviewCard
      author={item.author}
      catalogWork={{
        id: item.target.id,
        subtitle: item.target.subtitle,
        title: item.target.title,
      }}
      dateLabel={dateLabel}
      excerpt={buildCatalogReviewExcerpt(item.body)}
      href={href}
      linkState={linkState}
      rightTag={isDraft ? t('profile.catalog-reviews.draftLabel') : null}
      title={item.title}
      workHref={`/catalog/${encodeURIComponent(item.catalogWorkId)}`}
    />
  );
}
