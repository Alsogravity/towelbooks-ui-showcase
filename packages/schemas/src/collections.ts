import { z } from 'zod';

import { profileIdentitySummarySchema } from './auth/profile.js';
import { wishlistPrioritySchema } from './enums.js';
import { catalogWorkProjectionSchema } from './catalog/work-projection.js';
import { utcDateTimeStringSchema } from './common/utc-datetime.js';
import { COLLECTION_DESCRIPTION_MAX_LENGTH } from './common/limits.js';
import { libraryCatalogEditionSchema } from './libraries/library-item.js';

export const COLLECTION_NAME_MAX_LENGTH = 120;
export const COLLECTION_ITEM_NOTE_MAX_LENGTH = 2_000;

export const COLLECTION_SYSTEM_KEYS = ['wishlist', 'favorites'] as const;
export const COLLECTION_ICON_KEYS = [
  'reading',
  'books',
  'saved',
  'love',
] as const;
export const COLLECTION_ACCENT_KEYS = ['neutral', 'amber', 'rose'] as const;

export const collectionSystemKeySchema = z.enum(COLLECTION_SYSTEM_KEYS);
export type CollectionSystemKey = z.infer<typeof collectionSystemKeySchema>;

export const collectionIconKeySchema = z.enum(COLLECTION_ICON_KEYS);
export type CollectionIconKey = z.infer<typeof collectionIconKeySchema>;

export const collectionAccentKeySchema = z.enum(COLLECTION_ACCENT_KEYS);
export type CollectionAccentKey = z.infer<typeof collectionAccentKeySchema>;

export const collectionSystemPresentationDefaults = {
  favorites: { accentKey: 'rose', iconKey: 'love' },
  wishlist: { accentKey: 'amber', iconKey: 'saved' },
} as const satisfies Record<
  CollectionSystemKey,
  { accentKey: CollectionAccentKey; iconKey: CollectionIconKey }
>;

export const collectionCustomNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(COLLECTION_NAME_MAX_LENGTH);

export const collectionCustomDescriptionSchema = z
  .string()
  .max(COLLECTION_DESCRIPTION_MAX_LENGTH)
  .nullable();

export const collectionCustomPresentationDefaults = {
  accentKey: 'neutral',
  iconKey: 'books',
} as const satisfies {
  accentKey: CollectionAccentKey;
  iconKey: CollectionIconKey;
};

export const collectionItemNoteSchema = z
  .string()
  .max(COLLECTION_ITEM_NOTE_MAX_LENGTH)
  .nullable();

export const collectionItemLookupQuerySchema = z
  .object({
    catalogEditionId: z.string().uuid().optional(),
    catalogWorkId: z.string().uuid(),
  })
  .strict();

export type CollectionItemLookupQuery = z.infer<
  typeof collectionItemLookupQuerySchema
>;

export const createCollectionItemRequestSchema = z
  .object({
    catalogEditionId: z.string().uuid().nullable().optional(),
    catalogWorkId: z.string().uuid(),
    note: collectionItemNoteSchema.optional(),
    priority: wishlistPrioritySchema.optional(),
  })
  .strict();

export type CreateCollectionItemRequest = z.infer<
  typeof createCollectionItemRequestSchema
>;

export const updateCollectionItemRequestSchema = z
  .object({
    catalogEditionId: z.string().uuid().nullable().optional(),
    note: collectionItemNoteSchema.optional(),
    priority: wishlistPrioritySchema.optional(),
  })
  .strict();

export type UpdateCollectionItemRequest = z.infer<
  typeof updateCollectionItemRequestSchema
>;

export const collectionPresentationSchema = z
  .object({
    accentKey: collectionAccentKeySchema.nullable(),
    iconKey: collectionIconKeySchema.nullable(),
  })
  .strict();

export const createCollectionRequestSchema = z
  .object({
    accentKey: collectionAccentKeySchema.nullable().optional(),
    description: collectionCustomDescriptionSchema.optional(),
    iconKey: collectionIconKeySchema.nullable().optional(),
    name: collectionCustomNameSchema,
  })
  .strict();

export type CreateCollectionRequest = z.infer<
  typeof createCollectionRequestSchema
>;

export const updateCollectionRequestSchema = z
  .object({
    accentKey: collectionAccentKeySchema.nullable().optional(),
    description: collectionCustomDescriptionSchema.optional(),
    iconKey: collectionIconKeySchema.nullable().optional(),
    name: collectionCustomNameSchema.optional(),
  })
  .strict();

