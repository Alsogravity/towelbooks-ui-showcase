import {
  acceptRequiredLegalAcceptancesRequestSchema,
  changePasswordRequestSchema,
  changePasswordResponseSchema,
  cancelAccountDeletionResponseSchema,
  cancelPrivacyRequestResponseSchema,
  confirmAccountDeletionResponseSchema,
  continueReadingResponseSchema,
  deleteAccountResponseSchema,
  incomingFollowRequestsSummaryResponseSchema,
  incomingFollowRequestsResponseSchema,
  markIncomingFollowRequestsSeenRequestSchema,
  markRoomJoinRequestsSeenRequestSchema,
  roomJoinRequestsSummaryResponseSchema,
  markRoomMemberInvitesSeenRequestSchema,
  roomMemberInvitesSummaryResponseSchema,
  paginatedIncomingRoomMemberInvitesResponseSchema,
  roomMemberInviteActionResponseSchema,
  meResponseSchema,
  messageResponseSchema,
  myInsightsResponseSchema,
  paginatedActivityEventsResponseSchema,
  profileCatalogReviewsResponseSchema,
  profileCatalogReviewsQuerySchema,
  profileBooksReadResponseSchema,
  profileRoomsResponseSchema,
  profileFollowListResponseSchema,
  profileRatingsResponseSchema,
  profileResponseSchema,
  privacyExportResponseSchema,
  privacyRequestSchema,
  privacyRequestsResponseSchema,
  readingCategoryPreferencesResponseSchema,
  replaceReadingCategoryPreferencesRequestSchema,
  createPrivacyRequestRequestSchema,
  type CancelAccountDeletionRequest,
  type CancelAccountDeletionResponse,
  type AcceptRequiredLegalAcceptancesRequest,
  type ChangePasswordRequest,
  type ChangePasswordResponse,
  type ConfirmAccountDeletionRequest,
  type ConfirmAccountDeletionResponse,
  type ContinueReadingResponse,
  homeResponseSchema,
  type HomeResponse,
  type CreatePrivacyRequestRequest,
  type DeleteAccountRequest,
  type DeleteAccountResponse,
  type IncomingFollowRequestsQuery,
  type IncomingFollowRequestsSummaryResponse,
  type IncomingFollowRequestsResponse,
  type ListProfileActivityEventsQuery,
  type MarkIncomingFollowRequestsSeenRequest,
  type MarkRoomJoinRequestsSeenRequest,
  type RoomJoinRequestsSummaryResponse,
  type MarkRoomMemberInvitesSeenRequest,
  type RoomMemberInvitesSummaryResponse,
  type PaginatedIncomingRoomMemberInvitesResponse,
  type PaginatedActivityEventsResponse,
  type RoomMemberInviteActionResponse,
  type MeResponse,
  type MessageResponse,
  type MyInsightsResponse,
  type ProfileCatalogReviewsResponse,
  type ProfileCatalogReviewsQuery,
  type ProfileBooksReadResponse,
  type ProfileRoomsResponse,
  type ProfileFollowListQuery,
  type ProfileFollowListResponse,
  type ProfileRatingsResponse,
  type ProfileResponse,
  type PrivacyExportResponse,
  type PrivacyRequest,
  type PrivacyRequestsResponse,
  type ReadingCategoryPreferencesResponse,
  type ReplaceReadingCategoryPreferencesRequest,
  type CancelPrivacyRequestResponse,
  type ReplaceExternalLinksRequest,
  type ReplaceExternalLinksResponse,
  type UpdateMeRequest,
  updateMeRequestSchema,
  replaceExternalLinksRequestSchema,
  replaceExternalLinksResponseSchema,
} from '@towelbooks/schemas';

import {
  createUsersMeAvatarResource,
  type UsersMeAvatarResource,
} from './users-me-avatar.js';
import {
  createUsersMeBannerResource,
  type UsersMeBannerResource,
} from './users-me-banner.js';
import {
  createUsersMeCatalogEditionCoversResource,
  type UsersMeCatalogEditionCoversResource,
} from './users-me-catalog-edition-covers.js';

import type { Transport } from '../transport.js';

export type {
  UsersMeAvatarResource,
  UsersMeBannerResource,
  UsersMeCatalogEditionCoversResource,
};

export type UsersMeRoomJoinRequestsResource = {
  summary(): Promise<RoomJoinRequestsSummaryResponse>;
  markSeen(
    body: MarkRoomJoinRequestsSeenRequest,
  ): Promise<RoomJoinRequestsSummaryResponse>;
};

