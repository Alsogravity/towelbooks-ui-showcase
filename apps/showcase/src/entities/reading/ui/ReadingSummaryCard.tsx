import { type ReactNode } from 'react';

import { Icon } from '../../../components/primitives';
import { CatalogCoverMedia } from './CatalogCoverMedia';
import { catalogWorkCoverSources } from './coverImages';

import type { CatalogCoverDelivery } from './catalogCoverDelivery';
import type { Reading } from '@towelbooks/schemas';

type ReadingSummaryCardVariant = 'active' | 'historical';

export type ReadingSummaryCardProps = {
  authorLabel: string;
  className?: string;
  coverDelivery: CatalogCoverDelivery;
  coverUrl?: string | null;
  footer?: ReactNode;
  formatDate: (value: string) => string;
  reading: Reading;
  showDescription?: boolean;
  titleAs?: 'h1' | 'h3';
  variant?: ReadingSummaryCardVariant;
};

const VARIANT_CLASS_NAMES: Record<ReadingSummaryCardVariant, string> = {
  active: 'bg-paper-3',
  historical: 'bg-paper-2',
};

export function ReadingSummaryCard({
  authorLabel,
  className = '',
  coverDelivery,
  coverUrl,
  footer,
  formatDate,
  reading,
  showDescription = false,
  titleAs = 'h3',
  variant = 'active',
}: ReadingSummaryCardProps) {
  const TitleTag = titleAs;
  const work = reading.work;
  const coverSources = catalogWorkCoverSources({
    coverUrl: coverUrl ?? work.display.coverUrl,
    coverThumbnailUrl: work.display.coverThumbnailUrl,
    coverGeometry: work.display.coverGeometry,
  });

  return (
    <div
      className={`rounded-4 border border-rule p-6 shadow-2 ${VARIANT_CLASS_NAMES[variant]} ${className}`.trim()}
    >
      <div className="flex flex-row items-stretch gap-8 lg:gap-12">
        <div className="flex shrink-0 items-center justify-center sm:items-stretch">
          <CatalogCoverMedia
            author={work.contributors[0] ?? undefined}
            className="border border-rule/30"
            coverDelivery={coverDelivery}
            fit="natural"
            size="header"
            sources={coverSources}
            theme={(work.display.title.codePointAt(0) ?? 0) % 7}
            title={work.display.title}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col py-1">
          <TitleTag className="app-text-entity-title break-words text-ink">
            {work.display.title}
          </TitleTag>
          <p className="app-text-entity-subtitle mt-1 italic text-ink-2">
            {authorLabel}
          </p>

          {reading.startsAt ? (
            <p className="app-text-metadata mt-2 inline-flex items-center gap-1.5 text-ink-3">
              <Icon name="calendar" size={16} strokeWidth={1.7} />
              {formatDate(reading.startsAt)}
            </p>
          ) : null}
          {reading.endsAt ? (
            <p className="app-text-metadata inline-flex items-center gap-1.5 text-ink-3">
              <Icon name="calendar-clock" size={16} strokeWidth={1.7} />
              {formatDate(reading.endsAt)}
            </p>
          ) : null}

          {showDescription && reading.description ? (
            <p className="app-text-body mt-6 max-w-3xl break-words line-clamp-2 text-ink-3 sm:line-clamp-3">
              {reading.description}
            </p>
          ) : null}

          {footer ? (
            <div className="mt-auto flex justify-end pt-6">{footer}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
