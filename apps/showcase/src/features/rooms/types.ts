import type {
  Room as RoomContract,
  RoomDetail as RoomDetailContract,
  RoomListItem as RoomListItemContract,
  RoomMember as RoomMemberContract,
  RoomMemberManagementDetail as RoomMemberManagementDetailContract,
  RoomMemberManagementEvent as RoomMemberManagementEventContract,
  PaginatedRoomMemberManagementHistoryResponse as PaginatedRoomMemberManagementHistoryResponseContract,
  RoomOverview as RoomOverviewContract,
  RoomOverviewMember as RoomOverviewMemberContract,
  CommunitySettings as CommunitySettingsContract,
  Discussion as DiscussionContract,
  PaginatedPollsResponse as PaginatedPollsResponseContract,
  Poll as PollContract,
  PollListItem as PollListItemContract,
  RoomInvite as RoomInviteContract,
  RoomInviteDetailsResponse as RoomInviteDetailsResponseContract,
} from '@towelbooks/schemas';

export type Room = RoomContract;
export type RoomDetail = RoomDetailContract;
export type RoomListItem = RoomListItemContract;
export type RoomMember = RoomMemberContract;
export type RoomMemberManagementDetail = RoomMemberManagementDetailContract;
export type RoomMemberManagementEvent = RoomMemberManagementEventContract;
export type PaginatedRoomMemberManagementHistoryResponse =
  PaginatedRoomMemberManagementHistoryResponseContract;

export type RoomOverview = RoomOverviewContract;
export type RoomOverviewMember = RoomOverviewMemberContract;
export type CommunitySettings = CommunitySettingsContract;
export type Discussion = DiscussionContract;
export type PaginatedPollsResponse = PaginatedPollsResponseContract;
export type Poll = PollContract;
export type PollListItem = PollListItemContract;

export type RoomInvite = RoomInviteContract;
export type RoomInviteDetailsResponse = RoomInviteDetailsResponseContract;
