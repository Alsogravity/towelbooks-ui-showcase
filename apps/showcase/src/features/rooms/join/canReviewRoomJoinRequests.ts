import type { RoomViewer } from '@towelbooks/schemas';

/**
 * Owners and admins may review join requests implicitly; the API does not
 * include that right in `viewer.capabilities`. Moderators need an explicit
 * `join_requests_review` grant.
 */
export function canReviewRoomJoinRequests(
  viewer: Pick<RoomViewer, 'role' | 'capabilities'> | null | undefined,
): boolean {
  if (viewer == null) {
    return false;
  }

  if (viewer.role === 'owner' || viewer.role === 'admin') {
    return true;
  }

  return viewer.capabilities.includes('join_requests_review');
}
