import { type ProfileFollowListItem } from '@towelbooks/schemas';
import { Link } from 'react-router';
import { type RefObject, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { LoadingState, useToast, CircleSpinner } from '../feedback';
import { Avatar, Button, Icon } from '../primitives';
import { createApiProblemToast } from '../../features/errors';
import { useI18n } from '../../i18n';
import { sdk } from '../../lib/sdk';
import { type ProfileFollowDialogTab } from './profileFollowDialogShared';
import { ProfileFollowListRowAction } from './ProfileFollowListRowAction';
import { ProfileFollowRemoveFollowerDialog } from './ProfileFollowRemoveFollowerDialog';

export function ProfileFollowDialogList({
  activeTab,
  emptyMessage,
  fetchNextPage,
  hasNextPage,
  isError,
  isFetchingNextPage,
  isLoading,
  isOwnProfile,
  items,
  loadMoreRef,
  onClose,
  onRetry,
  profileUsername,
}: {
  activeTab: ProfileFollowDialogTab;
  emptyMessage: string;
  fetchNextPage: () => Promise<unknown>;
  hasNextPage: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  isOwnProfile: boolean;
  items: ProfileFollowListItem[];
  loadMoreRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onRetry: () => void;
  profileUsername: string;
}) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { pushToast } = useToast();
  const [followerPendingRemoval, setFollowerPendingRemoval] =
    useState<ProfileFollowListItem | null>(null);
  const panelId = `profile-follow-dialog-tab-${activeTab}-panel`;
  const showRemoveFollower = isOwnProfile && activeTab === 'followers';

  const removeFollowerMutation = useMutation({
    mutationFn: async (follower: ProfileFollowListItem) => {
      await sdk.users.me.removeFollower(follower.id);
    },
    onSuccess: async (_data, follower) => {
      setFollowerPendingRemoval(null);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['profiles', profileUsername, 'followers'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['profiles', profileUsername],
        }),
        queryClient.invalidateQueries({
          queryKey: ['profiles', follower.username],
        }),
      ]);
    },
    onError: (error: unknown) => {
      pushToast(
        createApiProblemToast(error, {
          fallbackKey: 'profile.followDialog.removeFollower.error',
          t,
        }),
      );
    },
  });

  if (isLoading) {
    return (
      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={`profile-follow-dialog-tab-${activeTab}`}
        className="px-6 py-8"
      >
        <LoadingState label={{ key: 'profile.followDialog.loading' }} />
      </div>
    );
  }

  if (isError) {
    return (
      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={`profile-follow-dialog-tab-${activeTab}`}
        className="flex flex-col gap-4 px-6 py-8"
      >
        <p className="app-text-supporting-copy text-ink-3">
          {t('profile.followDialog.error')}
        </p>
        <div>
          <Button type="button" variant="secondary" onClick={onRetry}>
            {t('errors.action.retry')}
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={`profile-follow-dialog-tab-${activeTab}`}
        className="px-6 py-8"
      >
        <p className="app-text-supporting-copy text-ink-3">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={`profile-follow-dialog-tab-${activeTab}`}
      >
        <ul className="space-y-0">
          {items.map((profile) => (
            <ProfileFollowDialogListItem
              key={profile.id}
              activeTab={activeTab}
              onClose={onClose}
              onRemoveFollower={
                showRemoveFollower ? setFollowerPendingRemoval : undefined
              }
              profile={profile}
              profileUsername={profileUsername}
            />
          ))}
        </ul>
        {hasNextPage ? (
          <div
            ref={loadMoreRef}
            className="flex justify-center px-6 py-4"
            aria-live="polite"
          >
            {isFetchingNextPage ? (
              <div className="flex justify-center text-ink-3">
                <CircleSpinner label={t('profile.followDialog.loadingMore')} />
              </div>
            ) : (
              <Button
                type="button"
                variant="secondary"
                onClick={() => void fetchNextPage()}
              >
                {t('profile.followDialog.loadMore')}
              </Button>
            )}
          </div>
        ) : null}
      </div>

      {followerPendingRemoval ? (
        <ProfileFollowRemoveFollowerDialog
          follower={followerPendingRemoval}
          isPending={removeFollowerMutation.isPending}
          onClose={() => setFollowerPendingRemoval(null)}
          onConfirm={() =>
            removeFollowerMutation.mutate(followerPendingRemoval)
          }
        />
      ) : null}
    </>
  );
}

function ProfileFollowDialogListItem({
  activeTab,
  onClose,
  onRemoveFollower,
  profile,
  profileUsername,
}: {
  activeTab: ProfileFollowDialogTab;
  onClose: () => void;
  onRemoveFollower?: (profile: ProfileFollowListItem) => void;
  profile: ProfileFollowListItem;
  profileUsername: string;
}) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { pushToast } = useToast();
  const displayName = profile.displayName?.trim() || profile.username;
  const relationship = profile.viewerRelationship;
  const isFollowing = relationship?.viewerFollowsUser === 'active';
  const isFollowRequested = relationship?.viewerFollowsUser === 'requested';

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!relationship) {
        return;
      }

      if (isFollowing || isFollowRequested) {
        await sdk.users.unfollowProfile(profile.username);
        return;
      }

      await sdk.users.followProfile(profile.username);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['profiles', profileUsername, 'followers'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['profiles', profileUsername, 'following'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['profiles', profileUsername],
        }),
        queryClient.invalidateQueries({
          queryKey: ['profiles', profile.username],
        }),
      ]);
    },
    onError: (error: unknown) => {
      pushToast(
        createApiProblemToast(error, {
          fallbackKey:
            isFollowing || isFollowRequested
              ? 'profile.action.unfollow.error'
              : 'profile.action.follow.error',
          t,
        }),
      );
    },
  });

  return (
    <li className="flex min-w-0 items-center gap-3 rounded-[var(--radius-paper-4)] border border-transparent bg-paper px-4 py-3 transition-colors hover:bg-vellum/60">
      <Link
        to={`/${profile.username}`}
        onClick={onClose}
        className="flex min-w-0 flex-1 items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick/40"
      >
        <Avatar
          background={profile.avatar.background}
          foreground={profile.avatar.foreground}
          imageAlt={displayName}
          imageUrl={profile.avatar.imageUrl}
          initial={profile.avatar.initial}
          size="md"
          className="shrink-0"
        />
        <span className="min-w-0 flex-1">
          <span className="app-text-row-title block truncate text-ink">
            {displayName}
          </span>
          <span className="app-text-metadata block truncate text-ink-3">
            {t('profile.handle', { values: { handle: profile.username } })}
          </span>
          {profile.bio ? (
            <span className="app-text-supporting-copy mt-1 line-clamp-2 block text-ink-3">
              {profile.bio}
            </span>
          ) : null}
        </span>
      </Link>
      {relationship ? (
        <ProfileFollowListRowAction
          activeTab={activeTab}
          isPending={followMutation.isPending}
          relationship={relationship}
          onToggle={() => void followMutation.mutate()}
        />
      ) : null}
      {onRemoveFollower ? (
        <button
          type="button"
          aria-label={t('profile.followDialog.removeFollower')}
          className="inline-flex shrink-0 items-center justify-center rounded p-1 text-ink-3 transition-colors hover:bg-vellum/60 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick/40"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onRemoveFollower(profile);
          }}
        >
          <Icon name="x" size={18} />
        </button>
      ) : null}
    </li>
  );
}
