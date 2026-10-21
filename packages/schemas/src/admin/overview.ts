import { z } from 'zod';

export const adminAttentionItemSchema = z.object({
  kind: z.string(),
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  href: z.string(),
  occurredAt: z.string(),
});

export type AdminAttentionItem = z.infer<typeof adminAttentionItemSchema>;

export const adminOverviewCountersSchema = z.object({
  activeUsers: z.number().int(),
  suspendedUsers: z.number().int(),
  pendingVerificationUsers: z.number().int(),
  rooms: z.number().int(),
  archivedRooms: z.number().int(),
  openPrivacyRequests: z.number().int(),
  mediaAssetsNeedingReview: z.number().int(),
});

export const adminOverviewResponseSchema = z.object({
  counters: adminOverviewCountersSchema,
  needsAttention: z.array(adminAttentionItemSchema),
});

export type AdminOverviewResponse = z.infer<typeof adminOverviewResponseSchema>;
