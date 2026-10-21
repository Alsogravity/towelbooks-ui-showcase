import { utcDateTimeStringSchema } from '../../common/utc-datetime.js';
import { z } from 'zod';

export const privacyExportInviteSchema = z
  .object({
    id: z.string().min(1),
    roomId: z.string().min(1),
    roomSlug: z.string().min(1),
    roomName: z.string().min(1),
    hasAllowedEmailRestriction: z.boolean(),
    expiresAt: utcDateTimeStringSchema,
    maxUses: z.number().int().nonnegative(),
    useCount: z.number().int().nonnegative(),
    isRevoked: z.boolean(),
    createdAt: utcDateTimeStringSchema,
  })
  .strict();
export type PrivacyExportInvite = z.infer<typeof privacyExportInviteSchema>;

export const privacyExportInviteRedemptionSchema = z
  .object({
    id: z.string().min(1),
    inviteId: z.string().min(1),
    roomId: z.string().min(1),
    roomSlug: z.string().min(1),
    roomName: z.string().min(1),
    redeemedAt: utcDateTimeStringSchema,
  })
  .strict();
export type PrivacyExportInviteRedemption = z.infer<
  typeof privacyExportInviteRedemptionSchema
>;
