import { useId, useState } from 'react';

import { HeaderActionCapsule } from '../overlay/HeaderActionCapsule';
import { Dialog, DialogBody } from '../primitives';
import { useI18n } from '../../i18n';
import { ProfileFollowDialogList } from './ProfileFollowDialogList';
import { ProfileFollowDialogTabs } from './ProfileFollowDialogTabs';
import { type ProfileFollowDialogTab } from './profileFollowDialogShared';
import { useProfileFollowList } from './useProfileFollowList';

export type { ProfileFollowDialogTab } from './profileFollowDialogShared';

export interface ProfileFollowDialogProps {
  initialTab: ProfileFollowDialogTab;
  isOwnProfile: boolean;
  onClose: () => void;
  username: string;
}

/**
 * Followers/following dialog keeps a tabbed custom header; close uses the
 * shared HeaderActionCapsule for icon chrome parity.
 */
export function ProfileFollowDialog({
  initialTab,
  isOwnProfile,
  onClose,
  username,
}: ProfileFollowDialogProps) {
  const { t } = useI18n();
  const titleId = useId();
  const [activeTab, setActiveTab] =
    useState<ProfileFollowDialogTab>(initialTab);

  const followersQuery = useProfileFollowList(username, 'followers', {
    enabled: activeTab === 'followers',
  });
  const followingQuery = useProfileFollowList(username, 'following', {
    enabled: activeTab === 'following',
  });

  const activeQuery =
    activeTab === 'followers' ? followersQuery : followingQuery;
  const emptyMessage =
    activeTab === 'followers'
      ? t('profile.followDialog.emptyFollowers')
      : t('profile.followDialog.emptyFollowing');

  return (
    <Dialog onClose={onClose} size="md" aria-labelledby={titleId}>
      {({ close }) => (
        <>
          <header className="relative flex h-[50px] items-stretch justify-center px-12">
            <h2 id={titleId} className="sr-only">
              {t('profile.followDialog.title')}
            </h2>
            <ProfileFollowDialogTabs
              activeKey={activeTab}
              onChange={setActiveTab}
            />
            <div className="absolute right-4 top-1/2 z-10 -translate-y-1/2">
              <HeaderActionCapsule
                close={{
                  ariaLabel: t('profile.followDialog.close'),
                  onClick: () => close(),
                }}
              />
            </div>
          </header>

          <DialogBody disableDefaultSpacing className="gap-0 p-4">
            <ProfileFollowDialogList
              activeTab={activeTab}
              emptyMessage={emptyMessage}
              fetchNextPage={activeQuery.fetchNextPage}
              hasNextPage={activeQuery.hasNextPage}
              isError={activeQuery.isError}
              isFetchingNextPage={activeQuery.isFetchingNextPage}
              isLoading={activeQuery.isLoading}
              isOwnProfile={isOwnProfile}
              items={activeQuery.items}
              loadMoreRef={activeQuery.loadMoreRef}
              onClose={onClose}
              onRetry={() => void activeQuery.refetch()}
              profileUsername={username}
            />
          </DialogBody>
        </>
      )}
    </Dialog>
  );
}
