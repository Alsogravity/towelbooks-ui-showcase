import { type ReactNode } from 'react';

import {
  CatalogCoverImage,
  type CatalogCoverImageFit,
} from './CatalogCoverImage';
import { CATALOG_COVER_ASPECT_CLASS } from './catalogCoverLayout';
import {
  TypographicCatalogWorkCover,
  type TypographicCatalogWorkCoverProps,
} from './TypographicCatalogWorkCover';

import type { CatalogCoverDelivery } from './catalogCoverDelivery';
import type { CatalogCoverSource } from './coverImages';

export type CatalogCoverMediaSize =
  'xs' | 'sm' | 'md' | 'lg' | 'fluid' | 'header' | 'headerCompact';

export type CatalogCoverMediaProps = {
  alt?: string;
  author?: string | null;
  authorOnFallback?: 'full' | 'lastWord';
  className?: string;
  fallback?: ReactNode;
  /** `natural` sizes height from the image; width comes from the layout size. */
  fit?: CatalogCoverImageFit;
  coverDelivery?: CatalogCoverDelivery;
  imageClassName?: string;
  size?: CatalogCoverMediaSize;
  sources: CatalogCoverSource[];
  theme?: number;
  title: string;
  typographic?: Partial<TypographicCatalogWorkCoverProps>;
};

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

const CATALOG_COVER_MEDIA_LAYOUT_CLASS_NAMES: Record<
  CatalogCoverMediaSize,
  string
> = {
  xs: 'w-[56px]',
  sm: 'w-[118px]',
  md: 'w-[150px]',
  lg: 'w-[180px]',
  fluid: 'w-full',
  header: 'w-28 sm:w-32 lg:w-40',
  headerCompact: 'w-28',
};

const CATALOG_COVER_MEDIA_IMAGE_CLASS_NAMES: Record<
  CatalogCoverMediaSize,
  string
> = {
  xs: 'block h-full w-full object-cover',
  sm: 'block h-full w-full object-cover',
  md: 'block h-full w-full object-cover',
  lg: 'block h-full w-full object-cover',
  fluid: 'block h-full w-full object-cover',
  header: classNames(
    'block h-full w-full object-cover',
    'rounded-[var(--radius-paper-4)] shadow-book',
  ),
  headerCompact: classNames(
    'block h-full w-full object-cover',
    'rounded-[var(--radius-paper-4)] shadow-book',
  ),
};

/** Decorative extras only; height clamps live in CatalogCoverImage natural fit. */
const CATALOG_COVER_MEDIA_NATURAL_IMAGE_CLASS_NAMES: Record<
  CatalogCoverMediaSize,
  string
> = {
  xs: '',
  sm: '',
  md: '',
  lg: '',
  fluid: '',
  header: 'rounded-[var(--radius-paper-4)] shadow-book',
  headerCompact: 'rounded-[var(--radius-paper-4)] shadow-book',
};

const CATALOG_COVER_MEDIA_TYPOGRAPHIC_SIZE: Record<
  CatalogCoverMediaSize,
  NonNullable<TypographicCatalogWorkCoverProps['size']>
> = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  fluid: 'fluid',
  header: 'header',
  headerCompact: 'headerCompact',
};

function resolveFallbackAuthor(
  author: string | null | undefined,
  mode: CatalogCoverMediaProps['authorOnFallback'],
): string | null | undefined {
  if (!author || mode !== 'lastWord') {
    return author;
  }

  return author.split(' ').slice(-1)[0];
}

function isHeaderSize(size: CatalogCoverMediaSize) {
  return size === 'header' || size === 'headerCompact';
}

function resolveTypographicAccessibilityProps(
  alt: string,
  typographic: CatalogCoverMediaProps['typographic'],
) {
  if (
    typographic?.['aria-hidden'] !== undefined ||
    typographic?.['aria-label'] !== undefined ||
    typographic?.role !== undefined
  ) {
    return {};
  }

  if (alt === '') {
    return { 'aria-hidden': true as const };
  }

  return {
    'aria-label': alt,
    role: 'img' as const,
  };
}

function resolveLayoutClassName(
  size: CatalogCoverMediaSize,
  fit: CatalogCoverImageFit,
  className?: string,
) {
  return classNames(
    CATALOG_COVER_MEDIA_LAYOUT_CLASS_NAMES[size],
    fit === 'cover' ? CATALOG_COVER_ASPECT_CLASS : undefined,
    'relative overflow-hidden',
    className,
  );
}

export function CatalogCoverMedia({
  alt = '',
  author,
  authorOnFallback = 'full',
  className,
  coverDelivery,
  fallback,
  fit = 'cover',
  imageClassName,
  size = 'md',
  sources,
  theme = 0,
  title,
  typographic,
}: CatalogCoverMediaProps) {
  const layoutClassName = resolveLayoutClassName(size, fit, className);
  const typographicSize = CATALOG_COVER_MEDIA_TYPOGRAPHIC_SIZE[size];
  const fallbackAuthor = resolveFallbackAuthor(author, authorOnFallback);
  const typographicAccessibilityProps = resolveTypographicAccessibilityProps(
    alt,
    typographic,
  );

  const typographicFallback = fallback ?? (
    <TypographicCatalogWorkCover
      {...typographic}
      {...typographicAccessibilityProps}
      author={fallbackAuthor}
      className={classNames(
        size === 'fluid' ||
          size === 'sm' ||
          size === 'xs' ||
          size === 'md' ||
          size === 'lg'
          ? 'w-full'
          : undefined,
        isHeaderSize(size) ? className : undefined,
        typographic?.className,
      )}
      size={typographicSize}
      theme={theme}
      title={title}
    />
  );

  if (sources.length === 0) {
    if (isHeaderSize(size)) {
      return <>{typographicFallback}</>;
    }

    // Only synthetic fallback presentation keeps the standard cover ratio;
    // real cover geometry is resolved by the natural image path.
    return (
      <div
        className={
          fit === 'natural'
            ? classNames(
                CATALOG_COVER_MEDIA_LAYOUT_CLASS_NAMES[size],
                CATALOG_COVER_ASPECT_CLASS,
                'relative overflow-hidden',
                className,
              )
            : layoutClassName
        }
      >
        {typographicFallback}
      </div>
    );
  }

  const imageClassNames = classNames(
    fit === 'natural'
      ? CATALOG_COVER_MEDIA_NATURAL_IMAGE_CLASS_NAMES[size]
      : CATALOG_COVER_MEDIA_IMAGE_CLASS_NAMES[size],
    isHeaderSize(size) ? className : undefined,
    imageClassName,
  );

  return (
    <div className={layoutClassName}>
      <CatalogCoverImage
        alt={alt}
        className={imageClassNames}
        coverDelivery={coverDelivery}
        fallback={typographicFallback}
        fit={fit}
        sources={sources}
      />
    </div>
  );
}
