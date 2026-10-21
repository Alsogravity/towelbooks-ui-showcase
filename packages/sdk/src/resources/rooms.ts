import {
  roomAnnouncementSchema,
  roomMeetingSchema,
  roomMemberAccessSchema,
  roomMemberManagementDetailSchema,
  paginatedRoomMemberManagementHistoryResponseSchema,
  roomDetailSchema,
  roomOverviewSchema,
  roomSchema,
  messageResponseSchema,
  paginatedRoomAnnouncementsResponseSchema,
  paginatedRoomMeetingsResponseSchema,
  paginatedRoomDiscoveryResponseSchema,
  paginatedRoomMembersResponseSchema,
  paginatedRoomBannedMembersResponseSchema,
  type BanRoomMemberRequest,
  paginatedRoomListResponseSchema,
  type RemoveRoomMemberRequest,
  type RestoreRoomMemberManualAccessRequest,
  type RevokeRoomMemberManualAccessRequest,
  type RevokeRoomMemberInviteAccessRequest,
  type RestoreRoomMemberInviteAccessRequest,
  type SetRoomMemberManualAccessRequest,
  type SuspendRoomMemberRequest,
  type UnsuspendRoomMemberRequest,
  type UnbanRoomMemberRequest,
  type RoomAnnouncement,
  type RoomMeeting,
  type RoomMeetingScope,
  type RoomMemberAccess,
  type RoomMemberManagementDetail,
  type RoomDetail,
  type RoomOverview,
  type CreateRoomAnnouncementRequest,
  type CreateRoomMeetingRequest,
  type CreateRoomRequest,
  type Room,
  type MessageResponse,
  type PaginatedRoomAnnouncementsResponse,
  type PaginatedRoomMeetingsResponse,
  type PaginatedRoomDiscoveryResponse,
  type PaginatedRoomMemberManagementHistoryResponse,
  type PaginatedRoomMembersResponse,
  type PaginatedRoomBannedMembersResponse,
  type PaginatedRoomListResponse,
  type UpdateRoomAnnouncementRequest,
  type UpdateRoomMeetingRequest,
  type UpdateRoomMemberRoleRequest,
  type UpdateRoomRequest,
  type ReplaceExternalLinksRequest,
  type ReplaceExternalLinksResponse,
  replaceExternalLinksRequestSchema,
  replaceExternalLinksResponseSchema,
  joinRoomResponseSchema,
  createRoomJoinRequestResponseSchema,
  paginatedRoomJoinRequestsResponseSchema,
  roomJoinRequestActionResponseSchema,
  roomRoleCapabilitiesResponseSchema,
  createRoomMemberInviteRequestSchema,
  createRoomMemberInviteResponseSchema,
  paginatedRoomMemberInvitesResponseSchema,
  revokeRoomMemberInviteResponseSchema,
  type JoinRoomResponse,
  type CreateRoomJoinRequestResponse,
  type PaginatedRoomJoinRequestsResponse,
  type RoomJoinRequestActionResponse,
  type RoomRoleCapabilitiesResponse,
  type UpdateRoomRoleCapabilitiesRequest,
  type CreateRoomMemberInviteRequest,
  type CreateRoomMemberInviteResponse,
  type PaginatedRoomMemberInvitesResponse,
  type RevokeRoomMemberInviteResponse,
} from '@towelbooks/schemas';

import {
  createRoomsAvatarResource,
  type RoomsAvatarResource,
} from './rooms-avatar.js';
import {
  createRoomsBannerResource,
  type RoomsBannerResource,
} from './rooms-banner.js';

import type { Transport } from '../transport.js';

