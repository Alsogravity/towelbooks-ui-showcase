import { utcDateTimeStringSchema } from '../common/utc-datetime.js';
import { z } from 'zod';

import { messageResponseSchema } from '../auth.js';
import { avatarSchema } from '../avatars.js';
import { INVITED_EMAIL_MAX_LENGTH } from '../limits.js';

export const ROOM_INVITE_ALLOWED_EMAILS_MAX = 25;
export const ROOM_ACTIVE_INVITES_MAX = 20;
export const ROOM_ACTIVE_INVITES_PER_CREATOR_MAX = 10;
export const ROOM_INVITE_ACCESS_DURATION_HOURS_MAX = 24 * 30;
export const ROOM_INVITE_TOKEN_BYTE_LENGTH = 32;
export const ROOM_INVITE_TOKEN_LENGTH = Math.ceil(
  (ROOM_INVITE_TOKEN_BYTE_LENGTH * 8) / 6,
);

export const ROOM_INVITE_EMAIL_DELIVERY_STATUSES = [
  'queued',
  'sent',
  'failed',
  'suppressed',
  'rate_limited',
] as const;
export const roomInviteEmailDeliveryStatusSchema = z.enum(
  ROOM_INVITE_EMAIL_DELIVERY_STATUSES,
);
export type RoomInviteEmailDeliveryStatus = z.infer<
  typeof roomInviteEmailDeliveryStatusSchema
>;

/**
 * Canonical lifecycle status of a room invite.
 *
 * - `active`: not revoked, not expired, and not fully used — the link is usable.
 * - `used`: fully redeemed (`useCount >= maxUses`).
 * - `expired`: past its `expiresAt`.
 * - `revoked`: explicitly revoked by a room owner/admin.
 *
 * Precedence when several conditions apply: `revoked` > `used` > `expired` > `active`.
 */
export const ROOM_INVITE_STATUSES = [
  'active',
  'used',
  'expired',
  'revoked',
] as const;
export const roomInviteStatusSchema = z.enum(ROOM_INVITE_STATUSES);
export type RoomInviteStatus = z.infer<typeof roomInviteStatusSchema>;

/**
 * Derives the canonical {@link RoomInviteStatus} from an invite's raw fields.
 *
 * This is the single source of truth shared by the API serializer and the web
 * UI so that a given invite always resolves to the same lifecycle status.
 */
export function computeRoomInviteStatus(input: {
  isRevoked: boolean;
  useCount: number;
  maxUses: number;
  expiresAt: Date | string | number;
  now?: Date | string | number;
}): RoomInviteStatus {
  if (input.isRevoked) return 'revoked';
  if (input.useCount >= input.maxUses) return 'used';

  const expiresAtMs = new Date(input.expiresAt).getTime();
  const nowMs =
    input.now === undefined ? Date.now() : new Date(input.now).getTime();
  if (expiresAtMs <= nowMs) return 'expired';

  return 'active';
}

export const roomInviteEmailDeliverySummarySchema = z.object({
  requested: z.number().int().nonnegative(),
  queued: z.number().int().nonnegative(),
  sent: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  suppressed: z.number().int().nonnegative(),
  rateLimited: z.number().int().nonnegative(),
});
export type RoomInviteEmailDeliverySummary = z.infer<
  typeof roomInviteEmailDeliverySummarySchema
>;

export const roomInviteSchema = z.object({
  id: z.string().min(1),
  roomId: z.string().min(1),
  rawToken: z.string().length(ROOM_INVITE_TOKEN_LENGTH).optional(),
  restriction: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('none'),
      allowedCount: z.literal(0),
      acceptedCount: z.literal(0),
    }),
    z.object({
      type: z.literal('allowed_emails'),
      allowedCount: z.number().int().positive(),
      acceptedCount: z.number().int().nonnegative(),
      maskedEmails: z.array(
        z.object({
          mask: z.string().min(1),
          acceptedAt: utcDateTimeStringSchema.nullable(),
        }),
      ),
    }),
  ]),
  expiresAt: utcDateTimeStringSchema,
  maxUses: z.number().int().positive(),
  useCount: z.number().int().nonnegative(),
  isRevoked: z.boolean(),
  status: roomInviteStatusSchema,
  createdByUserId: z.string().min(1),
  createdAt: utcDateTimeStringSchema,
  emailDeliverySummary: roomInviteEmailDeliverySummarySchema.optional(),
});
export type RoomInvite = z.infer<typeof roomInviteSchema>;

