import { utcDateTimeStringSchema } from './common/utc-datetime.js';
import { z } from 'zod';

/**
 * Generic in-app messages platform.
 *
 * A single `InAppMessage` row models any one-time or recurring in-app surface
 * (orientation, announcement, feature update, …) and a per-user
 * `UserInAppMessageReceipt` records whether the user has seen, dismissed, or
 * completed it. Receipts are keyed by the message `key` (not its id) so
 * versioned messages such as `welcome_onboarding_v1` and
 * `welcome_onboarding_v2` stay explicit and independent.
 *
 * Stored payloads are validated by message type; the client never renders
 * arbitrary markup from a stored payload — orientation intro steps map to an
 * allow-listed illustration key and bounded text.
 */

/** Kinds of message. The payload shape is validated per type. */
export const inAppMessageTypeSchema = z.enum([
  'orientation',
  'announcement',
  'feature_update',
]);
export type InAppMessageType = z.infer<typeof inAppMessageTypeSchema>;

/** Where a message is rendered. At most one `fullscreen` message is delivered at a time. */
export const inAppMessageSurfaceSchema = z.enum([
  'fullscreen',
  'modal',
  'banner',
]);
export type InAppMessageSurface = z.infer<typeof inAppMessageSurfaceSchema>;

/**
 * Capabilities are the explicit type+surface pairs a concrete client build knows
 * how to render. Clients send these to the delivery endpoint so the server can
 * avoid returning messages that would be invisible on that client, while each
 * client still keeps a local renderability guard as defense in depth.
 */
export const IN_APP_MESSAGE_CLIENT_CAPABILITY_VALUES = [
  'orientation:fullscreen',
  'orientation:modal',
  'orientation:banner',
  'announcement:fullscreen',
  'announcement:modal',
  'announcement:banner',
  'feature_update:fullscreen',
  'feature_update:modal',
  'feature_update:banner',
] as const;

export const inAppMessageClientCapabilitySchema = z.enum(
  IN_APP_MESSAGE_CLIENT_CAPABILITY_VALUES,
);
export type InAppMessageClientCapability = z.infer<
  typeof inAppMessageClientCapabilitySchema
>;

export function getInAppMessageCapability(input: {
  surface: InAppMessageSurface;
  type: InAppMessageType;
}): InAppMessageClientCapability {
  return `${input.type}:${input.surface}` as InAppMessageClientCapability;
}

/**
 * Splits a capability back into its `type` and `surface`. The inverse of
 * {@link getInAppMessageCapability}; the input is already constrained to a valid
 * pair by {@link inAppMessageClientCapabilitySchema}, so the single `:` between a
 * type (which never contains `:`) and a surface splits unambiguously.
 */
export function parseInAppMessageCapability(
  capability: InAppMessageClientCapability,
): { surface: InAppMessageSurface; type: InAppMessageType } {
  const [type, surface] = capability.split(':');

  return {
    surface: surface as InAppMessageSurface,
    type: type as InAppMessageType,
  };
}

/** Lifecycle of a message. Only `active` messages are ever delivered. */
export const inAppMessageStatusSchema = z.enum(['draft', 'active', 'archived']);
export type InAppMessageStatus = z.infer<typeof inAppMessageStatusSchema>;

/**
 * Receipt actions a user can take on a message. A `dismissed` or `completed`
 * receipt permanently suppresses future delivery of that message key; `seen`
 * is recorded without suppressing so a message can keep showing until acted on.
 */
export const inAppMessageReceiptActionSchema = z.enum([
  'seen',
  'dismissed',
  'completed',
]);
export type InAppMessageReceiptAction = z.infer<
  typeof inAppMessageReceiptActionSchema
>;

/**
 * Audience targeting for a message. v1 only supports `all`; the discriminated
 * shape leaves room for future targeting without a contract break.
 */
export const inAppMessageAudienceSchema = z
  .object({ kind: z.literal('all') })
  .strict();
export type InAppMessageAudience = z.infer<typeof inAppMessageAudienceSchema>;

export const DEFAULT_IN_APP_MESSAGE_AUDIENCE: InAppMessageAudience = {
  kind: 'all',
};

// --- Orientation payload ---------------------------------------------------

export const ORIENTATION_MIN_STEPS = 2;
export const ORIENTATION_MAX_STEPS = 6;
export const ORIENTATION_STEP_TITLE_MAX_LENGTH = 80;
export const ORIENTATION_STEP_BODY_MAX_LENGTH = 280;

/**
 * Allow-listed orientation illustration keys. The renderer maps each key to a
 * known icon/illustration; an unknown key is rejected so a stored payload can
 * never reference arbitrary or remote artwork.
 */
export const orientationIllustrationKeySchema = z.enum([
  'welcome',
  'discover',
  'rooms',
  'community',
  'reading',
]);
export type OrientationIllustrationKey = z.infer<
  typeof orientationIllustrationKeySchema
