import type {
  ProfileFollowAccessStatus,
  ProfileFollowListViewerRelationship,
} from './profile.js';

export function mapFollowAccessStatus(
  status: 'active' | 'requested' | null | undefined,
): ProfileFollowAccessStatus {
  if (status === 'active') {
    return 'active';
  }

  if (status === 'requested') {
    return 'requested';
  }

  return 'none';
}

export function buildProfileFollowListViewerRelationship(input: {
  viewerUserId: string;
  listedUserId: string;
  viewerToListedStatus: 'active' | 'requested' | null | undefined;
  listedToViewerStatus: 'active' | 'requested' | null | undefined;
}): ProfileFollowListViewerRelationship {
  const viewerFollowsUser = mapFollowAccessStatus(input.viewerToListedStatus);
  const userFollowsViewer = mapFollowAccessStatus(input.listedToViewerStatus);
  const isSelf = input.viewerUserId === input.listedUserId;

  return {
    viewerFollowsUser,
    userFollowsViewer,
    canFollow: !isSelf && viewerFollowsUser === 'none',
    canUnfollow:
      !isSelf &&
      (viewerFollowsUser === 'active' || viewerFollowsUser === 'requested'),
    canFollowBack:
      !isSelf && userFollowsViewer === 'active' && viewerFollowsUser === 'none',
  };
}
