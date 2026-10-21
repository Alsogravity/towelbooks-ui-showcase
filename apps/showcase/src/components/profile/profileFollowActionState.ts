import type { ProfileAccess } from '@towelbooks/schemas';

export type ProfileFollowActionState =
  | 'edit'
  | 'follow'
  | 'follow_back'
  | 'request_follow'
  | 'requested'
  | 'following';

export function deriveProfileFollowActionState(input: {
  isOwn: boolean;
  access: ProfileAccess;
}): ProfileFollowActionState {
  if (input.isOwn) {
    return 'edit';
  }

  const { followStatus, followedByStatus, visibility } = input.access;

  if (followStatus === 'active') {
    return 'following';
  }

  if (followStatus === 'requested') {
    return 'requested';
  }

  if (followedByStatus === 'active' && followStatus === 'none') {
    return 'follow_back';
  }

  if (visibility === 'private' && followStatus === 'none') {
    return 'request_follow';
  }

  return 'follow';
}

export function isProfileFollowUnfollowAction(
  actionState: ProfileFollowActionState,
): boolean {
  return actionState === 'following' || actionState === 'requested';
}
