import {
  adminCatalogEditTargetSchema,
  type AdminCatalogEditTarget,
  type UpdateAdminCatalogEditRequest,
} from '@towelbooks/schemas';

import type { Transport } from '../transport.js';

export type AdminCatalogEditResource = {
  getEditTarget(identifier: string): Promise<AdminCatalogEditTarget>;
  updateEditTarget(
    identifier: string,
    body: UpdateAdminCatalogEditRequest,
  ): Promise<AdminCatalogEditTarget>;
};

export function createAdminCatalogEditResource(
  transport: Transport,
): AdminCatalogEditResource {
  return {
    getEditTarget(identifier) {
      return transport.request({
        method: 'GET',
        path: '/admin/catalog/edit-targets/:identifier',
        pathParams: { identifier },
        schema: adminCatalogEditTargetSchema,
      });
    },
    updateEditTarget(identifier, body) {
      return transport.request({
        method: 'PATCH',
        path: '/admin/catalog/edit-targets/:identifier',
        pathParams: { identifier },
        body,
        schema: adminCatalogEditTargetSchema,
      });
    },
  };
}
