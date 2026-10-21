import { type CatalogWorkType, type LibraryItem } from '@towelbooks/schemas';
import { Link } from 'react-router';

import { CatalogCoverMedia } from '../../../entities/reading/ui';
import { Icon, Tag, type TagVariant } from '../../../components/primitives';
import { useI18n } from '../../../i18n';
import { getCatalogWorkTypeLabel } from '../../catalog/detail/ui/catalogWorkDetailHelpers';
import { getItemTitle, getLibraryItemCoverSources } from './libraryPageShared';

type LibraryItemCardProps = {
  canManage: boolean;
  item: LibraryItem;
};

const workTypeTagVariants: Record<CatalogWorkType, TagVariant> = {
  book: 'gilt',
  comic: 'private',
  manga: 'reading',
};

function normalizeCategoryLabel(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function getCategoryWords(value: string): string[] {
  return normalizeCategoryLabel(value).match(/[a-z0-9]+/g) ?? [];
}

function containsCategoryWords(
  words: readonly string[],
  candidate: readonly string[],
): boolean {
  if (candidate.length === 0 || candidate.length >= words.length) {
    return false;
  }

  return words.some(
    (_, index) =>
      index + candidate.length <= words.length &&
      candidate.every((word, offset) => words[index + offset] === word),
  );
}

export function LibraryItemCard({ canManage, item }: LibraryItemCardProps) {
  const { formatNumber, t } = useI18n();
  const title =
    getItemTitle(item).trim() || t('myLibrary.common.untitledTitle');
  const author =
    item.work.contributors[0]?.trim() || t('myLibrary.common.noContributor');
  const numericRating =
    typeof item.viewerRating === 'number' ? item.viewerRating : null;
  const workTypeLabel = getCatalogWorkTypeLabel(item.work.kind, t);
  const normalizedWorkTypeLabel = normalizeCategoryLabel(workTypeLabel);
  const normalizedWorkKind = normalizeCategoryLabel(item.work.kind);
  const visibleCategories = item.work.categories
    .filter((category) => {
      const normalizedDisplayName = normalizeCategoryLabel(
        category.displayName,
      );
      const normalizedSlug = normalizeCategoryLabel(category.slug);

      return ![normalizedDisplayName, normalizedSlug].some(
        (value) =>
          value === normalizedWorkTypeLabel || value === normalizedWorkKind,
      );
    })
    .filter((category, _, categories) => {
      const categoryWords = getCategoryWords(category.displayName);

      return !categories.some((otherCategory) => {
        if (otherCategory.slug === category.slug) {
          return false;
        }

        return containsCategoryWords(
          getCategoryWords(otherCategory.displayName),
          categoryWords,
        );
      });
    })
    .slice(0, 1);
  const primaryCategory = visibleCategories[0] ?? null;

  return (
    <Link
      to={`/libraries/${item.libraryId}/items/${item.id}`}
      aria-label={t(
        canManage ? 'myLibrary.items.editItem' : 'libraries.items.openItem',
        { values: { title } },
      )}
      className="library-item-row group flex w-full min-w-0 items-stretch gap-0 overflow-hidden rounded-[var(--radius-paper-3)] border border-rule/50 bg-vellum/20 text-left no-underline transition-all duration-300 hover:border-rule hover:bg-vellum/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-brick/30"
    >
      <div className="library-item-row__cover w-[96px] shrink-0 sm:w-[120px]">
        <CatalogCoverMedia
          alt=""
          author={author}
          authorOnFallback="lastWord"
          className="h-full w-full !aspect-auto rounded-none"
          coverDelivery={{ loading: 'lazy', preferredVariant: 'detail' }}
          fit="cover"
          size="fluid"
          sources={getLibraryItemCoverSources(item)}
          theme={item.catalogWorkId.codePointAt(0) ?? 0}
          title={title}
          typographic={{ showDividers: false }}
        />
      </div>
      <article className="flex min-w-0 flex-1 flex-col justify-between gap-3 self-stretch p-3 sm:p-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="app-text-row-title line-clamp-2 min-w-0 text-ink transition-colors duration-100 group-hover:text-brick">
            {title}
          </h3>
          <p className="app-text-metadata line-clamp-2 min-w-0 text-ink-3 transition-colors duration-100 group-hover:text-ink-2">
            {author}
          </p>
          <div className="app-text-metadata flex items-center justify-start gap-1 text-ink-2">
            <Icon
              className="fill-current text-gold"
              name="star"
              size={16}
              strokeWidth={1.8}
            />
            <span
              aria-label={
                numericRating === null
                  ? t('myLibrary.items.rating.notRated')
                  : t('catalog.workDetail.ratings.ratingOption', {
                      values: { rating: formatNumber(numericRating) },
                    })
              }
            >
              {numericRating === null ? '-' : formatNumber(numericRating)}
            </span>
          </div>
        </div>

        <div className="mt-auto flex min-w-0 flex-wrap items-end justify-end gap-1.5">
          <div className="ml-auto flex min-w-0 flex-wrap items-end justify-end gap-1.5">
            {primaryCategory ? (
              <Tag
                variant="default"
                className="app-text-caption !normal-case max-w-full shrink-0 px-2 py-0.5"
              >
                {primaryCategory.displayName}
              </Tag>
            ) : null}
            <Tag
              variant={workTypeTagVariants[item.work.kind]}
              className="app-text-caption !normal-case shrink-0 px-2 py-0.5"
              withDot={false}
            >
              {workTypeLabel}
            </Tag>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function LibraryItemCardSkeleton() {
  return (
    <article
      aria-hidden="true"
      className="library-item-row flex w-full min-w-0 items-stretch gap-0 overflow-hidden rounded-[var(--radius-paper-3)] border border-rule/40 bg-vellum/20"
    >
      <div className="library-item-row__cover w-[96px] shrink-0 app-shimmer sm:w-[120px]" />
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 self-stretch p-3 sm:p-4">
        <div className="flex flex-col gap-2">
          <div className="h-5 w-3/4 rounded-sm app-shimmer" />
          <div className="h-3 w-1/2 rounded-sm app-shimmer" />
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <div className="h-4 w-10 rounded-sm app-shimmer" />
          <div className="ml-auto flex min-w-0 flex-wrap justify-end gap-2">
            <div className="h-6 w-16 rounded-full app-shimmer" />
            <div className="h-6 w-20 rounded-full app-shimmer" />
          </div>
        </div>
      </div>
    </article>
  );
}
