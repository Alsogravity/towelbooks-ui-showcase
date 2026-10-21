import { utcDateTimeStringSchema } from './common/utc-datetime.js';
import { z } from 'zod';

import { createCursorPaginatedResponseSchema } from './common/pagination.js';
import { avatarSchema } from './profile/avatars.js';

/**
 * Delivery channels a notification can be fanned out to. `in_app` is always
 * available (it is the persisted Notification row itself); `email` rides on the
 * shared transactional SES infrastructure; `sms` is a reserved future channel
 * with no provider, phone collection, or UI wired up yet.
 */
export const notificationChannelSchema = z.enum(['in_app', 'email', 'sms']);
export type NotificationChannel = z.infer<typeof notificationChannelSchema>;

/**
 * Lifecycle of a single per-channel delivery attempt. In-app deliveries are
 * `sent` on creation; email deliveries start `pending` and are advanced by the
 * delivery processor.
 */
export const notificationDeliveryStatusSchema = z.enum([
  'pending',
  'sent',
  'skipped',
  'suppressed',
  'failed',
]);
export type NotificationDeliveryStatus = z.infer<
  typeof notificationDeliveryStatusSchema
>;

/**
 * Supported notification types. Kept as a strict union so the policy, recipient
 * resolver, and frontend grouping all share one source of truth. Read/unread
 * state lives on nullable timestamps, not in this enum.
 */
export const notificationTypeSchema = z.enum([
  'room.meeting_updated',
  'room.meeting_cancelled',
  'room.poll_closed',
  'room.announcement_created',
  'comment.on_my_activity',
  'comment.on_my_discussion',
  'comment.reply_to_my_comment',
  'comment.liked',
]);
export type NotificationType = z.infer<typeof notificationTypeSchema>;

/** UI grouping for the preferences screen and notification center. */
export const notificationCategorySchema = z.enum([
  'meetings',
  'polls',
  'announcements',
  'comments',
  'security',
]);
export type NotificationCategory = z.infer<typeof notificationCategorySchema>;

/** Stable type -> category map shared by the API policy and the web UI. */
export const NOTIFICATION_TYPE_CATEGORY = {
  'room.meeting_updated': 'meetings',
  'room.meeting_cancelled': 'meetings',
  'room.poll_closed': 'polls',
  'room.announcement_created': 'announcements',
  'comment.on_my_activity': 'comments',
  'comment.on_my_discussion': 'comments',
  'comment.reply_to_my_comment': 'comments',
  'comment.liked': 'comments',
} as const satisfies Record<NotificationType, NotificationCategory>;

export const notificationActorSchema = z.object({
  id: z.string().min(1),
  username: z.string().min(1),
  displayName: z.string().nullable(),
  avatar: avatarSchema,
  isDeleted: z.boolean(),
});
export type NotificationActor = z.infer<typeof notificationActorSchema>;

export const notificationRoomContextSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
});
export type NotificationRoomContext = z.infer<
  typeof notificationRoomContextSchema
>;

export const notificationContextSchema = z.object({
  room: notificationRoomContextSchema.nullable(),
});
export type NotificationContext = z.infer<typeof notificationContextSchema>;

export const notificationSchema = z.object({
  id: z.string().min(1),
  type: notificationTypeSchema,
  category: notificationCategorySchema,
  actor: notificationActorSchema.nullable(),
  context: notificationContextSchema,
  title: z.string().min(1),
  body: z.string().nullable(),
  href: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()),
  seenAt: utcDateTimeStringSchema.nullable(),
  readAt: utcDateTimeStringSchema.nullable(),
  archivedAt: utcDateTimeStringSchema.nullable(),
  createdAt: utcDateTimeStringSchema,
});
export type Notification = z.infer<typeof notificationSchema>;

export const paginatedNotificationsResponseSchema =
  createCursorPaginatedResponseSchema(notificationSchema).extend({
    unreadCount: z.number().int().nonnegative(),
  });
export type PaginatedNotificationsResponse = z.infer<
  typeof paginatedNotificationsResponseSchema
>;

export const unreadNotificationsCountResponseSchema = z.object({
  count: z.number().int().nonnegative(),
});
export type UnreadNotificationsCountResponse = z.infer<
  typeof unreadNotificationsCountResponseSchema
>;

/**
 * Per-channel preference state for a notification type. `supported` reflects
 * whether the channel is wired up for the type at all (e.g. email is only
 * offered for transactional-safe types; sms is never supported yet). `editable`
 * is false for safety-critical channels that must not be disabled.
 */
export const notificationChannelPreferenceSchema = z.object({
  enabled: z.boolean(),
  supported: z.boolean(),
  editable: z.boolean(),
});
export type NotificationChannelPreference = z.infer<
  typeof notificationChannelPreferenceSchema
>;

export const notificationPreferenceSchema = z.object({
  type: notificationTypeSchema,
  category: notificationCategorySchema,
  inApp: notificationChannelPreferenceSchema,
  email: notificationChannelPreferenceSchema,
  sms: notificationChannelPreferenceSchema,
});
export type NotificationPreference = z.infer<
  typeof notificationPreferenceSchema
>;

export const notificationPreferencesResponseSchema = z.object({
  items: z.array(notificationPreferenceSchema),
});
export type NotificationPreferencesResponse = z.infer<
  typeof notificationPreferencesResponseSchema
>;

export const listNotificationsQuerySchema = z
  .object({
    cursor: z.string().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(50).optional(),
  })
  .strict();
export type ListNotificationsQuery = z.infer<
  typeof listNotificationsQuerySchema
>;

export const updateNotificationPreferenceRequestSchema = z
  .object({
    inAppEnabled: z.boolean().optional(),
    emailEnabled: z.boolean().optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.inAppEnabled !== undefined || value.emailEnabled !== undefined,
    { message: 'At least one channel preference must be provided.' },
  );
export type UpdateNotificationPreferenceRequest = z.infer<
  typeof updateNotificationPreferenceRequestSchema
>;
