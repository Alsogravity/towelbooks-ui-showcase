import { utcDateTimeStringSchema } from '../common/utc-datetime.js';
import { z } from 'zod';

import { catalogWorkProjectionSchema } from '../catalog/work-projection.js';
import { catalogPurchaseLinkSchema } from '../catalog/search.js';
import { libraryCatalogEditionSchema } from '../libraries.js';
import { READING_DESCRIPTION_MAX_LENGTH } from '../limits.js';

export const createReadingRequestSchema = z
  .object({
    catalogEditionId: z.string().uuid().nullable().optional(),
    description: z.string().max(READING_DESCRIPTION_MAX_LENGTH).optional(),
    endsAt: utcDateTimeStringSchema.nullable().optional(),
    catalogWorkId: z.string().uuid(),
    startsAt: utcDateTimeStringSchema.nullable().optional(),
  })
  .strict();

export const updateReadingRequestSchema = z
  .object({
    catalogEditionId: z.string().uuid().nullable().optional(),
    description: z
      .string()
      .max(READING_DESCRIPTION_MAX_LENGTH)
      .nullable()
      .optional(),
    endsAt: utcDateTimeStringSchema.nullable().optional(),
    startsAt: utcDateTimeStringSchema.nullable().optional(),
  })
  .strict();

export const readingStatusSchema = z.enum(['active', 'finished']);
export type ReadingStatus = z.infer<typeof readingStatusSchema>;

export const readingSchema = z
  .object({
    catalogEdition: libraryCatalogEditionSchema.nullable().optional(),
    purchaseLink: catalogPurchaseLinkSchema.nullable().optional(),
    id: z.string().min(1),
    roomId: z.string().min(1),
    description: z.string().nullable(),
    status: readingStatusSchema,
    createdByUserId: z.string().min(1),
    createdAt: utcDateTimeStringSchema,
    startsAt: utcDateTimeStringSchema.nullable().optional(),
    endsAt: utcDateTimeStringSchema.nullable().optional(),
    updatedAt: utcDateTimeStringSchema,
    catalogWorkId: z.string().min(1),
    work: catalogWorkProjectionSchema,
  })
  .strict();

export const paginatedReadingsResponseSchema = z.object({
  items: z.array(readingSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

export type CreateReadingRequest = z.infer<typeof createReadingRequestSchema>;
export type UpdateReadingRequest = z.infer<typeof updateReadingRequestSchema>;
export type ReadingWork = z.infer<typeof catalogWorkProjectionSchema>;
export type Reading = z.infer<typeof readingSchema>;
export type PaginatedReadingsResponse = z.infer<
  typeof paginatedReadingsResponseSchema
>;
