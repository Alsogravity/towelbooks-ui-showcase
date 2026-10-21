import {
  communitySettingsSchema,
  type CommunitySettings,
  type UpdateCommunitySettingsRequest,
} from '@towelbooks/schemas';

import type { Transport } from '../transport.js';

export type CommunityResource = {
  getSettings(roomId: string): Promise<CommunitySettings>;
  updateSettings(
    roomId: string,
    body: UpdateCommunitySettingsRequest,
  ): Promise<CommunitySettings>;
};

export function createCommunityResource(
  transport: Transport,
): CommunityResource {
  return {
    getSettings(roomId) {
      return transport.request({
        method: 'GET',
        path: '/rooms/:roomId/community/settings',
        pathParams: { roomId },
        schema: communitySettingsSchema,
      });
    },
    updateSettings(roomId, body) {
      return transport.request({
        method: 'PATCH',
        path: '/rooms/:roomId/community/settings',
        pathParams: { roomId },
        body,
        schema: communitySettingsSchema,
      });
    },
  };
}
