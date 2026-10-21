import { type ReactNode } from 'react';
import { Link } from 'react-router';

import { CatalogCoverMedia } from './CatalogCoverMedia';
import { catalogCoverSourcesFromUrl } from './coverImages';

import type { CatalogCoverDelivery } from './catalogCoverDelivery';
import type { CoverGeometry } from '@towelbooks/schemas';

export type CatalogWorkCandidateRowProps = {
  actions?: ReactNode;
  author: string;
  bottomRight?: ReactNode;
  className?: string;
  coverDelivery: CatalogCoverDelivery;
  /** Author line used on typographic cover fallback; defaults to `author`. */
  coverAuthor?: string;
  coverGeometry?: CoverGeometry | null;
  coverThumbnailUrl?: string | null;
  coverUrl?: string | null;
  /** When set, cover/title/author link to this path. Omit for visual-only rows. */
  href?: string | null;
  themeSeed?: string;
  title: string;
};

const coverLinkClassName =
  'block no-underline rounded-sm text-inherit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick/30';
const textLinkClassName =
  'inline-block max-w-full truncate rounded-sm no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick/30';

export function CatalogWorkCandidateRow({
  actions,
  author,
  bottomRight,
  className = '',
  coverDelivery,
  coverAuthor,
  coverGeometry,
  coverThumbnailUrl,
  coverUrl,
  href,
  themeSeed,
  title,
}: CatalogWorkCandidateRowProps) {
  const seed = themeSeed ?? title;
  // Compact candidate rows intentionally fill their fixed thumbnail slot.
  const cover = (
    <CatalogCoverMedia
      author={coverAuthor ?? author}
      className="h-full w-full !aspect-auto rounded-none"
      coverDelivery={coverDelivery}
      fit="cover"
      imageClassName="h-full w-full object-cover"
      size="fluid"
      sources={catalogCoverSourcesFromUrl(
        coverUrl,
        coverThumbnailUrl,
        coverGeometry,
      )}
      theme={seed.charCodeAt(0)}
      title={title}
    />
  );

  return (
    <article
      className={`relative flex items-stretch overflow-hidden rounded-md border border-rule/60 bg-vellum shadow-sm ${className}`.trim()}
    >
      {href ? (
        <Link
          aria-label={title}
          className={`w-[72px] shrink-0 sm:w-20 ${coverLinkClassName}`}
          to={href}
        >
          {cover}
        </Link>
      ) : (
        <div aria-hidden="true" className="w-[72px] shrink-0 sm:w-20">
          {cover}
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="min-w-0">
          <h3 className="m-0 font-display text-base font-normal leading-snug">
            {href ? (
              <Link className={`${textLinkClassName} text-ink`} to={href}>
                {title}
              </Link>
            ) : (
              <span className="text-ink">{title}</span>
            )}
          </h3>
          <p className="app-text-metadata m-0 mt-1">
            {href ? (
              <Link className={`${textLinkClassName} text-ink-3`} to={href}>
                {author}
              </Link>
            ) : (
              <span className="text-ink-3">{author}</span>
            )}
          </p>
        </div>

        {bottomRight || actions ? (
          <div className="mt-auto flex flex-col items-end gap-3 pt-4">
            {bottomRight}
            {actions}
          </div>
        ) : null}
      </div>
    </article>
  );
}
