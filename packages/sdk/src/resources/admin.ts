import {
  adminMeResponseSchema,
  type AdminMeResponse,
} from '@towelbooks/schemas';

import type { Transport } from '../transport.js';

export type AdminResource = {
  getMe(): Promise<AdminMeResponse>;
};

export function createAdminResource(transport: Transport): AdminResource {
  return {
    getMe() {
      return transport.request({
        method: 'GET',
        path: '/admin/me',
        schema: adminMeResponseSchema,
      });
    },
  };
}
