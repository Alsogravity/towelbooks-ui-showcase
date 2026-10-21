import {
  catalogEditionDeletionResponseSchema,
  type CatalogEditionDeletionResponse,
} from '@towelbooks/schemas';

import type { Transport } from '../transport.js';

export type AdminCatalogEditionDeletionResource = {
  deleteEdition(
    catalogEditionId: string,
  ): Promise<CatalogEditionDeletionResponse>;
};

export function createAdminCatalogEditionDeletionResource(
  transport: Transport,
): AdminCatalogEditionDeletionResource {
  return {
    deleteEdition(catalogEditionId) {
      return transport.request({
        method: 'DELETE',
        path: '/admin/catalog/editions/:catalogEditionId',
        pathParams: { catalogEditionId },
        schema: catalogEditionDeletionResponseSchema,
      });
    },
  };
}
