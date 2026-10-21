import { type Reading } from '@towelbooks/schemas';

import { LoadingState } from '../../../../components/feedback';
import { Link } from 'react-router';
import { Icon } from '../../../../components/primitives';
import { ReadingSummaryCard } from '../../../../entities/reading/ui';
import { type useI18n } from '../../../../i18n';
import { type Room } from '../../types';

type ActiveReadingCardProps = {
  reading: Reading | null;
  room: Room;
  isLoadingReadings: boolean;
  variant?: 'active' | 'historical';
  formatDate: (value: string) => string;
  t: ReturnType<typeof useI18n>['t'];
};

export function ActiveReadingCard({
  reading,
  room,
  isLoadingReadings,
  variant = 'active',
  formatDate,
  t,
}: ActiveReadingCardProps) {
  if (isLoadingReadings) {
    return (
      <section className="py-4">
        <LoadingState
          label={{
            key: 'rooms.detail.currentReading.loading',
            fallback: 'Loading current reading...',
          }}
        />
      </section>
    );
  }

  if (!reading) {
    return null;
  }

  return (
    <Link
      to={`/rooms/${room.id}/readings/${reading.id}`}
      className="group block rounded-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick/40"
    >
      <ReadingSummaryCard
        authorLabel={
          reading.work.contributors[0] ?? t('readings.author.unknown')
        }
        className="transition-shadow duration-500 group-hover:shadow-[0_8px_30px_rgba(31,26,23,0.12)]"
        coverDelivery={{
          loading: variant === 'historical' ? 'lazy' : 'eager',
          preferredVariant: 'detail',
        }}
        formatDate={formatDate}
        reading={reading}
        showDescription
        variant={variant}
        footer={
          variant === 'active' ? (
            <span className="inline-flex items-center gap-1 app-text-label text-ink-3 transition-colors group-hover:text-brick">
              {t('rooms.detail.currentReading.action.continue')}
              <Icon name="chevron-right" size={16} strokeWidth={1.7} />
            </span>
          ) : undefined
        }
      />
    </Link>
  );
}