export type RoomsResource = {
  list(query?: {
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedRoomListResponse>;
  discover(query?: {
    q?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedRoomDiscoveryResponse>;
  get(roomId: string): Promise<RoomDetail>;
  getOverview(roomId: string): Promise<RoomOverview>;
  create(body: CreateRoomRequest): Promise<Room>;
  archive(roomId: string): Promise<Room>;
  update(roomId: string, body: UpdateRoomRequest): Promise<Room>;
  replaceLinks(
    roomId: string,
    body: ReplaceExternalLinksRequest,
  ): Promise<ReplaceExternalLinksResponse>;
  listMembers(
    roomId: string,
    query?: {
      cursor?: string;
      limit?: number;
      q?: string;
    },
  ): Promise<PaginatedRoomMembersResponse>;
  listBannedMembers(
    roomId: string,
    query?: {
      cursor?: string;
      limit?: number;
      q?: string;
    },
  ): Promise<PaginatedRoomBannedMembersResponse>;
  getMemberManagementDetail(
    roomId: string,
    memberId: string,
  ): Promise<RoomMemberManagementDetail>;
  listMemberManagementHistory(
    roomId: string,
    memberId: string,
    query?: {
      page?: number;
      pageSize?: number;
    },
  ): Promise<PaginatedRoomMemberManagementHistoryResponse>;
  updateMemberRole(
    roomId: string,
    memberId: string,
    body: UpdateRoomMemberRoleRequest,
  ): Promise<RoomMemberManagementDetail>;
  leave(roomId: string): Promise<MessageResponse>;
  removeMember(
    roomId: string,
    memberId: string,
    body: RemoveRoomMemberRequest,
  ): Promise<MessageResponse>;
  suspendMember(
    roomId: string,
    memberId: string,
    body: SuspendRoomMemberRequest,
  ): Promise<RoomMemberManagementDetail>;
  unsuspendMember(
    roomId: string,
    memberId: string,
    body: UnsuspendRoomMemberRequest,
  ): Promise<RoomMemberManagementDetail>;
  banMember(
    roomId: string,
    memberId: string,
    body: BanRoomMemberRequest,
  ): Promise<MessageResponse>;
  unbanMember(
    roomId: string,
    memberId: string,
    body: UnbanRoomMemberRequest,
  ): Promise<MessageResponse>;
  transferOwnership(
    roomId: string,
    memberId: string,
  ): Promise<RoomMemberManagementDetail>;
  getMemberAccess(roomId: string, memberId: string): Promise<RoomMemberAccess>;
  setMemberManualAccess(
    roomId: string,
    memberId: string,
    body: SetRoomMemberManualAccessRequest,
  ): Promise<RoomMemberManagementDetail>;
  revokeMemberManualAccess(
    roomId: string,
    memberId: string,
    body: RevokeRoomMemberManualAccessRequest,
  ): Promise<RoomMemberManagementDetail>;
  restoreMemberManualAccess(
    roomId: string,
    memberId: string,
    body: RestoreRoomMemberManualAccessRequest,
  ): Promise<RoomMemberManagementDetail>;
  revokeMemberInviteAccess(
    roomId: string,
    memberId: string,
    body: RevokeRoomMemberInviteAccessRequest,
  ): Promise<RoomMemberManagementDetail>;
  restoreMemberInviteAccess(
    roomId: string,
    memberId: string,
    body: RestoreRoomMemberInviteAccessRequest,
  ): Promise<RoomMemberManagementDetail>;
  listAnnouncements(
    roomId: string,
    query?: {
      page?: number;
      pageSize?: number;
    },
  ): Promise<PaginatedRoomAnnouncementsResponse>;
  createAnnouncement(
    roomId: string,
    body: CreateRoomAnnouncementRequest,
  ): Promise<RoomAnnouncement>;
  updateAnnouncement(
    roomId: string,
    announcementId: string,
    body: UpdateRoomAnnouncementRequest,
  ): Promise<RoomAnnouncement>;
  archiveAnnouncement(
    roomId: string,
    announcementId: string,
  ): Promise<MessageResponse>;
  listMeetings(
    roomId: string,
    query?: {
      scope?: RoomMeetingScope;
      page?: number;
      pageSize?: number;
    },
  ): Promise<PaginatedRoomMeetingsResponse>;
  getMeeting(roomId: string, meetingId: string): Promise<RoomMeeting>;
  createMeeting(
    roomId: string,
    body: CreateRoomMeetingRequest,
  ): Promise<RoomMeeting>;
  updateMeeting(
    roomId: string,
    meetingId: string,
    body: UpdateRoomMeetingRequest,
  ): Promise<RoomMeeting>;
  cancelMeeting(roomId: string, meetingId: string): Promise<RoomMeeting>;
  join(roomId: string): Promise<JoinRoomResponse>;
  createJoinRequest(roomId: string): Promise<CreateRoomJoinRequestResponse>;
  cancelJoinRequest(roomId: string): Promise<MessageResponse>;
  listJoinRequests(
    roomId: string,
    query?: {
      page?: number;
      pageSize?: number;
      q?: string;
    },
  ): Promise<PaginatedRoomJoinRequestsResponse>;
  acceptJoinRequest(
    roomId: string,
    requestId: string,
  ): Promise<RoomJoinRequestActionResponse>;
  declineJoinRequest(
    roomId: string,
    requestId: string,
  ): Promise<RoomJoinRequestActionResponse>;
  createMemberInvite(
    roomId: string,
    body: CreateRoomMemberInviteRequest,
  ): Promise<CreateRoomMemberInviteResponse>;
  listMemberInvites(
    roomId: string,
    query?: {
      page?: number;
      pageSize?: number;
      q?: string;
    },
  ): Promise<PaginatedRoomMemberInvitesResponse>;
  revokeMemberInvite(
    roomId: string,
    inviteId: string,
  ): Promise<RevokeRoomMemberInviteResponse>;
  getRoleCapabilities(roomId: string): Promise<RoomRoleCapabilitiesResponse>;
  updateRoleCapabilities(
    roomId: string,
    body: UpdateRoomRoleCapabilitiesRequest,
  ): Promise<RoomRoleCapabilitiesResponse>;
  avatar: RoomsAvatarResource;
  banner: RoomsBannerResource;
};

export function createRoomsResource(transport: Transport): RoomsResource {
  return {
    avatar: createRoomsAvatarResource(transport),
    banner: createRoomsBannerResource(transport),
    list(query = {}) {
      return transport.request({
        method: 'GET',
        path: '/rooms',
        query,
        schema: paginatedRoomListResponseSchema,
      });
    },
    discover(query = {}) {
      return transport.request({
        method: 'GET',
        path: '/rooms/discover',
        query,
        schema: paginatedRoomDiscoveryResponseSchema,
      });
    },
    get(roomId) {
      return transport.request({
        method: 'GET',
        path: '/rooms/:roomId',
        pathParams: { roomId },
        schema: roomDetailSchema,
      });
    },
    getOverview(roomId) {
      return transport.request({
        method: 'GET',
        path: '/rooms/:roomId/overview',
        pathParams: { roomId },
        schema: roomOverviewSchema,
      });
    },
    create(body) {
      return transport.request({
        method: 'POST',
        path: '/rooms',
        body,
        schema: roomSchema,
      });
    },
    archive(roomId) {
      return transport.request({
        method: 'POST',
        path: '/rooms/:roomId/archive',
        pathParams: { roomId },
        schema: roomSchema,
      });
    },
    update(roomId, body) {
      return transport.request({
        method: 'PATCH',
        path: '/rooms/:roomId',
        pathParams: { roomId },
        body,
        schema: roomSchema,
      });
    },
    replaceLinks(roomId, body) {
      return transport.request({
        method: 'PUT',
        path: '/rooms/:roomId/links',
        pathParams: { roomId },
        body: replaceExternalLinksRequestSchema.parse(body),
        schema: replaceExternalLinksResponseSchema,
      });
    },
    listMembers(roomId, query = {}) {
      return transport.request({
        method: 'GET',
        path: '/rooms/:roomId/members',
        pathParams: { roomId },
        query,
        schema: paginatedRoomMembersResponseSchema,
      });
    },
    listBannedMembers(roomId, query = {}) {
      return transport.request({
        method: 'GET',
        path: '/rooms/:roomId/members/banned',
        pathParams: { roomId },
        query,
        schema: paginatedRoomBannedMembersResponseSchema,
      });
    },
    getMemberManagementDetail(roomId, memberId) {
      return transport.request({
        method: 'GET',
        path: '/rooms/:roomId/members/:memberId/management',
        pathParams: { roomId, memberId },
        schema: roomMemberManagementDetailSchema,
      });
    },
    listMemberManagementHistory(roomId, memberId, query = {}) {
      return transport.request({
        method: 'GET',
        path: '/rooms/:roomId/members/:memberId/management/history',
        pathParams: { roomId, memberId },
        query,
        schema: paginatedRoomMemberManagementHistoryResponseSchema,
      });
    },
    updateMemberRole(roomId, memberId, body) {
      return transport.request({
        method: 'POST',
        path: '/rooms/:roomId/members/:memberId/role-updates',
        pathParams: { roomId, memberId },
        body,
        schema: roomMemberManagementDetailSchema,
      });
    },
    leave(roomId) {
      return transport.request({
        method: 'DELETE',
        path: '/rooms/:roomId/membership',
        pathParams: { roomId },
        schema: messageResponseSchema,
      });
    },
    removeMember(roomId, memberId, body) {
      return transport.request({
        method: 'POST',
        path: '/rooms/:roomId/members/:memberId/removal',
        pathParams: { roomId, memberId },
        body,
        schema: messageResponseSchema,
      });
    },
    suspendMember(roomId, memberId, body) {
      return transport.request({
        method: 'POST',
        path: '/rooms/:roomId/members/:memberId/suspension',
        pathParams: { roomId, memberId },
        body,
        schema: roomMemberManagementDetailSchema,
      });
    },
    unsuspendMember(roomId, memberId, body) {
      return transport.request({
        method: 'POST',
        path: '/rooms/:roomId/members/:memberId/unsuspension',
        pathParams: { roomId, memberId },
        body,
        schema: roomMemberManagementDetailSchema,
      });
    },
    banMember(roomId, memberId, body) {
      return transport.request({
        method: 'POST',
        path: '/rooms/:roomId/members/:memberId/bans',
        pathParams: { roomId, memberId },
        body,
        schema: messageResponseSchema,
      });
    },
    unbanMember(roomId, memberId, body) {
      return transport.request({
        method: 'POST',
        path: '/rooms/:roomId/members/:memberId/unbans',
        pathParams: { roomId, memberId },
        body,
        schema: messageResponseSchema,
      });
    },
    transferOwnership(roomId, memberId) {
      return transport.request({
        method: 'POST',
        path: '/rooms/:roomId/members/:memberId/ownership-transfers',
        pathParams: { roomId, memberId },
        body: {},
        schema: roomMemberManagementDetailSchema,
      });
    },
    getMemberAccess(roomId, memberId) {
      return transport.request({
        method: 'GET',
        path: '/rooms/:roomId/members/:memberId/access',
        pathParams: { roomId, memberId },
        schema: roomMemberAccessSchema,
      });
    },
    setMemberManualAccess(roomId, memberId, body) {
      return transport.request({
        method: 'PUT',
        path: '/rooms/:roomId/members/:memberId/access/manual',
        pathParams: { roomId, memberId },
        body,
        schema: roomMemberManagementDetailSchema,
      });
    },
    revokeMemberManualAccess(roomId, memberId, body) {
      return transport.request({
        method: 'POST',
        path: '/rooms/:roomId/members/:memberId/access/manual/revocations',
        pathParams: { roomId, memberId },
        body,
        schema: roomMemberManagementDetailSchema,
      });
    },
    restoreMemberManualAccess(roomId, memberId, body) {
      return transport.request({
        method: 'POST',
        path: '/rooms/:roomId/members/:memberId/access/manual/restorations',
        pathParams: { roomId, memberId },
        body,
        schema: roomMemberManagementDetailSchema,
      });
    },
    revokeMemberInviteAccess(roomId, memberId, body) {
      return transport.request({
        method: 'POST',
        path: '/rooms/:roomId/members/:memberId/access/invite/revocations',
        pathParams: { roomId, memberId },
        body,
        schema: roomMemberManagementDetailSchema,
      });
    },
    restoreMemberInviteAccess(roomId, memberId, body) {
      return transport.request({
        method: 'POST',
        path: '/rooms/:roomId/members/:memberId/access/invite/restorations',
        pathParams: { roomId, memberId },
        body,
        schema: roomMemberManagementDetailSchema,
      });
    },
    listAnnouncements(roomId, query = {}) {
      return transport.request({
        method: 'GET',
        path: '/rooms/:roomId/announcements',
        pathParams: { roomId },
        query,
        schema: paginatedRoomAnnouncementsResponseSchema,
      });
    },
    createAnnouncement(roomId, body) {
      return transport.request({
        method: 'POST',
        path: '/rooms/:roomId/announcements',
        pathParams: { roomId },
        body,
        schema: roomAnnouncementSchema,
      });
    },
    updateAnnouncement(roomId, announcementId, body) {
      return transport.request({
        method: 'PATCH',
        path: '/rooms/:roomId/announcements/:announcementId',
        pathParams: { roomId, announcementId },
        body,
        schema: roomAnnouncementSchema,
      });
    },
    archiveAnnouncement(roomId, announcementId) {
      return transport.request({
        method: 'DELETE',
        path: '/rooms/:roomId/announcements/:announcementId',
        pathParams: { roomId, announcementId },
        schema: messageResponseSchema,
      });
    },
    listMeetings(roomId, query = {}) {
      return transport.request({
        method: 'GET',
        path: '/rooms/:roomId/meetings',
        pathParams: { roomId },
        query,
        schema: paginatedRoomMeetingsResponseSchema,
      });
    },
    getMeeting(roomId, meetingId) {
      return transport.request({
        method: 'GET',
        path: '/rooms/:roomId/meetings/:meetingId',
        pathParams: { roomId, meetingId },
        schema: roomMeetingSchema,
      });
    },
    createMeeting(roomId, body) {
      return transport.request({
        method: 'POST',
        path: '/rooms/:roomId/meetings',
        pathParams: { roomId },
        body,
        schema: roomMeetingSchema,
      });
    },
    updateMeeting(roomId, meetingId, body) {
      return transport.request({
        method: 'PATCH',
        path: '/rooms/:roomId/meetings/:meetingId',
        pathParams: { roomId, meetingId },
        body,
        schema: roomMeetingSchema,
      });
    },
    cancelMeeting(roomId, meetingId) {
      return transport.request({
        method: 'DELETE',
        path: '/rooms/:roomId/meetings/:meetingId',
        pathParams: { roomId, meetingId },
        schema: roomMeetingSchema,
      });
    },
    join(roomId) {
      return transport.request({
        method: 'POST',
        path: '/rooms/:roomId/join',
        pathParams: { roomId },
        schema: joinRoomResponseSchema,
      });
    },
    createJoinRequest(roomId) {
      return transport.request({
        method: 'POST',
        path: '/rooms/:roomId/join-requests',
        pathParams: { roomId },
        schema: createRoomJoinRequestResponseSchema,
      });
    },
    cancelJoinRequest(roomId) {
      return transport.request({
        method: 'DELETE',
        path: '/rooms/:roomId/join-requests/mine',
        pathParams: { roomId },
        schema: messageResponseSchema,
      });
    },
    listJoinRequests(roomId, query = {}) {
      return transport.request({
        method: 'GET',
        path: '/rooms/:roomId/join-requests',
        pathParams: { roomId },
        query,
        schema: paginatedRoomJoinRequestsResponseSchema,
      });
    },
    acceptJoinRequest(roomId, requestId) {
      return transport.request({
        method: 'POST',
        path: '/rooms/:roomId/join-requests/:requestId/accept',
        pathParams: { roomId, requestId },
        schema: roomJoinRequestActionResponseSchema,
      });
    },
    declineJoinRequest(roomId, requestId) {
      return transport.request({
        method: 'POST',
        path: '/rooms/:roomId/join-requests/:requestId/decline',
        pathParams: { roomId, requestId },
        schema: roomJoinRequestActionResponseSchema,
      });
    },
    createMemberInvite(roomId, body) {
      return transport.request({
        method: 'POST',
        path: '/rooms/:roomId/member-invites',
        pathParams: { roomId },
        body: createRoomMemberInviteRequestSchema.parse(body),
        schema: createRoomMemberInviteResponseSchema,
      });
    },
    listMemberInvites(roomId, query = {}) {
      return transport.request({
        method: 'GET',
        path: '/rooms/:roomId/member-invites',
        pathParams: { roomId },
        query,
        schema: paginatedRoomMemberInvitesResponseSchema,
      });
    },
    revokeMemberInvite(roomId, inviteId) {
      return transport.request({
        method: 'DELETE',
        path: '/rooms/:roomId/member-invites/:inviteId',
        pathParams: { roomId, inviteId },
        schema: revokeRoomMemberInviteResponseSchema,
      });
    },
    getRoleCapabilities(roomId) {
      return transport.request({
        method: 'GET',
        path: '/rooms/:roomId/role-capabilities',
        pathParams: { roomId },
        schema: roomRoleCapabilitiesResponseSchema,
      });
    },
    updateRoleCapabilities(roomId, body) {
      return transport.request({
        method: 'PUT',
        path: '/rooms/:roomId/role-capabilities',
        pathParams: { roomId },
        body,
        schema: roomRoleCapabilitiesResponseSchema,
      });
    },
  };
}