export type UsersMeMemberInvitesResource = {
  list(query?: {
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedIncomingRoomMemberInvitesResponse>;
  summary(): Promise<RoomMemberInvitesSummaryResponse>;
  markSeen(
    body: MarkRoomMemberInvitesSeenRequest,
  ): Promise<RoomMemberInvitesSummaryResponse>;
  accept(inviteId: string): Promise<RoomMemberInviteActionResponse>;
  refuse(inviteId: string): Promise<RoomMemberInviteActionResponse>;
};

export type UsersMeResource = {
  get(): Promise<MeResponse>;
  acceptLegalDocuments(
    body: AcceptRequiredLegalAcceptancesRequest,
  ): Promise<MeResponse>;
  changePassword(body: ChangePasswordRequest): Promise<ChangePasswordResponse>;
  update(body: UpdateMeRequest): Promise<MeResponse>;
  getReadingCategoryPreferences(): Promise<ReadingCategoryPreferencesResponse>;
  replaceReadingCategoryPreferences(
    body: ReplaceReadingCategoryPreferencesRequest,
  ): Promise<ReadingCategoryPreferencesResponse>;
  delete(body: DeleteAccountRequest): Promise<DeleteAccountResponse>;
  getContinueReading(): Promise<ContinueReadingResponse>;
  getHome(): Promise<HomeResponse>;
  getInsights(): Promise<MyInsightsResponse>;
  exportPrivacyData(): Promise<PrivacyExportResponse>;
  createPrivacyRequest(
    body: CreatePrivacyRequestRequest,
  ): Promise<PrivacyRequest>;
  listPrivacyRequests(): Promise<PrivacyRequestsResponse>;
  getPrivacyRequestDetail(requestId: string): Promise<PrivacyRequest>;
  cancelPrivacyRequest(
    requestId: string,
  ): Promise<CancelPrivacyRequestResponse>;
  listFollowRequests(
    query?: IncomingFollowRequestsQuery,
  ): Promise<IncomingFollowRequestsResponse>;
  getFollowRequestsSummary(): Promise<IncomingFollowRequestsSummaryResponse>;
  markFollowRequestsSeen(
    body: MarkIncomingFollowRequestsSeenRequest,
  ): Promise<IncomingFollowRequestsSummaryResponse>;
  acceptFollowRequest(requestId: string): Promise<MessageResponse>;
  declineFollowRequest(requestId: string): Promise<MessageResponse>;
  removeFollower(followerUserId: string): Promise<MessageResponse>;
  roomJoinRequests: UsersMeRoomJoinRequestsResource;
  memberInvites: UsersMeMemberInvitesResource;
  confirmDeletion(
    body: ConfirmAccountDeletionRequest,
  ): Promise<ConfirmAccountDeletionResponse>;
  cancelDeletion(
    body: CancelAccountDeletionRequest,
  ): Promise<CancelAccountDeletionResponse>;
  replaceLinks(
    body: ReplaceExternalLinksRequest,
  ): Promise<ReplaceExternalLinksResponse>;
  avatar: UsersMeAvatarResource;
  banner: UsersMeBannerResource;
  catalogEditionCovers: UsersMeCatalogEditionCoversResource;
};

export type UsersResource = {
  followProfile(username: string): Promise<MessageResponse>;
  getProfile(username: string): Promise<ProfileResponse>;
  listFollowers(
    username: string,
    query?: ProfileFollowListQuery,
  ): Promise<ProfileFollowListResponse>;
  listFollowing(
    username: string,
    query?: ProfileFollowListQuery,
  ): Promise<ProfileFollowListResponse>;
  listProfileActivities(
    username: string,
    query?: ListProfileActivityEventsQuery,
  ): Promise<PaginatedActivityEventsResponse>;
  listProfileCatalogReviews(
    username: string,
    query?: ProfileCatalogReviewsQuery,
  ): Promise<ProfileCatalogReviewsResponse>;
  listProfileBooksRead(username: string): Promise<ProfileBooksReadResponse>;
  listProfileRooms(username: string): Promise<ProfileRoomsResponse>;
  listProfileRatings(username: string): Promise<ProfileRatingsResponse>;
  unfollowProfile(username: string): Promise<MessageResponse>;
  me: UsersMeResource;
};

export function createUsersResource(transport: Transport): UsersResource {
  return {
    followProfile(username) {
      return transport.request({
        method: 'POST',
        path: `/profiles/${encodeURIComponent(username)}/follow`,
        schema: messageResponseSchema,
      });
    },
    getProfile(username) {
      return transport.request({
        method: 'GET',
        path: `/profiles/${encodeURIComponent(username)}`,
        schema: profileResponseSchema,
      });
    },
    listFollowers(username, query = {}) {
      return transport.request({
        method: 'GET',
        path: `/profiles/${encodeURIComponent(username)}/followers`,
        query: {
          ...(query.cursor ? { cursor: query.cursor } : {}),
          ...(query.limit ? { limit: query.limit } : {}),
        },
        schema: profileFollowListResponseSchema,
      });
    },
    listFollowing(username, query = {}) {
      return transport.request({
        method: 'GET',
        path: `/profiles/${encodeURIComponent(username)}/following`,
        query: {
          ...(query.cursor ? { cursor: query.cursor } : {}),
          ...(query.limit ? { limit: query.limit } : {}),
        },
        schema: profileFollowListResponseSchema,
      });
    },
    listProfileActivities(username, query = {}) {
      return transport.request({
        method: 'GET',
        path: `/profiles/${encodeURIComponent(username)}/activities`,
        query: {
          ...(query.cursor ? { cursor: query.cursor } : {}),
          ...(query.limit ? { limit: query.limit } : {}),
        },
        schema: paginatedActivityEventsResponseSchema,
      });
    },
    listProfileBooksRead(username) {
      return transport.request({
        method: 'GET',
        path: `/profiles/${encodeURIComponent(username)}/books-read`,
        schema: profileBooksReadResponseSchema,
      });
    },
    listProfileRooms(username) {
      return transport.request({
        method: 'GET',
        path: `/profiles/${encodeURIComponent(username)}/rooms`,
        schema: profileRoomsResponseSchema,
      });
    },
    listProfileCatalogReviews(username, query = {}) {
      const parsedQuery = profileCatalogReviewsQuerySchema.parse(query);

      return transport.request({
        method: 'GET',
        path: `/profiles/${encodeURIComponent(username)}/catalog-reviews`,
        query: {
          ...(parsedQuery.cursor !== undefined
            ? { cursor: parsedQuery.cursor }
            : {}),
          ...(parsedQuery.limit !== undefined
            ? { limit: parsedQuery.limit }
            : {}),
        },
        schema: profileCatalogReviewsResponseSchema,
      });
    },
    listProfileRatings(username) {
      return transport.request({
        method: 'GET',
        path: `/profiles/${encodeURIComponent(username)}/ratings`,
        schema: profileRatingsResponseSchema,
      });
    },
    unfollowProfile(username) {
      return transport.request({
        method: 'DELETE',
        path: `/profiles/${encodeURIComponent(username)}/follow`,
        schema: messageResponseSchema,
      });
    },
    me: {
      avatar: createUsersMeAvatarResource(transport),
      banner: createUsersMeBannerResource(transport),
      catalogEditionCovers:
        createUsersMeCatalogEditionCoversResource(transport),
      get() {
        return transport.request({
          method: 'GET',
          path: '/me',
          schema: meResponseSchema,
        });
      },
      acceptLegalDocuments(body) {
        return transport.request({
          method: 'POST',
          path: '/me/legal-acceptances',
          body: acceptRequiredLegalAcceptancesRequestSchema.parse(body),
          schema: meResponseSchema,
        });
      },
      changePassword(body) {
        return transport.request({
          method: 'PATCH',
          path: '/me/password',
          body: changePasswordRequestSchema.parse(body),
          schema: changePasswordResponseSchema,
        });
      },
      update(body) {
        return transport.request({
          method: 'PATCH',
          path: '/me',
          body: updateMeRequestSchema.parse(body),
          schema: meResponseSchema,
        });
      },
      getReadingCategoryPreferences() {
        return transport.request({
          method: 'GET',
          path: '/me/reading-category-preferences',
          schema: readingCategoryPreferencesResponseSchema,
        });
      },
      replaceReadingCategoryPreferences(body) {
        return transport.request({
          method: 'PUT',
          path: '/me/reading-category-preferences',
          body: replaceReadingCategoryPreferencesRequestSchema.parse(body),
          schema: readingCategoryPreferencesResponseSchema,
        });
      },
      replaceLinks(body) {
        return transport.request({
          method: 'PUT',
          path: '/me/links',
          body: replaceExternalLinksRequestSchema.parse(body),
          schema: replaceExternalLinksResponseSchema,
        });
      },
      delete(body) {
        return transport.request({
          method: 'DELETE',
          path: '/me',
          body,
          schema: deleteAccountResponseSchema,
        });
      },
      getContinueReading() {
        return transport.request({
          method: 'GET',
          path: '/me/continue-reading',
          schema: continueReadingResponseSchema,
        });
      },
      getHome() {
        return transport.request({
          method: 'GET',
          path: '/me/home',
          schema: homeResponseSchema,
        });
      },
      getInsights() {
        return transport.request({
          method: 'GET',
          path: '/me/insights',
          schema: myInsightsResponseSchema,
        });
      },
      exportPrivacyData() {
        return transport.request({
          method: 'GET',
          path: '/me/privacy/export',
          schema: privacyExportResponseSchema,
        });
      },
      createPrivacyRequest(body) {
        return transport.request({
          method: 'POST',
          path: '/me/privacy/requests',
          body: createPrivacyRequestRequestSchema.parse(body),
          schema: privacyRequestSchema,
        });
      },
      listPrivacyRequests() {
        return transport.request({
          method: 'GET',
          path: '/me/privacy/requests',
          schema: privacyRequestsResponseSchema,
        });
      },
      getPrivacyRequestDetail(requestId) {
        return transport.request({
          method: 'GET',
          path: `/me/privacy/requests/${encodeURIComponent(requestId)}`,
          schema: privacyRequestSchema,
        });
      },
      cancelPrivacyRequest(requestId) {
        return transport.request({
          method: 'POST',
          path: `/me/privacy/requests/${encodeURIComponent(requestId)}/cancel`,
          schema: cancelPrivacyRequestResponseSchema,
        });
      },
      listFollowRequests(query = {}) {
        return transport.request({
          method: 'GET',
          path: '/me/follow-requests',
          query: {
            ...(query.cursor ? { cursor: query.cursor } : {}),
            ...(query.limit ? { limit: query.limit } : {}),
          },
          schema: incomingFollowRequestsResponseSchema,
        });
      },
      getFollowRequestsSummary() {
        return transport.request({
          method: 'GET',
          path: '/me/follow-requests/summary',
          schema: incomingFollowRequestsSummaryResponseSchema,
        });
      },
      markFollowRequestsSeen(body) {
        return transport.request({
          method: 'POST',
          path: '/me/follow-requests/seen',
          body: markIncomingFollowRequestsSeenRequestSchema.parse(body),
          schema: incomingFollowRequestsSummaryResponseSchema,
        });
      },
      acceptFollowRequest(requestId) {
        return transport.request({
          method: 'POST',
          path: `/me/follow-requests/${encodeURIComponent(requestId)}/accept`,
          schema: messageResponseSchema,
        });
      },
      declineFollowRequest(requestId) {
        return transport.request({
          method: 'POST',
          path: `/me/follow-requests/${encodeURIComponent(requestId)}/decline`,
          schema: messageResponseSchema,
        });
      },
      removeFollower(followerUserId) {
        return transport.request({
          method: 'DELETE',
          path: `/me/followers/${encodeURIComponent(followerUserId)}`,
          schema: messageResponseSchema,
        });
      },
      roomJoinRequests: {
        summary() {
          return transport.request({
            method: 'GET',
            path: '/me/room-join-requests/summary',
            schema: roomJoinRequestsSummaryResponseSchema,
          });
        },
        markSeen(body) {
          return transport.request({
            method: 'POST',
            path: '/me/room-join-requests/seen',
            body: markRoomJoinRequestsSeenRequestSchema.parse(body),
            schema: roomJoinRequestsSummaryResponseSchema,
          });
        },
      },
      memberInvites: {
        list(query = {}) {
          return transport.request({
            method: 'GET',
            path: '/me/member-invites',
            query,
            schema: paginatedIncomingRoomMemberInvitesResponseSchema,
          });
        },
        summary() {
          return transport.request({
            method: 'GET',
            path: '/me/member-invites/summary',
            schema: roomMemberInvitesSummaryResponseSchema,
          });
        },
        markSeen(body) {
          return transport.request({
            method: 'POST',
            path: '/me/member-invites/seen',
            body: markRoomMemberInvitesSeenRequestSchema.parse(body),
            schema: roomMemberInvitesSummaryResponseSchema,
          });
        },
        accept(inviteId) {
          return transport.request({
            method: 'POST',
            path: `/me/member-invites/${encodeURIComponent(inviteId)}/accept`,
            schema: roomMemberInviteActionResponseSchema,
          });
        },
        refuse(inviteId) {
          return transport.request({
            method: 'POST',
            path: `/me/member-invites/${encodeURIComponent(inviteId)}/refuse`,
            schema: roomMemberInviteActionResponseSchema,
          });
        },
      },
      confirmDeletion(body) {
        return transport.request({
          method: 'POST',
          path: '/me/account-deletion/confirm',
          body,
          schema: confirmAccountDeletionResponseSchema,
        });
      },
      cancelDeletion(body) {
        return transport.request({
          method: 'POST',
          path: '/me/account-deletion/cancel',
          body,
          schema: cancelAccountDeletionResponseSchema,
        });
      },
    },
  };
}
