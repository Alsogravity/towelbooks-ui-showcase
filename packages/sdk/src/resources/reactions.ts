import {
  createReactionRequestSchema,
  reactionSummaryResponseSchema,
  reactionTargetQuerySchema,
  type CreateReactionRequest,
  type ReactionSummaryResponse,
  type ReactionTargetQuery,
} from '@towelbooks/schemas';

import type { Transport } from '../transport.js';

export type ReactionsResource = {
  create(body: CreateReactionRequest): Promise<ReactionSummaryResponse>;
  delete(query: ReactionTargetQuery): Promise<ReactionSummaryResponse>;
  summary(query: ReactionTargetQuery): Promise<ReactionSummaryResponse>;
};

export function createReactionsResource(
  transport: Transport,
): ReactionsResource {
  return {
    create(body) {
      createReactionRequestSchema.parse(body);

      return transport.request({
        body,
        method: 'POST',
        path: '/reactions',
        schema: reactionSummaryResponseSchema,
      });
    },
    delete(query) {
      reactionTargetQuerySchema.parse(query);

      return transport.request({
        method: 'DELETE',
        path: '/reactions',
        query,
        schema: reactionSummaryResponseSchema,
      });
    },
    summary(query) {
      reactionTargetQuerySchema.parse(query);

      return transport.request({
        method: 'GET',
        path: '/reactions/summary',
        query,
        schema: reactionSummaryResponseSchema,
      });
    },
  };
}
