import { z } from 'zod';

import { utcDateTimeStringSchema } from '../common/utc-datetime.js';
import { offsetPaginatedResponseSchema } from '../common/pagination.js';

export const LIBRARY_ITEM_READING_NOTE_CONTENT_MAX_LENGTH = 10_000;
export const LIBRARY_ITEM_READING_NOTE_PAGE_MAX = 50_000;
export const LIBRARY_ITEM_READING_NOTES_DEFAULT_PAGE_SIZE = 20;
export const LIBRARY_ITEM_READING_NOTES_MAX_PAGE_SIZE = 50;
export const LIBRARY_ITEM_READING_NOTES_MAX_COUNT = 100;
export const LIBRARY_ITEM_READING_NOTES_MAX_PAGE = 200;

const nullablePageSchema = z
  .number()
  .int()
  .min(1)
  .max(LIBRARY_ITEM_READING_NOTE_PAGE_MAX)
  .nullable();

const readingNoteFieldsSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1)
    .max(LIBRARY_ITEM_READING_NOTE_CONTENT_MAX_LENGTH),
  pageStart: nullablePageSchema.optional(),
  pageEnd: nullablePageSchema.optional(),
});

function validateReadingNotePageContext(
  value: {
    pageStart?: number | null;
    pageEnd?: number | null;
  },
  context: z.RefinementCtx,
): void {
  if (value.pageEnd !== null && value.pageEnd !== undefined) {
    if (value.pageStart === null || value.pageStart === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'pageEnd requires pageStart.',
        path: ['pageEnd'],
      });
      return;
    }

    if (value.pageEnd < value.pageStart) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'pageEnd must be greater than or equal to pageStart.',
        path: ['pageEnd'],
      });
    }
  }
}

export const libraryItemReadingNoteSchema = z.object({
  id: z.string().uuid(),
  readingSessionId: z.string().uuid(),
  content: z.string().min(1).max(LIBRARY_ITEM_READING_NOTE_CONTENT_MAX_LENGTH),
  pageStart: nullablePageSchema,
  pageEnd: nullablePageSchema,
  createdAt: utcDateTimeStringSchema,
  updatedAt: utcDateTimeStringSchema,
});

export type LibraryItemReadingNote = z.infer<
  typeof libraryItemReadingNoteSchema
>;

export const createLibraryItemReadingNoteRequestSchema = readingNoteFieldsSchema
  .strict()
  .superRefine(validateReadingNotePageContext);

export type CreateLibraryItemReadingNoteRequest = z.infer<
  typeof createLibraryItemReadingNoteRequestSchema
>;

export const updateLibraryItemReadingNoteRequestSchema = readingNoteFieldsSchema
  .partial()
  .strict();

export type UpdateLibraryItemReadingNoteRequest = z.infer<
  typeof updateLibraryItemReadingNoteRequestSchema
>;

export const libraryItemReadingNotesQuerySchema = z.object({
  page: z
    .number()
    .int()
    .positive()
    .max(LIBRARY_ITEM_READING_NOTES_MAX_PAGE)
    .optional(),
  pageSize: z
    .number()
    .int()
    .positive()
    .max(LIBRARY_ITEM_READING_NOTES_MAX_PAGE_SIZE)
    .optional(),
});

export type LibraryItemReadingNotesQuery = z.infer<
  typeof libraryItemReadingNotesQuerySchema
>;

export const paginatedLibraryItemReadingNotesResponseSchema =
  offsetPaginatedResponseSchema(libraryItemReadingNoteSchema);

export type PaginatedLibraryItemReadingNotesResponse = z.infer<
  typeof paginatedLibraryItemReadingNotesResponseSchema
>;