>;

export const orientationIntroStepSchema = z
  .object({
    type: z.literal('intro'),
    title: z.string().min(1).max(ORIENTATION_STEP_TITLE_MAX_LENGTH),
    body: z.string().min(1).max(ORIENTATION_STEP_BODY_MAX_LENGTH),
    illustration: orientationIllustrationKeySchema,
  })
  .strict();
export type OrientationIntroStep = z.infer<typeof orientationIntroStepSchema>;

export const readingCategoryPreferencesStepSchema = z
  .object({
    type: z.literal('reading_category_preferences'),
  })
  .strict();
export type ReadingCategoryPreferencesStep = z.infer<
  typeof readingCategoryPreferencesStepSchema
>;

export const orientationStepSchema = z.discriminatedUnion('type', [
  orientationIntroStepSchema,
  readingCategoryPreferencesStepSchema,
]);
export type OrientationStep = z.infer<typeof orientationStepSchema>;

export const orientationPayloadSchema = z
  .object({
    steps: z
      .array(orientationStepSchema)
      .min(ORIENTATION_MIN_STEPS)
      .max(ORIENTATION_MAX_STEPS),
  })
  .strict()
  .superRefine(({ steps }, context) => {
    const preferenceStepIndexes = steps.flatMap((step, index) =>
      step.type === 'reading_category_preferences' ? [index] : [],
    );

    if (
      preferenceStepIndexes.length !== 1 ||
      preferenceStepIndexes[0] !== steps.length - 1
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'The reading category preferences step must appear exactly once at the end.',
        path: ['steps'],
      });
    }
  });
export type OrientationPayload = z.infer<typeof orientationPayloadSchema>;

/** Generic payload for message types that do not (yet) have a typed renderer. */
export const genericInAppMessagePayloadSchema = z.record(
  z.string(),
  z.unknown(),
);
export type GenericInAppMessagePayload = z.infer<
  typeof genericInAppMessagePayloadSchema
>;

/**
 * Validate a stored payload against the schema for its message type. Used by
 * the seed/create path (fail closed) and by delivery (defensively skip a row
 * whose payload no longer matches its type).
 */
export function safeParseInAppMessagePayload(
  type: InAppMessageType,
  payload: unknown,
):
  | { success: true; data: OrientationPayload | GenericInAppMessagePayload }
  | { success: false; error: z.ZodError } {
  if (type === 'orientation') {
    return orientationPayloadSchema.safeParse(payload);
  }

  return genericInAppMessagePayloadSchema.safeParse(payload);
}

// --- Pending message delivery contract -------------------------------------

const pendingInAppMessageBase = {
  id: z.string().min(1),
  key: z.string().min(1),
  surface: inAppMessageSurfaceSchema,
  priority: z.number().int(),
};

export const pendingOrientationMessageSchema = z.object({
  ...pendingInAppMessageBase,
  type: z.literal('orientation'),
  payload: orientationPayloadSchema,
});

export const pendingAnnouncementMessageSchema = z.object({
  ...pendingInAppMessageBase,
  type: z.literal('announcement'),
  payload: genericInAppMessagePayloadSchema,
});

export const pendingFeatureUpdateMessageSchema = z.object({
  ...pendingInAppMessageBase,
  type: z.literal('feature_update'),
  payload: genericInAppMessagePayloadSchema,
});

export const pendingInAppMessageSchema = z.discriminatedUnion('type', [
  pendingOrientationMessageSchema,
  pendingAnnouncementMessageSchema,
  pendingFeatureUpdateMessageSchema,
]);
export type PendingInAppMessage = z.infer<typeof pendingInAppMessageSchema>;

export const pendingInAppMessagesResponseSchema = z.object({
  items: z.array(pendingInAppMessageSchema),
});
export type PendingInAppMessagesResponse = z.infer<
  typeof pendingInAppMessagesResponseSchema
>;

// --- Record receipt request/response ---------------------------------------

export const IN_APP_MESSAGE_KEY_MAX_LENGTH = 120;

export const recordInAppMessageReceiptRequestSchema = z.object({
  messageKey: z.string().min(1).max(IN_APP_MESSAGE_KEY_MAX_LENGTH),
  action: inAppMessageReceiptActionSchema,
});
export type RecordInAppMessageReceiptRequest = z.infer<
  typeof recordInAppMessageReceiptRequestSchema
>;

export const inAppMessageReceiptSchema = z.object({
  messageKey: z.string().min(1),
  seenAt: utcDateTimeStringSchema.nullable(),
  dismissedAt: utcDateTimeStringSchema.nullable(),
  completedAt: utcDateTimeStringSchema.nullable(),
});
export type InAppMessageReceipt = z.infer<typeof inAppMessageReceiptSchema>;
