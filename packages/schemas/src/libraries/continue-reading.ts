import { utcDateTimeStringSchema } from '../common/utc-datetime.js';
import { z } from 'zod';

import { catalogWorkTypeSchema } from '../enums/catalog-work.js';
import { coverGeometrySchema } from '../catalog/cover-geometry.js';

export const continueCatalogWorkKindSchema = catalogWorkTypeSchema;

export const continueReadingProgressSchema = z.object({
  currentPage: z.number().int().nonnegative().nullable(),
  pageCount: z.number().int().positive().nullable(),
  percent: z.number().int().min(0).max(100).nullable(),
});

export const continueReadingLibrarySourceSchema = z.object({
  type: z.literal('library'),
  libraryId: z.string().min(1),
  libraryItemId: z.string().min(1),
});

export const continueReadingSourceSchema = continueReadingLibrarySourceSchema;

export const continueCatalogWorkSchema = z.object({
  catalogWorkId: z.string().min(1),
  kind: continueCatalogWorkKindSchema,
  title: z.string().min(1),
  author: z.string().nullable(),
  coverUrl: z.string().nullable(),
  coverThumbnailUrl: z.string().nullable(),
  coverGeometry: coverGeometrySchema.nullable().optional(),
  progress: continueReadingProgressSchema.nullable(),
  source: continueReadingSourceSchema,
  lastActivityAt: utcDateTimeStringSchema,
});

export const continueReadingResponseSchema = z.object({
  items: z.array(continueCatalogWorkSchema),
});

export type ContinueReadingProgress = z.infer<
  typeof continueReadingProgressSchema
>;
export type ContinueReadingLibrarySource = z.infer<
  typeof continueReadingLibrarySourceSchema
>;
export type ContinueReadingSource = z.infer<typeof continueReadingSourceSchema>;
export type ContinueCatalogWork = z.infer<typeof continueCatalogWorkSchema>;
export type ContinueReadingResponse = z.infer<
  typeof continueReadingResponseSchema
>;
