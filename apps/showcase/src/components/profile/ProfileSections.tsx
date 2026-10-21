import { useMemo, useRef, useState } from 'react';

import { ProfileActivityFeed } from './ProfileActivityFeed';
import { ProfileStatDetailDialog } from './stats/ProfileStatDetailDialog';
import { ProfileCatalogReviewsSummary } from './stats/panels/ProfileCatalogReviewsSummary';
import { ProfileSummaryStatsCards } from './stats/ProfileSummaryStatsCards';
import {
  type ProfileSummaryStatDialogKey,
  type ProfileSummaryStats,
} from './stats/profileStats';
import { ProfileTabs, type ProfileTab } from './ProfileTabs';
import { AnimatedTabPanel, Icon, TabPanelsSlider } from '../primitives';
import { useI18n } from '../../i18n';
import { ProfileCollectionsSummary } from '../../features/collections';

type ProfileTabKey = 'insights' | 'feed';

const DEFAULT_PROFILE_TAB: ProfileTabKey = 'insights';

const STAT_TOTAL_COUNT_KEYS: Record<
  ProfileSummaryStatDialogKey,
  keyof ProfileSummaryStats
> = {
  catalogReviews: 'catalogReviewsCount',
  booksRead: 'booksReadCount',
  ratings: 'ratingsCount',
  rooms: 'roomsCount',
};

export type { ProfileSummaryStats } from './stats/profileStats';
export type { ProfileSummaryStatDialogKey } from './stats/profileStats';

export interface ProfileSectionsProps {
  isOwnProfile?: boolean;
  stats: ProfileSummaryStats;
  viewerUserId?: string | null;
  username: string;
}

export function ProfileSections({
  isOwnProfile = false,
  stats,
  viewerUserId = null,
  username,
}: ProfileSectionsProps) {
  const { t } = useI18n();
  const [activeStatDialog, setActiveStatDialog] =
    useState<ProfileSummaryStatDialogKey | null>(null);
  const returnFocusRef = useRef<HTMLButtonElement | null>(null);
  const [activeTab, setActiveTab] =
    useState<ProfileTabKey>(DEFAULT_PROFILE_TAB);
  const tabIdPrefix = 'profile-tab';

  const tabs = useMemo<ProfileTab<ProfileTabKey>[]>(
    () => [
      {
        key: DEFAULT_PROFILE_TAB,
        label: (
          <span className="inline-flex items-center justify-center gap-2">
            <Icon name="profile-feed" size={24} strokeWidth={1.7} />
            <span>{t('profile.tabs.insights')}</span>
          </span>
        ),
      },
      {
        key: 'feed',
        label: (
          <span className="inline-flex items-center justify-center gap-2">
            <Icon name="profile-activity" size={24} strokeWidth={1.7} />
            <span>{t('profile.tabs.feed')}</span>
          </span>
        ),
      },
    ],
    [t],
  );

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <ProfileTabs
        tabs={tabs}
        activeKey={activeTab}
        onChange={setActiveTab}
        idPrefix={tabIdPrefix}
      />

      <TabPanelsSlider activeKey={activeTab} tabs={tabs} className="flex-1">
        <AnimatedTabPanel
          id={`${tabIdPrefix}-${DEFAULT_PROFILE_TAB}-panel`}
          aria-labelledby={`${tabIdPrefix}-${DEFAULT_PROFILE_TAB}`}
          isActive={activeTab === DEFAULT_PROFILE_TAB}
          className="px-4 py-6 lg:px-0"
        >
          <section aria-labelledby="profile-feed-summary-title">
            <h2 id="profile-feed-summary-title" className="sr-only">
              {t('profile.feed.summaryTitle')}
            </h2>
            <ProfileSummaryStatsCards
              stats={stats}
              onStatClick={(key, trigger) => {
                returnFocusRef.current = trigger;
                setActiveStatDialog(key);
              }}
            />
            <ProfileCatalogReviewsSummary
              totalCount={stats.catalogReviewsCount}
              username={username}
            />
            <ProfileCollectionsSummary
              username={username}
              viewerUserId={viewerUserId}
            />
          </section>
        </AnimatedTabPanel>

        <AnimatedTabPanel
          id={`${tabIdPrefix}-feed-panel`}
          aria-labelledby={`${tabIdPrefix}-feed`}
          isActive={activeTab === 'feed'}
          className="px-4 py-6 lg:px-0"
        >
          <section aria-labelledby="profile-feed-activity-title">
            <h2 id="profile-feed-activity-title" className="sr-only">
              {t('profile.feed.activityTitle')}
            </h2>
            <ProfileActivityFeed username={username} />
          </section>
        </AnimatedTabPanel>
      </TabPanelsSlider>

      {activeStatDialog ? (
        <ProfileStatDetailDialog
          getReturnFocusElement={() => returnFocusRef.current}
          isOwnProfile={isOwnProfile}
          onClose={() => setActiveStatDialog(null)}
          statKey={activeStatDialog}
          totalCount={stats[STAT_TOTAL_COUNT_KEYS[activeStatDialog]]}
          username={username}
        />
      ) : null}
    </section>
  );
}
