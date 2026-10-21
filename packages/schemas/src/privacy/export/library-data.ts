import { utcDateTimeStringSchema } from '../../common/utc-datetime.js';
import { z } from 'zod';

import { dateOnlyStringSchema } from '../../common/date-only.js';
import {
  collectionAccentKeySchema,
  collectionIconKeySchema,
  collectionSystemKeySchema,
} from '../../collections.js';
import {
  libraryItemReadingStatusSchema,
  libraryItemAcquisitionSourceSchema,
  libraryItemDigitalPlatformSchema,
  libraryItemOwnershipFormatSchema,
  libraryItemPhysicalConditionSchema,
  libraryTypeSchema,
  libraryVisibilitySchema,
  catalogWorkTypeSchema,
  wishlistPrioritySchema,
} from '../../enums.js';
import { LIBRARY_ITEM_READING_SESSION_TITLE_MAX_LENGTH } from '../../libraries/reading-session.js';

export const privacyExportLibrarySchema = z
  .object({
    id: z.string().min(1),
    type: libraryTypeSchema,
    name: z.string(),
    description: z.string().nullable(),
    coverUrl: z.string().nullable(),
    visibility: libraryVisibilitySchema,
    isDefault: z.boolean(),
    createdAt: utcDateTimeStringSchema,
    updatedAt: utcDateTimeStringSchema,
    archivedAt: utcDateTimeStringSchema.nullable(),
  })
  .strict();
export type PrivacyExportLibrary = z.infer<typeof privacyExportLibrarySchema>;

export const privacyExportCatalogWorkSchema = z
  .object({
    id: z.string().min(1),
    type: catalogWorkTypeSchema,
    title: z.string().min(1),
    author: z.string().nullable(),
    sourceUrl: z.string().nullable(),
  })
  .strict();
export type PrivacyExportCatalogWork = z.infer<
  typeof privacyExportCatalogWorkSchema
>;

export const privacyExportLibraryItemOwnershipSchema = z
  .object({
    id: z.string().min(1),
    libraryItemId: z.string().min(1),
    format: libraryItemOwnershipFormatSchema,
    acquiredAt: dateOnlyStringSchema.nullable(),
    source: libraryItemAcquisitionSourceSchema.nullable(),
    condition: libraryItemPhysicalConditionSchema.nullable(),
    platform: libraryItemDigitalPlatformSchema.nullable(),
    note: z.string().nullable(),
    createdAt: utcDateTimeStringSchema,
    updatedAt: utcDateTimeStringSchema,
  })
  .strict();
export type PrivacyExportLibraryItemOwnership = z.infer<
  typeof privacyExportLibraryItemOwnershipSchema
>;

export const privacyExportLibraryItemReadingNoteSchema = z
  .object({
    id: z.string().min(1),
    readingSessionId: z.string().min(1),
    content: z.string(),
    pageStart: z.number().int().nullable(),
    pageEnd: z.number().int().nullable(),
    createdAt: utcDateTimeStringSchema,
    updatedAt: utcDateTimeStringSchema,
  })
  .strict();
export type PrivacyExportLibraryItemReadingNote = z.infer<
  typeof privacyExportLibraryItemReadingNoteSchema
>;

export const privacyExportLibraryItemReadingSessionSchema = z
  .object({
    id: z.string().min(1),
    libraryItemId: z.string().min(1),
    catalogEditionId: z.string().min(1).nullable(),
    libraryItemOwnershipId: z.string().min(1).nullable(),
    title: z
      .string()
      .max(LIBRARY_ITEM_READING_SESSION_TITLE_MAX_LENGTH)
      .nullable(),
    status: libraryItemReadingStatusSchema,
    currentPage: z.number().int().nullable(),
    totalPages: z.number().int().nullable(),
    startedAt: dateOnlyStringSchema.nullable(),
    finishedAt: dateOnlyStringSchema.nullable(),
    version: z.number().int().nonnegative(),
    createdAt: utcDateTimeStringSchema,
    updatedAt: utcDateTimeStringSchema,
    notes: z.array(privacyExportLibraryItemReadingNoteSchema),
  })
  .strict();
export type PrivacyExportLibraryItemReadingSession = z.infer<
  typeof privacyExportLibraryItemReadingSessionSchema
>;

export const privacyExportLibraryItemSchema = z
  .object({
    id: z.string().min(1),
    libraryId: z.string().min(1),
    catalogWorkId: z.string().min(1),
    personalNote: z.string().nullable(),
    createdAt: utcDateTimeStringSchema,
    updatedAt: utcDateTimeStringSchema,
    removedAt: utcDateTimeStringSchema.nullable(),
    catalogWork: privacyExportCatalogWorkSchema,
    ownerships: z.array(privacyExportLibraryItemOwnershipSchema),
    readingSessions: z.array(privacyExportLibraryItemReadingSessionSchema),
  })
  .strict();
export type PrivacyExportLibraryItem = z.infer<
  typeof privacyExportLibraryItemSchema
>;

export const privacyExportCollectionItemSchema = z
  .object({
    id: z.string().min(1),
    catalogWorkId: z.string().min(1),
    catalogEditionId: z.string().min(1).nullable(),
    collectionId: z.string().min(1),
    priority: wishlistPrioritySchema.nullable(),
    note: z.string().nullable(),
    createdAt: utcDateTimeStringSchema,
    updatedAt: utcDateTimeStringSchema,
    removedAt: utcDateTimeStringSchema.nullable(),
    catalogWork: privacyExportCatalogWorkSchema,
  })
  .strict();
export type PrivacyExportCollectionItem = z.infer<
  typeof privacyExportCollectionItemSchema
>;

export const privacyExportCollectionSchema = z
  .object({
    id: z.string().min(1),
    systemKey: collectionSystemKeySchema.nullable(),
    name: z.string().nullable(),
    description: z.string().nullable(),
    coverUrl: z.string().nullable(),
    iconKey: collectionIconKeySchema.nullable(),
    accentKey: collectionAccentKeySchema.nullable(),
    createdAt: utcDateTimeStringSchema,
    updatedAt: utcDateTimeStringSchema,
    archivedAt: utcDateTimeStringSchema.nullable(),
    items: z.array(privacyExportCollectionItemSchema),
  })
  .strict();
export type PrivacyExportCollection = z.infer<
  typeof privacyExportCollectionSchema
>;

export const privacyExportCatalogWorkRecordSchema = z
  .object({
    id: z.string().min(1),
    type: catalogWorkTypeSchema,
    title: z.string().min(1),
    author: z.string().nullable(),
    sourceUrl: z.string().nullable(),
    createdAt: utcDateTimeStringSchema,
    updatedAt: utcDateTimeStringSchema,
    archivedAt: utcDateTimeStringSchema.nullable(),
  })
  .strict();
export type PrivacyExportCatalogWorkRecord = z.infer<
  typeof privacyExportCatalogWorkRecordSchema
>;
