import { z } from 'zod';

import { avatarSchema } from '../avatars.js';
import { appLocaleSchema } from '../common/app-locale.js';

export const adminAuthUserSchema = z.object({
  avatar: avatarSchema,
  bannerPresetId: z.string().nullable(),
  bio: z.string().nullable(),
  defaultLibraryId: z.string().uuid().nullable(),
  displayName: z.string().nullable(),
  email: z.string(),
  id: z.string().uuid(),
  locale: appLocaleSchema.nullable(),
  username: z.string(),
});

export type AdminAuthUser = z.infer<typeof adminAuthUserSchema>;

export const authSessionResponseSchema = z.object({
  accessToken: z.string(),
  expiresInSeconds: z.number().int(),
  user: adminAuthUserSchema,
});

export type AuthSessionResponse = z.infer<typeof authSessionResponseSchema>;
