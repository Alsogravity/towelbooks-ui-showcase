import { z } from 'zod';

export const libraryTypeSchema = z.enum(['personal', 'room']);
export type LibraryType = z.infer<typeof libraryTypeSchema>;

export const libraryVisibilitySchema = z.enum(['private', 'shared', 'public']);
export type LibraryVisibility = z.infer<typeof libraryVisibilitySchema>;

export const libraryItemReadingStatusSchema = z.enum([
  'not_started',
  'reading',
  'paused',
  'read',
  'abandoned',
]);
export type LibraryItemReadingStatus = z.infer<
  typeof libraryItemReadingStatusSchema
>;

export const libraryItemOwnershipFormatSchema = z.enum([
  'physical',
  'ebook',
  'audiobook',
]);
export type LibraryItemOwnershipFormat = z.infer<
  typeof libraryItemOwnershipFormatSchema
>;

export const libraryItemAcquisitionSourceSchema = z.enum([
  'purchased',
  'gift',
  'borrowed',
  'other',
]);
export type LibraryItemAcquisitionSource = z.infer<
  typeof libraryItemAcquisitionSourceSchema
>;

export const libraryItemPhysicalConditionSchema = z.enum([
  'new',
  'good',
  'worn',
  'damaged',
  'unknown',
]);
export type LibraryItemPhysicalCondition = z.infer<
  typeof libraryItemPhysicalConditionSchema
>;

export const libraryItemDigitalPlatformSchema = z.enum([
  'kindle',
  'kobo',
  'apple_books',
  'google_play_books',
  'pdf',
  'epub',
  'other',
  'unknown',
]);
export type LibraryItemDigitalPlatform = z.infer<
  typeof libraryItemDigitalPlatformSchema
>;

export const wishlistPrioritySchema = z.enum(['low', 'medium', 'high']);
export type WishlistPriority = z.infer<typeof wishlistPrioritySchema>;
