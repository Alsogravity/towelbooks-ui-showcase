import { z } from 'zod';

import { utcDateTimeStringSchema } from '../common/utc-datetime.js';
import { READING_ISBN_MAX_LENGTH } from '../limits.js';
import { bookCatalogImportLanguageSchema } from './import.js';

export const BOOK_CATALOG_BULK_IMPORT_MAX_ROWS = 100;
export const BOOK_CATALOG_BULK_IMPORT_FILE_NAME_MAX_LENGTH = 255;
export const BOOK_CATALOG_BULK_IMPORT_ROW_NUMBER_MAX = 1_000_000_000;

export const bookCatalogBulkImportBatchStatusSchema = z.enum([
  'previewing',
  'preview_ready',
  'preview_with_errors',
  'processing',
  'completed',
  'completed_with_errors',
  'failed',
  'expired',
]);
export type BookCatalogBulkImportBatchStatus = z.infer<
  typeof bookCatalogBulkImportBatchStatusSchema
>;

export const bookCatalogBulkImportItemOutcomeSchema = z.enum([
  'pending',
  'invalid',
  'duplicate_in_file',
  'already_in_catalog',
  'book_reused',
  'book_created',
  'book_created_with_warnings',
  'not_found',
  'failed',
]);
export type BookCatalogBulkImportItemOutcome = z.infer<
  typeof bookCatalogBulkImportItemOutcomeSchema
>;

export const bookCatalogBulkImportItemPreviewOutcomeSchema = z.enum([
  'pending',
  'invalid',
  'duplicate_in_file',
  'ready',
  'needs_selection',
  'not_found',
  'failed',
]);
export type BookCatalogBulkImportItemPreviewOutcome = z.infer<
  typeof bookCatalogBulkImportItemPreviewOutcomeSchema
>;

export const BOOK_CATALOG_BULK_IMPORT_FAILURE_CODE_VALUES = [
  'INVALID_ISBN',
  'OFFICIAL_IDENTIFIER_CONFLICT',
  'PROVIDER_UNAVAILABLE',
  'PROVIDER_FAILED',
  'PROVIDER_AMBIGUOUS',
  'PREVIEW_REQUIRES_SELECTION',
  'CONFIRMATION_EXPIRED',
  'PROCESSING_FAILED',
  'BOOK_IMPORT_PARTIAL',
] as const;
export const bookCatalogBulkImportFailureCodeSchema = z.enum(
  BOOK_CATALOG_BULK_IMPORT_FAILURE_CODE_VALUES,
);
export type BookCatalogBulkImportFailureCode = z.infer<
  typeof bookCatalogBulkImportFailureCodeSchema
>;

export const bookCatalogBulkImportRowSchema = z
  .object({
    rowNumber: z
      .number()
      .int()
      .positive()
      .max(BOOK_CATALOG_BULK_IMPORT_ROW_NUMBER_MAX),
    isbn: z.string().min(1).max(READING_ISBN_MAX_LENGTH),
  })
  .strict();

export type BookCatalogBulkImportRow = z.infer<
  typeof bookCatalogBulkImportRowSchema
>;

export const createBookCatalogBulkImportRequestSchema = z
  .object({
    fileName: z
      .string()
      .trim()
      .min(1)
      .max(BOOK_CATALOG_BULK_IMPORT_FILE_NAME_MAX_LENGTH)
      .nullish(),
    idempotencyKey: z.string().uuid().optional(),
    languages: z
      .array(bookCatalogImportLanguageSchema)
      .min(1)
      .max(2)
      .refine((value) => new Set(value).size === value.length, {
        message: 'languages must not contain duplicates.',
      }),
    primaryLanguage: bookCatalogImportLanguageSchema,
    rows: z
      .array(bookCatalogBulkImportRowSchema)
      .min(1)
      .max(BOOK_CATALOG_BULK_IMPORT_MAX_ROWS),
  })
  .strict()
  .superRefine((value, context) => {
    if (!value.languages.includes(value.primaryLanguage)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'primaryLanguage must be included in languages.',
        path: ['primaryLanguage'],
      });
    }

    const firstRowByNumber = new Map<number, number>();

    value.rows.forEach((row, index) => {
      const firstIndex = firstRowByNumber.get(row.rowNumber);
      if (firstIndex !== undefined) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Row numbers must be unique.',
          path: ['rows', index, 'rowNumber'],
        });
        return;
      }

      firstRowByNumber.set(row.rowNumber, index);
    });
  });

export type CreateBookCatalogBulkImportRequest = z.infer<
  typeof createBookCatalogBulkImportRequestSchema
>;

/**
 * Minimal provider projection retained by a batch row. The grouped book
 * import owns the complete immutable preview; the batch stores only the exact
 * preview reference, selected source identifiers, and safe operator-facing
 * fields needed for provenance and confirmation.
 */
