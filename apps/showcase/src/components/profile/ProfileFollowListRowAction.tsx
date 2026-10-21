import { type ProfileFollowListViewerRelationship } from '@towelbooks/schemas';

import { useI18n } from '../../i18n';
import { Button } from '../primitives';
import { type ProfileFollowDialogTab } from './profileFollowDialogShared';

export function getProfileFollowListRowActionKey(
  relationship: ProfileFollowListViewerRelationship,
): 'followBack' | 'follow' | 'following' | 'requested' | null {
  if (relationship.canUnfollow) {
    return relationship.viewerFollowsUser === 'requested'
      ? 'requested'
      : 'following';
  }

  if (relationship.canFollowBack) {
    return 'followBack';
  }

  if (relationship.canFollow) {
    return 'follow';
  }

  return null;
}

export function getProfileFollowListRowActionLabelKey(
  actionKey: NonNullable<ReturnType<typeof getProfileFollowListRowActionKey>>,
  activeTab: ProfileFollowDialogTab,
): string {
  if (actionKey === 'followBack') {
    return 'profile.action.followBack';
  }

  if (actionKey === 'follow') {
    return 'profile.action.follow';
  }

  if (actionKey === 'requested') {
    return 'profile.action.requested';
  }

  return activeTab === 'following'
    ? 'profile.action.unfollow'
    : 'profile.action.following';
}

export function ProfileFollowListRowAction({
  activeTab,
  isPending = false,
  onToggle,
  relationship,
}: {
  activeTab: ProfileFollowDialogTab;
  isPending?: boolean;
  onToggle: () => void;
  relationship: ProfileFollowListViewerRelationship;
}) {
  const { t } = useI18n();
  const actionKey = getProfileFollowListRowActionKey(relationship);

  if (!actionKey) {
    return null;
  }

  const labelKey = getProfileFollowListRowActionLabelKey(actionKey, activeTab);
  const loadingKey =
    actionKey === 'following'
      ? 'profile.action.unfollow.loading'
      : actionKey === 'requested'
        ? 'profile.action.cancelRequest.loading'
        : 'profile.action.follow.loading';
  const isSecondary = actionKey === 'following' || actionKey === 'requested';

  return (
    <Button
      type="button"
      variant={isSecondary ? 'secondary' : 'primary'}
      size="sm"
      className="shrink-0"
      isLoading={isPending}
      loadingLabel={t(loadingKey)}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggle();
      }}
    >
      {t(labelKey)}
    </Button>
  );
}