export type UpdateCollectionRequest = z.infer<
  typeof updateCollectionRequestSchema
>;

export const collectionSchema = z
  .object({
    accentKey: collectionAccentKeySchema,
    archivedAt: utcDateTimeStringSchema.nullable(),
    coverUrl: z.string().nullable(),
    createdAt: utcDateTimeStringSchema,
    description: collectionCustomDescriptionSchema,
    iconKey: collectionIconKeySchema,
    id: z.string().min(1),
    itemCount: z.number().int().nonnegative(),
    name: z.string().nullable(),
    ownerUserId: z.string().min(1),
    systemKey: collectionSystemKeySchema.nullable(),
    updatedAt: utcDateTimeStringSchema,
  })
  .strict();

export type Collection = z.infer<typeof collectionSchema>;

/** Reader-safe collection summary. Owner linkage and archive state stay private. */
export const publicCollectionSchema = z
  .object({
    accentKey: collectionAccentKeySchema,
    coverUrl: z.string().nullable(),
    createdAt: utcDateTimeStringSchema,
    description: collectionCustomDescriptionSchema,
    iconKey: collectionIconKeySchema,
    id: z.string().min(1),
    itemCount: z.number().int().nonnegative(),
    name: z.string().nullable(),
    systemKey: collectionSystemKeySchema.nullable(),
    updatedAt: utcDateTimeStringSchema,
  })
  .strict();

export type PublicCollection = z.infer<typeof publicCollectionSchema>;

export const publicCollectionDetailSchema = publicCollectionSchema
  .extend({
    owner: profileIdentitySummarySchema,
  })
  .strict();

export type PublicCollectionDetail = z.infer<
  typeof publicCollectionDetailSchema
>;

export const collectionItemSchema = z
  .object({
    catalogEdition: libraryCatalogEditionSchema.nullable(),
    catalogEditionId: z.string().min(1).nullable(),
    catalogWorkId: z.string().min(1),
    collectionId: z.string().min(1),
    createdAt: utcDateTimeStringSchema,
    id: z.string().min(1),
    note: collectionItemNoteSchema,
    priority: wishlistPrioritySchema.nullable(),
    removedAt: utcDateTimeStringSchema.nullable(),
    updatedAt: utcDateTimeStringSchema,
    work: catalogWorkProjectionSchema,
  })
  .strict();

export type CollectionItem = z.infer<typeof collectionItemSchema>;

/** Active reader projection; notes, priority, and removal history are owner-only. */
export const publicCollectionItemSchema = z
  .object({
    catalogEdition: libraryCatalogEditionSchema.nullable(),
    catalogEditionId: z.string().min(1).nullable(),
    catalogWorkId: z.string().min(1),
    collectionId: z.string().min(1),
    createdAt: utcDateTimeStringSchema,
    id: z.string().min(1),
    updatedAt: utcDateTimeStringSchema,
    work: catalogWorkProjectionSchema,
  })
  .strict();

export type PublicCollectionItem = z.infer<typeof publicCollectionItemSchema>;

export const collectionItemLookupResponseSchema = z
  .object({
    item: collectionItemSchema.nullable(),
  })
  .strict();

export type CollectionItemLookupResponse = z.infer<
  typeof collectionItemLookupResponseSchema
>;

export const paginatedCollectionItemsResponseSchema = z
  .object({
    items: z.array(collectionItemSchema),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  })
  .strict();

export type PaginatedCollectionItemsResponse = z.infer<
  typeof paginatedCollectionItemsResponseSchema
>;

export const paginatedProfileCollectionsResponseSchema = z
  .object({
    items: z.array(publicCollectionSchema),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  })
  .strict();

export type PaginatedProfileCollectionsResponse = z.infer<
  typeof paginatedProfileCollectionsResponseSchema
>;

export const paginatedPublicCollectionItemsResponseSchema = z
  .object({
    items: z.array(publicCollectionItemSchema),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  })
  .strict();

export type PaginatedPublicCollectionItemsResponse = z.infer<
  typeof paginatedPublicCollectionItemsResponseSchema
>;

export const paginatedCollectionsResponseSchema = z
  .object({
    items: z.array(collectionSchema),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  })
  .strict();

export type PaginatedCollectionsResponse = z.infer<
  typeof paginatedCollectionsResponseSchema
>;
