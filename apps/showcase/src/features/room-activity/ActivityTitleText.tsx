import { Icon } from '../../components/primitives';
import {
  CatalogCoverMedia,
  catalogCoverSourcesFromUrl,
  type CatalogWorkCoverFields,
} from '../../entities/reading/ui';

import type { ActivityTitleSegment } from './roomActivityPresentation';

type ActivityTitleTextProps = {
  className?: string;
  emphasisClassName?: string;
  iconSize?: number;
  nonEmphasisClassName?: string;
  readingCover?: CatalogWorkCoverFields | null;
  segments: readonly ActivityTitleSegment[];
};

export function ActivityTitleText({
  className,
  emphasisClassName = 'font-semibold',
  iconSize = 14,
  nonEmphasisClassName,
  readingCover,
  segments,
}: ActivityTitleTextProps) {
  return (
    <div className={className}>
      {segments.map((segment, index) => {
        const hasReadingCover =
          segment.key === 'readingTitle' &&
          readingCover !== undefined &&
          readingCover !== null;
        const leadingVisual = hasReadingCover ? (
          <CatalogCoverMedia
            className="mr-1 inline-block !w-3 shrink-0 align-middle"
            coverDelivery={{ loading: 'lazy', preferredVariant: 'thumbnail' }}
            fallback={
              <span className="flex h-full w-full items-center justify-center">
                <Icon name="book" size={iconSize} className="text-ink-3" />
              </span>
            }
            fit="natural"
            size="fluid"
            sources={catalogCoverSourcesFromUrl(
              readingCover.coverUrl,
              readingCover.coverThumbnailUrl,
              readingCover.coverGeometry,
            )}
            title={segment.text}
          />
        ) : segment.icon ? (
          <Icon
            name={segment.icon}
            size={iconSize}
            className="mr-1 inline-flex align-middle -translate-y-[2px] text-ink-3"
          />
        ) : null;

        if (hasReadingCover) {
          return (
            <div
              key={index}
              className={`inline ${segment.emphasis ? emphasisClassName : (nonEmphasisClassName ?? '')}`.trim()}
            >
              {leadingVisual}
              {segment.text}
            </div>
          );
        }

        return (
          <span
            key={index}
            className={
              segment.emphasis ? emphasisClassName : nonEmphasisClassName
            }
          >
            {leadingVisual}
            {segment.text}
          </span>
        );
      })}
    </div>
  );
}
