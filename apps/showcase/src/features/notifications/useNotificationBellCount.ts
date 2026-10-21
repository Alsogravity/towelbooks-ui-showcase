import { useFollowRequestsSummary } from '../follow-requests/useFollowRequestsSummary';
import { useRoomMemberInvitesSummary } from '../room-member-invites/useRoomMemberInvitesSummary';
import { useRoomJoinRequestsSummary } from '../room-join-requests/useRoomJoinRequestsSummary';
import { useUnreadNotificationsCount } from './useNotifications';

export function useNotificationBellCount(options?: { enabled?: boolean }) {
  const unreadNotificationsCountQuery = useUnreadNotificationsCount(options);
  const followRequestsSummaryQuery = useFollowRequestsSummary(options);
  const roomJoinRequestsSummaryQuery = useRoomJoinRequestsSummary(options);
  const roomMemberInvitesSummaryQuery = useRoomMemberInvitesSummary(options);

  return {
    count:
      (unreadNotificationsCountQuery.data?.count ?? 0) +
      (followRequestsSummaryQuery.data?.unseenCount ?? 0) +
      (roomJoinRequestsSummaryQuery.data?.unseenCount ?? 0) +
      (roomMemberInvitesSummaryQuery.data?.unseenCount ?? 0),
    followRequestsSummaryQuery,
    roomJoinRequestsSummaryQuery,
    roomMemberInvitesSummaryQuery,
    unreadNotificationsCountQuery,
  };
}
