import { Link } from 'react-router';

import { BookmarkBooksIllustration } from './illustrations/BookmarkBooksIllustration';
import { LibraryIllustration } from './illustrations/LibraryIllustration';
import { OpenBookIllustration } from './illustrations/OpenBookIllustration';
import {
  InsightsStatCard,
  insightsStatIllustrationClass,
  type InsightsStatAccent,
} from '../../../components/insights/InsightsStatCard';
import { BrowseSection } from '../../../components/layout';
import { useI18n } from '../../../i18n';

import type { MyInsightsResponse } from '@towelbooks/schemas';
import type { ReactNode } from 'react';

const STAT_DEFINITIONS: Array<{
  accent: InsightsStatAccent;
  labelKey: string;
  renderIllustration: () => ReactNode;
  read: (insights: MyInsightsResponse) => number;
}> = [
  {
    accent: 'brick',
    labelKey: 'dashboard.insights.inProgress.label',
    read: (insights) => insights.booksInProgress,
    renderIllustration: () => (
      <OpenBookIllustration
        className={insightsStatIllustrationClass('brick')}
      />
    ),
  },
  {
    accent: 'forest',
    labelKey: 'dashboard.insights.finishedThisYear.label',
    read: (insights) => insights.booksFinishedThisYear,
    renderIllustration: () => (
      <BookmarkBooksIllustration
        className={insightsStatIllustrationClass('forest')}
      />
    ),
  },
  {
    accent: 'gold',
    labelKey: 'dashboard.insights.totalInLibrary.label',
    read: (insights) => insights.totalInLibrary,
    renderIllustration: () => (
      <LibraryIllustration className={insightsStatIllustrationClass('gold')} />
    ),
  },
];

export function WeekInsightsRow({
  insights,
  isError,
  isLoading,
}: {
  insights: MyInsightsResponse | null;
  isError: boolean;
  isLoading: boolean;
}) {
  const { t } = useI18n();

  return (
    <BrowseSection title={t('dashboard.insights.eyebrow')}>
      {isError ? (
        <p className="supporting-copy text-ink-3">
          {t('dashboard.insights.error')}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {STAT_DEFINITIONS.map((definition) => {
            const value = insights ? definition.read(insights) : null;
            return (
              <Link
                key={definition.labelKey}
                to="/my-library"
                className="block no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus-visible:ring-offset-2 rounded-2xl"
              >
                <InsightsStatCard
                  illustration={definition.renderIllustration()}
                  isLoading={isLoading}
                  label={t(definition.labelKey)}
                  value={value}
                />
              </Link>
            );
          })}
        </div>
      )}
    </BrowseSection>
  );
}
