import { utcDateTimeStringSchema } from '../common/utc-datetime.js';
import { z } from 'zod';

import { usernameSchema } from '../auth/identity.js';
import { libraryTypeSchema } from '../enums.js';
import {
  ROOM_DESCRIPTION_MAX_LENGTH,
  ROOM_NAME_MAX_LENGTH,
} from '../limits.js';

const personalLibraryVisibilitySchema = z.enum(['private', 'shared']);

export const librarySchema = z.object({
  id: z.string().min(1),
  ownerUserId: z.string().min(1).nullable(),
  roomId: z.string().min(1).nullable(),
  type: libraryTypeSchema,
  name: z.string(),
  description: z.string().nullable(),
  coverUrl: z.string().nullable(),
  visibility: personalLibraryVisibilitySchema,
  isDefault: z.boolean(),
  createdAt: utcDateTimeStringSchema,
  updatedAt: utcDateTimeStringSchema,
  archivedAt: utcDateTimeStringSchema.nullable(),
});

export type Library = z.infer<typeof librarySchema>;

export const libraryOwnerIdentitySchema = z.object({
  id: z.string().min(1),
  username: usernameSchema,
});

export type LibraryOwnerIdentity = z.infer<typeof libraryOwnerIdentitySchema>;

export const libraryDetailSchema = librarySchema.extend({
  owner: libraryOwnerIdentitySchema,
});

export type LibraryDetail = z.infer<typeof libraryDetailSchema>;

export const paginatedLibrariesResponseSchema = z.object({
  items: z.array(librarySchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

export type PaginatedLibrariesResponse = z.infer<
  typeof paginatedLibrariesResponseSchema
>;

export const createLibraryRequestSchema = z
  .object({
    name: z.string().max(ROOM_NAME_MAX_LENGTH).optional().default(''),
    description: z
      .string()
      .max(ROOM_DESCRIPTION_MAX_LENGTH)
      .nullable()
      .optional(),
  })
  .strict();

export type CreateLibraryRequest = z.infer<typeof createLibraryRequestSchema>;

export const updateLibraryRequestSchema = z
  .object({
    name: z.string().max(ROOM_NAME_MAX_LENGTH).optional(),
    description: z
      .string()
      .max(ROOM_DESCRIPTION_MAX_LENGTH)
      .nullable()
      .optional(),
  })
  .strict();

export type UpdateLibraryRequest = z.infer<typeof updateLibraryRequestSchema>;