export const paginatedRoomInvitesResponseSchema = z.object({
  items: z.array(roomInviteSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});
export type PaginatedRoomInvitesResponse = z.infer<
  typeof paginatedRoomInvitesResponseSchema
>;

const roomInviteDetailsUserSchema = z.object({
  id: z.string().min(1),
  username: z.string().nullable(),
  displayName: z.string().nullable(),
  avatar: avatarSchema,
});
export type RoomInviteDetailsUser = z.infer<typeof roomInviteDetailsUserSchema>;

export const roomInviteDetailsResponseSchema = z.object({
  invite: roomInviteSchema,
  redemptions: z.array(
    z.object({
      user: roomInviteDetailsUserSchema,
      redeemedAt: utcDateTimeStringSchema,
    }),
  ),
  allowedEmails: z.array(
    z.object({
      id: z.string().min(1),
      mask: z.string().min(1),
      status: z.enum(['pending', 'accepted']),
      acceptedAt: utcDateTimeStringSchema.nullable(),
      acceptedBy: roomInviteDetailsUserSchema.nullable(),
      emailDelivery: z
        .object({
          status: roomInviteEmailDeliveryStatusSchema.or(
            z.literal('not_requested'),
          ),
          sentAt: utcDateTimeStringSchema.nullable(),
          failedAt: utcDateTimeStringSchema.nullable(),
          suppressedAt: utcDateTimeStringSchema.nullable(),
          rateLimitedAt: utcDateTimeStringSchema.nullable(),
        })
        .optional(),
    }),
  ),
});
export type RoomInviteDetailsResponse = z.infer<
  typeof roomInviteDetailsResponseSchema
>;

export const revealRoomInviteLinkResponseSchema = z.object({
  inviteUrl: z.url(),
});
export type RevealRoomInviteLinkResponse = z.infer<
  typeof revealRoomInviteLinkResponseSchema
>;

const allowedEmailSchema = z
  .string()
  .trim()
  .email()
  .max(INVITED_EMAIL_MAX_LENGTH)
  .transform((email) => email.toLowerCase());

export const createRoomInviteRequestSchema = z.object({
  accessDurationHours: z
    .number()
    .int()
    .min(1)
    .max(ROOM_INVITE_ACCESS_DURATION_HOURS_MAX)
    .nullable()
    .optional(),
  allowedEmails: z
    .array(allowedEmailSchema)
    .transform((emails) => [...new Set(emails)])
    .pipe(
      z.array(allowedEmailSchema).min(1).max(ROOM_INVITE_ALLOWED_EMAILS_MAX),
    )
    .optional(),
  maxUses: z.number().int().min(1).max(50).optional(),
  expiresInHours: z
    .number()
    .int()
    .min(1)
    .max(24 * 30)
    .optional(),
  sendEmailInvites: z.boolean().optional(),
});
export type CreateRoomInviteRequest = z.infer<
  typeof createRoomInviteRequestSchema
>;

export const revokeRoomInviteResponseSchema = messageResponseSchema;
export type RevokeRoomInviteResponse = z.infer<
  typeof revokeRoomInviteResponseSchema
>;

export const acceptInviteRequestSchema = z.object({
  token: z.string().length(ROOM_INVITE_TOKEN_LENGTH),
});
export type AcceptInviteRequest = z.infer<typeof acceptInviteRequestSchema>;

export const ROOM_INVITE_ACCEPT_OUTCOMES = [
  'joined',
  'reactivated',
  'access_renewed',
  'already_has_access',
] as const;
export const roomInviteAcceptOutcomeSchema = z.enum(
  ROOM_INVITE_ACCEPT_OUTCOMES,
);
export type RoomInviteAcceptOutcome = z.infer<
  typeof roomInviteAcceptOutcomeSchema
>;

export const acceptInviteResponseSchema = messageResponseSchema.extend({
  roomId: z.string().min(1),
  outcome: roomInviteAcceptOutcomeSchema,
});
export type AcceptInviteResponse = z.infer<typeof acceptInviteResponseSchema>;

export const refuseInviteEmailRequestSchema = z.object({
  token: z.string().length(ROOM_INVITE_TOKEN_LENGTH),
});
export type RefuseInviteEmailRequest = z.infer<
  typeof refuseInviteEmailRequestSchema
>;

export const refuseInviteEmailResponseSchema = messageResponseSchema;
export type RefuseInviteEmailResponse = z.infer<
  typeof refuseInviteEmailResponseSchema
>;
