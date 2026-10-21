import { z } from 'zod';

import { avatarSchema } from '../avatars.js';
import { bannerPresetIdSchema } from '../banner-presets.js';
import { appLocaleSchema } from '../common/app-locale.js';
import { externalLinkSchema } from '../common/external-links.js';
import {
  BIO_MAX_LENGTH,
  isReservedUsername,
  normalizeUsername,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
} from '../limits.js';
import { bannerImageSchema } from '../profile/media-assets.js';

export const supportedLocaleModeSchema = z.enum(['auto', 'manual']);

export const usernameSchema = z
  .string()
  .transform(normalizeUsername)
  .pipe(
    z
      .string()
      .min(USERNAME_MIN_LENGTH)
      .max(USERNAME_MAX_LENGTH)
      .regex(/^[a-z0-9_-]+$/)
      .refine((value) => !isReservedUsername(value), {
        message: 'Username is reserved.',
      }),
  );

export type SupportedLocaleMode = z.infer<typeof supportedLocaleModeSchema>;

export const authMethodsSchema = z.object({
  password: z.boolean(),
  google: z.boolean(),
});
export type AuthMethods = z.infer<typeof authMethodsSchema>;

export const userSummarySchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().nullable(),
  username: usernameSchema,
  bio: z.string().max(BIO_MAX_LENGTH).nullable(),
  locale: appLocaleSchema.nullable(),
  localeMode: supportedLocaleModeSchema,
  lastResolvedLocale: appLocaleSchema.nullable(),
  bannerPresetId: bannerPresetIdSchema.nullable(),
  bannerImage: bannerImageSchema.nullable(),
  defaultLibraryId: z.string().min(1).nullable(),
  avatar: avatarSchema,
  links: z.array(externalLinkSchema).default([]),
  authMethods: authMethodsSchema,
});

export type UserSummary = z.infer<typeof userSummarySchema>;

export const authUserSchema = userSummarySchema;
export type AuthUser = z.infer<typeof authUserSchema>;

export const messageResponseSchema = z.object({
  message: z.string(),
});
export type MessageResponse = z.infer<typeof messageResponseSchema>;
