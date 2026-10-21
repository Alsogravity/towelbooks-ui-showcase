import { InsightsStatGlyphText } from '../../insights/InsightsStatCard';
import {
  CatalogReviewsStatIllustration,
  BooksReadStatIllustration,
  RoomsAlternateStatIllustration,
  RatingsStatIllustration,
} from './profileStatIllustrations';
import {
  type ProfileStatKey,
  type ProfileSummaryStatDialogKey,
  type ProfileSummaryStats,
} from './profileStats';
import { useI18n } from '../../../i18n';
import { Card } from '../../primitives';

import type { ReactNode, MouseEvent } from 'react';

const PROFILE_STAT_DEFINITIONS: Array<{
  dialogKey: ProfileSummaryStatDialogKey;
  key: ProfileStatKey;
  labelKey: string;
  openActionKey: string;
  renderIllustration: (size?: number) => ReactNode;
}> = [
  {
    key: 'catalogReviewsCount',
    dialogKey: 'catalogReviews',
    labelKey: 'profile.stats.catalogReviews',
    openActionKey: 'profile.statDialog.openCatalogReviews',
    renderIllustration: (size = 48) => (
      <CatalogReviewsStatIllustration
        width={size}
        height={size}
        className="text-brick"
      />
    ),
  },
  {
    key: 'booksReadCount',
    dialogKey: 'booksRead',
    labelKey: 'profile.stats.booksRead',
    openActionKey: 'profile.statDialog.openBooksRead',
    renderIllustration: (size = 48) => (
      <BooksReadStatIllustration
        width={size}
        height={size}
        className="text-forest"
      />
    ),
  },
  {
    key: 'ratingsCount',
    dialogKey: 'ratings',
    labelKey: 'profile.stats.ratings',
    openActionKey: 'profile.statDialog.openRatings',
    renderIllustration: (size = 48) => (
      <RatingsStatIllustration
        width={size}
        height={size}
        className="text-brick"
      />
    ),
  },
  {
    key: 'roomsCount',
    dialogKey: 'rooms',
    labelKey: 'profile.stats.rooms',
    openActionKey: 'profile.statDialog.openRooms',
    renderIllustration: (size = 48) => (
      <RoomsAlternateStatIllustration
        width={size}
        height={size}
        className="text-gold"
      />
    ),
  },
];

interface ProfileStatCardProps {
  accessibleName: string;
  illustration: ReactNode;
  label: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  value: string | number;
}

function ProfileStatCard({
  accessibleName,
  illustration,
  label,
  onClick,
  value,
}: ProfileStatCardProps) {
  const content = (
    <Card
      interactive={Boolean(onClick)}
      padding={false}
      className="flex items-center gap-4 p-4 overflow-hidden min-h-[80px]"
    >
      <div className="flex-shrink-0 flex items-center justify-center w-12 h-12">
        {illustration}
      </div>
      <div className="flex flex-col justify-center min-w-0">
        <InsightsStatGlyphText className="app-text-stat-value font-display text-ink">
          {value}
        </InsightsStatGlyphText>
        <InsightsStatGlyphText className="app-text-stat-label mt-1 truncate text-ink-3">
          {label}
        </InsightsStatGlyphText>
      </div>
    </Card>
  );

  if (!onClick) {
    return content;
  }

  return (
    <button
      type="button"
      aria-label={accessibleName}
      onClick={onClick}
      className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick/40 focus-visible:rounded-xl"
    >
      {content}
    </button>
  );
}

export interface ProfileSummaryStatsCardsProps {
  stats: ProfileSummaryStats;
  onStatClick?: (
    key: ProfileSummaryStatDialogKey,
    trigger: HTMLButtonElement,
  ) => void;
}

export function ProfileSummaryStatsCards({
  onStatClick,
  stats,
}: ProfileSummaryStatsCardsProps) {
  const { formatNumber, t } = useI18n();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {PROFILE_STAT_DEFINITIONS.map((definition) => (
        <ProfileStatCard
          key={definition.key}
          accessibleName={t('profile.statDialog.openAccessibleName', {
            values: {
              action: t(definition.openActionKey),
              count: formatNumber(stats[definition.key]),
              label: t(definition.labelKey),
            },
          })}
          illustration={definition.renderIllustration(48)}
          label={t(definition.labelKey)}
          onClick={
            onStatClick
              ? (event) =>
                  onStatClick(definition.dialogKey, event.currentTarget)
              : undefined
          }
          value={formatNumber(stats[definition.key])}
        />
      ))}
    </div>
  );
}
