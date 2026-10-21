import { type ReactNode } from 'react';

import { CatalogCoverMedia } from './CatalogCoverMedia';
import { CatalogCoverSkeleton } from './CatalogCoverSkeleton';

import type { CatalogCoverDelivery } from './catalogCoverDelivery';
import type { CatalogCoverSource } from './coverImages';

type CatalogWorkCardProps = {
  author: string;
  badge?: ReactNode;
  coverDelivery?: CatalogCoverDelivery;
  coverWidth?: number;
  coverSources: CatalogCoverSource[];
  hideAuthor?: boolean;
  hideTitle?: boolean;
  themeSeed: string;
  title: string;
  titleAs?: 'h2' | 'h3';
};

const CATALOG_WORK_CARD_COVER_CLASS_NAMES: Record<number, string> = {
  150: 'w-full',
  180: 'w-[180px]',
};

const CATALOG_WORK_CARD_SKELETON_WIDTH_CLASS_NAMES: Record<number, string> = {
  150: 'w-full',
  180: 'w-[180px]',
};

export function CatalogWorkCard({
  author,
  badge,
  coverDelivery,
  coverWidth = 150,
  coverSources,
  hideAuthor = false,
  hideTitle = false,
  themeSeed,
  title,
  titleAs = 'h3',
}: CatalogWorkCardProps) {
  const TitleTag = titleAs;
  const coverClassName =
    CATALOG_WORK_CARD_COVER_CLASS_NAMES[coverWidth] ??
    CATALOG_WORK_CARD_COVER_CLASS_NAMES[150];
  const coverSize = coverWidth >= 180 ? 'lg' : 'fluid';

  return (
    <article className="flex w-full flex-col items-start gap-1 text-left">
      <div
        className={`relative overflow-hidden rounded-sm bg-vellum/20 shadow-sm transition-shadow duration-100 group-hover:shadow-[0_8px_30px_rgba(31,26,23,0.12)] ${coverClassName}`}
      >
        <CatalogCoverMedia
          author={author}
          authorOnFallback="lastWord"
          coverDelivery={coverDelivery}
          fit="natural"
          sources={coverSources}
          size={coverSize}
          theme={themeSeed.codePointAt(0) ?? 0}
          title={title}
        />
        {badge}
      </div>

      {hideTitle && hideAuthor ? null : (
        <div className="flex min-w-0 w-full flex-col">
          {hideTitle ? null : (
            <TitleTag className="app-text-card-title truncate w-full text-ink transition-colors duration-100 group-hover:text-brick">
              {title}
            </TitleTag>
          )}
          {hideAuthor ? null : (
            <p className="app-text-metadata mt-0.5 truncate w-full text-ink-3 transition-colors duration-100 group-hover:text-ink-2">
              {author}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

export function CatalogWorkCardSkeleton({
  className,
  coverWidth = 150,
}: {
  className?: string;
  coverWidth?: number;
}) {
  const coverClassName =
    CATALOG_WORK_CARD_SKELETON_WIDTH_CLASS_NAMES[coverWidth] ??
    CATALOG_WORK_CARD_SKELETON_WIDTH_CLASS_NAMES[150];

  return (
    <article
      className={`flex w-full flex-col items-start gap-3 text-left ${className ?? ''}`}
    >
      <CatalogCoverSkeleton
        className={`rounded-sm shadow-sm ${coverClassName}`}
      />

      <div className="flex w-full flex-col gap-1.5">
        <div className="h-4 w-3/4 rounded-sm app-shimmer" />
        <div className="h-3 w-1/2 rounded-sm app-shimmer" />
      </div>
    </article>
  );
}
