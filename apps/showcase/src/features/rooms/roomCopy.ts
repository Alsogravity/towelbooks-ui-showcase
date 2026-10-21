import {
  ROOM_DESCRIPTION_MAX_LENGTH,
  ROOM_DESCRIPTION_MAX_LINES,
  ROOM_CATEGORIES_MAX_COUNT,
  ROOM_MAX_MEMBERS_ABSOLUTE_MAX,
  ROOM_NAME_MAX_LENGTH,
  INVITED_EMAIL_MAX_LENGTH,
  ROOM_INVITE_ALLOWED_EMAILS_MAX,
  bannerPresetIdSchema,
  roomVisibilitySchema,
  roomJoinPolicySchema,
  textWithinMaxLines,
  type RoomInviteStatus,
  type RoomJoinPolicy,
  type RoomMemberRole,
  type RoomVisibility,
} from '@towelbooks/schemas';
import { z } from 'zod';

import { createFormIntegerField } from '../../lib/zod/createFormIntegerField';

import type { RoomInvite } from './types';

type Translate = (
  key: string,
  options?: { fallback?: string; values?: Record<string, number | string> },
) => string;

export type InviteStatus = RoomInviteStatus;

export function createCreateRoomSchema(t: Translate) {
  return z.object({
    name: z
      .string()
      .min(3, t('rooms.create.validation.nameMin'))
      .max(
        ROOM_NAME_MAX_LENGTH,
        t('rooms.create.validation.nameMax', {
          values: { max: ROOM_NAME_MAX_LENGTH },
        }),
      ),
    description: z
      .string()
      .max(
        ROOM_DESCRIPTION_MAX_LENGTH,
        t('rooms.create.validation.descriptionMax', {
          values: { max: ROOM_DESCRIPTION_MAX_LENGTH },
        }),
      )
      .refine(
        (value) => textWithinMaxLines(value, ROOM_DESCRIPTION_MAX_LINES),
        {
          message: t('rooms.create.validation.descriptionMaxLines', {
            values: { max: ROOM_DESCRIPTION_MAX_LINES },
          }),
        },
      )
      .optional(),
    bannerPresetId: bannerPresetIdSchema.optional(),
    visibility: roomVisibilitySchema,
    joinPolicy: roomJoinPolicySchema.optional(),
  });
}

export type CreateRoomForm = z.infer<ReturnType<typeof createCreateRoomSchema>>;
export type CreateRoomFormInput = z.input<
  ReturnType<typeof createCreateRoomSchema>
>;

export function createUpdateRoomSchema(t: Translate) {
  return z.object({
    name: z
      .string()
      .min(3, t('rooms.create.validation.nameMin'))
      .max(
        ROOM_NAME_MAX_LENGTH,
        t('rooms.create.validation.nameMax', {
          values: { max: ROOM_NAME_MAX_LENGTH },
        }),
      ),
    description: z
      .string()
      .max(
        ROOM_DESCRIPTION_MAX_LENGTH,
        t('rooms.create.validation.descriptionMax', {
          values: { max: ROOM_DESCRIPTION_MAX_LENGTH },
        }),
      )
      .refine(
        (value) => textWithinMaxLines(value, ROOM_DESCRIPTION_MAX_LINES),
        {
          message: t('rooms.create.validation.descriptionMaxLines', {
            values: { max: ROOM_DESCRIPTION_MAX_LINES },
          }),
        },
      )
      .optional()
      .or(z.literal('')),
    bannerPresetId: bannerPresetIdSchema,
    visibility: roomVisibilitySchema,
    joinPolicy: roomJoinPolicySchema.optional(),
    categoryIds: z
      .array(z.string().uuid())
      .max(
        ROOM_CATEGORIES_MAX_COUNT,
        t('rooms.settings.validation.categoriesMax', {
          values: { max: ROOM_CATEGORIES_MAX_COUNT },
        }),
      )
      .refine((ids) => new Set(ids).size === ids.length, {
        message: t('rooms.settings.validation.categoriesUnique'),
      }),
    maxMembers: z.preprocess(
      (val) => (typeof val === 'number' && Number.isNaN(val) ? undefined : val),
      z
        .number()
        .int(t('rooms.settings.validation.maxMembersInteger'))
        .positive(t('rooms.settings.validation.maxMembersPositive'))
        .max(
          ROOM_MAX_MEMBERS_ABSOLUTE_MAX,
          t('rooms.settings.validation.maxTooHigh', {
            values: { max: ROOM_MAX_MEMBERS_ABSOLUTE_MAX },
          }),
        )
        .nullable()
        .optional(),
    ),
  });
}

