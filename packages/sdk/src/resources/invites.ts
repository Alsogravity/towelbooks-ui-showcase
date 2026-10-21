import {
  acceptInviteResponseSchema,
  paginatedRoomInvitesResponseSchema,
  revealRoomInviteLinkResponseSchema,
  refuseInviteEmailResponseSchema,
  roomInviteDetailsResponseSchema,
  roomInviteSchema,
  revokeRoomInviteResponseSchema,
  type AcceptInviteRequest,
  type AcceptInviteResponse,
  type CreateRoomInviteRequest,
  type PaginatedRoomInvitesResponse,
  type RevealRoomInviteLinkResponse,
  type RefuseInviteEmailRequest,
  type RefuseInviteEmailResponse,
  type RoomInvite,
  type RoomInviteDetailsResponse,
  type RevokeRoomInviteResponse,
} from '@towelbooks/schemas';

import type { Transport } from '../transport.js';

export type InvitesResource = {
  listForRoom(
    roomId: string,
    query?: { page?: number; pageSize?: number },
  ): Promise<PaginatedRoomInvitesResponse>;
  getDetails(
    roomId: string,
    inviteId: string,
  ): Promise<RoomInviteDetailsResponse>;
  revealLink(
    roomId: string,
    inviteId: string,
  ): Promise<RevealRoomInviteLinkResponse>;
  create(roomId: string, body: CreateRoomInviteRequest): Promise<RoomInvite>;
  revoke(roomId: string, inviteId: string): Promise<RevokeRoomInviteResponse>;
  accept(body: AcceptInviteRequest): Promise<AcceptInviteResponse>;
  refuseEmail(
    body: RefuseInviteEmailRequest,
  ): Promise<RefuseInviteEmailResponse>;
};

export function createInvitesResource(transport: Transport): InvitesResource {
  return {
    listForRoom(roomId, query = {}) {
      return transport.request({
        method: 'GET',
        path: '/rooms/:roomId/invites',
        pathParams: { roomId },
        query,
        schema: paginatedRoomInvitesResponseSchema,
      });
    },
    create(roomId, body) {
      return transport.request({
        method: 'POST',
        path: '/rooms/:roomId/invites',
        pathParams: { roomId },
        body,
        schema: roomInviteSchema,
      });
    },
    getDetails(roomId, inviteId) {
      return transport.request({
        method: 'GET',
        path: '/rooms/:roomId/invites/:inviteId/details',
        pathParams: { roomId, inviteId },
        schema: roomInviteDetailsResponseSchema,
      });
    },
    revealLink(roomId, inviteId) {
      return transport.request({
        method: 'POST',
        path: '/rooms/:roomId/invites/:inviteId/link',
        pathParams: { roomId, inviteId },
        schema: revealRoomInviteLinkResponseSchema,
      });
    },
    revoke(roomId, inviteId) {
      return transport.request({
        method: 'DELETE',
        path: '/rooms/:roomId/invites/:inviteId/revoke',
        pathParams: { roomId, inviteId },
        schema: revokeRoomInviteResponseSchema,
      });
    },
    accept(body) {
      return transport.request({
        method: 'POST',
        path: '/invites/accept',
        body,
        schema: acceptInviteResponseSchema,
      });
    },
    refuseEmail(body) {
      return transport.request({
        method: 'POST',
        path: '/invites/email-refusals',
        body,
        schema: refuseInviteEmailResponseSchema,
      });
    },
  };
}
