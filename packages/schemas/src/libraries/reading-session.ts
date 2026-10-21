import { z } from 'zod';

import {
  dateOnlyStringSchema,
  parseDateOnlyString,
} from '../common/date-only.js';
import { utcDateTimeStringSchema } from '../common/utc-datetime.js';
import { libraryItemReadingStatusSchema } from '../enums.js';

export const LIBRARY_ITEM_READING_SESSION_PAGE_MAX = 50_000;
export const LIBRARY_ITEM_READING_SESSION_TITLE_MAX_LENGTH = 80;

const nullableCurrentPageSchema = z
  .number()
  .int()
  .min(0)
  .max(LIBRARY_ITEM_READING_SESSION_PAGE_MAX)
  .nullable();

const nullableTotalPagesSchema = z
  .number()
  .int()
  .min(1)
  .max(LIBRARY_ITEM_READING_SESSION_PAGE_MAX)
  .nullable();

const readingSessionFieldsSchema = z.object({
  catalogEditionId: z.string().uuid().nullable().optional(),
  libraryItemOwnershipId: z.string().uuid().nullable().optional(),
  title: z
    .string()
    .trim()
    .max(LIBRARY_ITEM_READING_SESSION_TITLE_MAX_LENGTH)
    .transform((value) => value || null)
    .nullable()
    .optional(),
  status: libraryItemReadingStatusSchema.optional(),
  currentPage: nullableCurrentPageSchema.optional(),
  totalPages: nullableTotalPagesSchema.optional(),
  startedAt: dateOnlyStringSchema.nullable().optional(),
  finishedAt: dateOnlyStringSchema.nullable().optional(),
});

function validateReadingSessionFieldOrder(
  value: {
    currentPage?: number | null;
    totalPages?: number | null;
    startedAt?: string | null;
    finishedAt?: string | null;
  },
  context: z.RefinementCtx,
): void {
  if (
    value.currentPage !== null &&
    value.currentPage !== undefined &&
    value.totalPages !== null &&
    value.totalPages !== undefined &&
    value.currentPage > value.totalPages
  ) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'currentPage must not exceed totalPages.',
      path: ['currentPage'],
    });
  }

  if (!value.startedAt || !value.finishedAt) {
    return;
  }

  const startedAt = parseDateOnlyString(value.startedAt);
  const finishedAt = parseDateOnlyString(value.finishedAt);

  if (startedAt && finishedAt && startedAt.getTime() > finishedAt.getTime()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'startedAt must not be after finishedAt.',
      path: ['startedAt'],
    });
  }
}

export const libraryItemReadingSessionSchema = z.object({
  id: z.string().uuid(),
  libraryItemId: z.string().uuid(),
  catalogEditionId: z.string().uuid().nullable(),
  libraryItemOwnershipId: z.string().uuid().nullable(),
  title: z
    .string()
    .max(LIBRARY_ITEM_READING_SESSION_TITLE_MAX_LENGTH)
    .nullable(),
  status: libraryItemReadingStatusSchema,
  currentPage: nullableCurrentPageSchema,
  totalPages: nullableTotalPagesSchema,
  startedAt: dateOnlyStringSchema.nullable(),
  finishedAt: dateOnlyStringSchema.nullable(),
  version: z.number().int().nonnegative(),
  createdAt: utcDateTimeStringSchema,
  updatedAt: utcDateTimeStringSchema,
});

export type LibraryItemReadingSession = z.infer<
  typeof libraryItemReadingSessionSchema
>;

export const createLibraryItemReadingSessionRequestSchema =
  readingSessionFieldsSchema
    .strict()
    .superRefine(validateReadingSessionFieldOrder);

export type CreateLibraryItemReadingSessionRequest = z.infer<
  typeof createLibraryItemReadingSessionRequestSchema
>;

export const updateLibraryItemReadingSessionRequestSchema =
  readingSessionFieldsSchema
    .extend({ version: z.number().int().nonnegative() })
    .strict()
    .superRefine(validateReadingSessionFieldOrder);

export type UpdateLibraryItemReadingSessionRequest = z.infer<
  typeof updateLibraryItemReadingSessionRequestSchema
>;

export const deleteLibraryItemReadingSessionQuerySchema = z
  .object({ version: z.number().int().nonnegative() })
  .strict();

export type DeleteLibraryItemReadingSessionQuery = z.infer<
  typeof deleteLibraryItemReadingSessionQuerySchema
>;