export type UpdateRoomForm = z.infer<ReturnType<typeof createUpdateRoomSchema>>;
export type UpdateRoomFormInput = z.input<
  ReturnType<typeof createUpdateRoomSchema>
>;

export function createInviteSchema(t: Translate) {
  return z
    .object({
      accessMode: z.enum(['open', 'restricted']),
      allowedEmailsText: z.string(),
      sendEmailInvites: z.boolean().optional(),
      maxUses: createFormIntegerField(t, {
        emptyKey: 'invites.validation.maxUsesRequired',
        integerKey: 'invites.validation.maxUsesInteger',
        min: 1,
        minKey: 'invites.validation.maxUsesMin',
        max: 50,
        maxKey: 'invites.validation.maxUsesMax',
      }),
      expiresInHours: createFormIntegerField(t, {
        emptyKey: 'invites.validation.expiresRequired',
        integerKey: 'invites.validation.expiresInteger',
        min: 1,
        minKey: 'invites.validation.expiresMin',
        max: 720,
        maxKey: 'invites.validation.expiresMax',
      }),
    })
    .superRefine((value, context) => {
      if (value.accessMode !== 'restricted') return;

      const entries = splitAllowedEmailEntries(value.allowedEmailsText);
      const invalidEntry = entries.find(
        (entry) =>
          entry.length > INVITED_EMAIL_MAX_LENGTH ||
          !z.string().email().safeParse(entry).success,
      );
      if (invalidEntry) {
        context.addIssue({
          code: 'custom',
          path: ['allowedEmailsText'],
          message: t('invites.validation.invalidEmailList'),
        });
      }

      const uniqueCount = parseAllowedEmails(value.allowedEmailsText).length;
      if (uniqueCount === 0) {
        context.addIssue({
          code: 'custom',
          path: ['allowedEmailsText'],
          message: t('invites.validation.allowedEmailsRequired'),
        });
      } else if (uniqueCount > ROOM_INVITE_ALLOWED_EMAILS_MAX) {
        context.addIssue({
          code: 'custom',
          path: ['allowedEmailsText'],
          message: t('invites.validation.allowedEmailsMax', {
            values: { max: ROOM_INVITE_ALLOWED_EMAILS_MAX },
          }),
        });
      }
    });
}

export type CreateInviteForm = z.infer<ReturnType<typeof createInviteSchema>>;

function splitAllowedEmailEntries(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function parseAllowedEmails(value: string): string[] {
  return [
    ...new Set(
      splitAllowedEmailEntries(value).map((email) => email.toLowerCase()),
    ),
  ];
}

export function getInviteStatus(invite: RoomInvite): InviteStatus {
  return invite.status;
}

export function getInviteStatusLabel(t: Translate, status: InviteStatus) {
  return t(`invites.status.${status}`);
}

export function getRoomRoleLabel(t: Translate, role: RoomMemberRole) {
  return t(`rooms.role.${role}`);
}

export function getRoomVisibilityIcon(
  visibility: RoomVisibility,
): 'globe' | 'lock' {
  return visibility === 'private' ? 'lock' : 'globe';
}

export function getRoomVisibilityLabel(
  t: Translate,
  visibility: RoomVisibility,
) {
  return t(`rooms.visibility.${visibility}`);
}

export function getRoomJoinPolicyLabel(t: Translate, policy: RoomJoinPolicy) {
  return t(`rooms.joinPolicy.${policy}`);
}
