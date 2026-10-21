import {
  inAppMessageReceiptSchema,
  pendingInAppMessagesResponseSchema,
  type InAppMessageClientCapability,
  type InAppMessageReceipt,
  type PendingInAppMessagesResponse,
  type RecordInAppMessageReceiptRequest,
} from '@towelbooks/schemas';

import type { Transport } from '../transport.js';

export type ListPendingInAppMessagesOptions = Readonly<{
  /** Type+surface pairs this client build can render. */
  supports: readonly InAppMessageClientCapability[];
}>;

export type InAppMessagesResource = {
  listPending(
    options: ListPendingInAppMessagesOptions,
  ): Promise<PendingInAppMessagesResponse>;
  recordReceipt(
    body: RecordInAppMessageReceiptRequest,
  ): Promise<InAppMessageReceipt>;
};

export function createInAppMessagesResource(
  transport: Transport,
): InAppMessagesResource {
  return {
    listPending(options) {
      return transport.request({
        method: 'GET',
        path: '/me/in-app-messages',
        query: {
          supports: [...options.supports],
        },
        schema: pendingInAppMessagesResponseSchema,
      });
    },
    recordReceipt(body) {
      return transport.request({
        method: 'POST',
        path: '/me/in-app-message-receipts',
        body,
        schema: inAppMessageReceiptSchema,
      });
    },
  };
}
