import {
  updatePrivacyPreferencesRequestSchema,
  privacyPreferencesSchema,
  type PrivacyPreferences,
  type UpdatePrivacyPreferencesRequest,
} from '@towelbooks/schemas';

import type { Transport } from '../transport.js';

export type PrivacyResource = {
  getPreferences(): Promise<PrivacyPreferences>;
  updatePreferences(
    body: UpdatePrivacyPreferencesRequest,
  ): Promise<PrivacyPreferences>;
};

export function createPrivacyResource(transport: Transport): PrivacyResource {
  return {
    getPreferences() {
      return transport.request({
        method: 'GET',
        path: '/me/privacy-preferences',
        schema: privacyPreferencesSchema,
      });
    },
    updatePreferences(body) {
      return transport.request({
        method: 'PATCH',
        path: '/me/privacy-preferences',
        body: updatePrivacyPreferencesRequestSchema.parse(body),
        schema: privacyPreferencesSchema,
      });
    },
  };
}