export const bookCatalogBulkImportPreviewSnapshotSchema = z
  .object({
    previewId: z.string().uuid(),
    fingerprint: z.string().length(64),
    work: z
      .object({
        provider: z.literal('open_library'),
        identityKey: z.string().min(1).max(128),
        catalogWorkId: z.string().uuid().nullable(),
        contributors: z.array(z.string()).max(50),
      })
      .strict(),
    editions: z
      .array(
        z
          .object({
            language: bookCatalogImportLanguageSchema,
            sourceId: z.string().min(1).max(128),
            title: z.string().nullable(),
          })
          .strict(),
      )
      .max(2),
  })
  .strict();

export type BookCatalogBulkImportPreviewSnapshot = z.infer<
  typeof bookCatalogBulkImportPreviewSnapshotSchema
>;

export const retryBookCatalogBulkImportRequestSchema = z.object({}).strict();
export type RetryBookCatalogBulkImportRequest = z.infer<
  typeof retryBookCatalogBulkImportRequestSchema
>;

export const bookCatalogBulkImportItemSchema = z
  .object({
    id: z.string().uuid(),
    rowNumber: z.number().int().positive(),
    originalIsbnText: z.string(),
    normalizedIsbn13: z.string().length(13).nullable(),
    previewOutcome: bookCatalogBulkImportItemPreviewOutcomeSchema,
    previewId: z.string().uuid().nullable(),
    previewSnapshot: bookCatalogBulkImportPreviewSnapshotSchema.nullable(),
    outcome: bookCatalogBulkImportItemOutcomeSchema,
    failureCode: bookCatalogBulkImportFailureCodeSchema.nullable(),
    failureDetail: z.string().max(240).nullable(),
    catalogWorkId: z.string().uuid().nullable(),
    catalogEditionId: z.string().uuid().nullable(),
    duplicateOfItemId: z.string().uuid().nullable(),
    retryable: z.boolean(),
    attempts: z.number().int().nonnegative(),
    createdAt: utcDateTimeStringSchema,
    updatedAt: utcDateTimeStringSchema,
    completedAt: utcDateTimeStringSchema.nullable(),
  })
  .strict();

export type BookCatalogBulkImportItem = z.infer<
  typeof bookCatalogBulkImportItemSchema
>;

export const bookCatalogBulkImportOutcomeCountsSchema = z
  .object({
    pending: z.number().int().nonnegative(),
    invalid: z.number().int().nonnegative(),
    duplicate_in_file: z.number().int().nonnegative(),
    already_in_catalog: z.number().int().nonnegative(),
    book_reused: z.number().int().nonnegative(),
    book_created: z.number().int().nonnegative(),
    book_created_with_warnings: z.number().int().nonnegative(),
    not_found: z.number().int().nonnegative(),
    failed: z.number().int().nonnegative(),
  })
  .strict();

export type BookCatalogBulkImportOutcomeCounts = z.infer<
  typeof bookCatalogBulkImportOutcomeCountsSchema
>;

export const bookCatalogBulkImportPreviewOutcomeCountsSchema = z
  .object({
    pending: z.number().int().nonnegative(),
    invalid: z.number().int().nonnegative(),
    duplicate_in_file: z.number().int().nonnegative(),
    ready: z.number().int().nonnegative(),
    needs_selection: z.number().int().nonnegative(),
    not_found: z.number().int().nonnegative(),
    failed: z.number().int().nonnegative(),
  })
  .strict();

export type BookCatalogBulkImportPreviewOutcomeCounts = z.infer<
  typeof bookCatalogBulkImportPreviewOutcomeCountsSchema
>;

export const bookCatalogBulkImportBatchSchema = z
  .object({
    id: z.string().uuid(),
    status: bookCatalogBulkImportBatchStatusSchema,
    fileName: z.string().nullable(),
    languages: z.array(bookCatalogImportLanguageSchema).min(1).max(2),
    primaryLanguage: bookCatalogImportLanguageSchema,
    totalRows: z.number().int().nonnegative(),
    previewProcessedRows: z.number().int().nonnegative(),
    processedRows: z.number().int().nonnegative(),
    previewRetryableFailures: z.number().int().nonnegative(),
    retryableFailures: z.number().int().nonnegative(),
    previewOutcomeCounts: bookCatalogBulkImportPreviewOutcomeCountsSchema,
    outcomeCounts: bookCatalogBulkImportOutcomeCountsSchema,
    items: z
      .array(bookCatalogBulkImportItemSchema)
      .max(BOOK_CATALOG_BULK_IMPORT_MAX_ROWS),
    createdAt: utcDateTimeStringSchema,
    updatedAt: utcDateTimeStringSchema,
    previewExpiresAt: utcDateTimeStringSchema.nullable(),
    previewFingerprint: z.string().length(64).nullable(),
    confirmationIdempotencyKey: z.string().uuid().nullable(),
    confirmedAt: utcDateTimeStringSchema.nullable(),
    completedAt: utcDateTimeStringSchema.nullable(),
  })
  .strict();

export type BookCatalogBulkImportBatch = z.infer<
  typeof bookCatalogBulkImportBatchSchema
>;
