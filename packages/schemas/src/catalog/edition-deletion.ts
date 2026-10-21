import { z } from 'zod';

export const CATALOG_DELETION_BLOCKER_COUNT_CAP = 100;

export const catalogDeletionBlockerDetailsSchema = z
  .object({
    blockerKinds: z.array(z.string().min(1).max(64)).max(16),
    blockerCount: z
      .number()
      .int()
      .nonnegative()
      .max(CATALOG_DELETION_BLOCKER_COUNT_CAP),
    blockerCountCapped: z.boolean(),
  })
  .strict();

export type CatalogDeletionBlockerDetails = z.infer<
  typeof catalogDeletionBlockerDetailsSchema
>;

export const catalogEditionDeletionResponseSchema = z
  .object({
    catalogEditionId: z.string().uuid(),
    catalogWorkId: z.string().uuid(),
    editionDeleted: z.literal(true),
    workDeleted: z.boolean(),
    coverMediaAssetId: z.string().uuid().nullable(),
  })
  .strict();

export type CatalogEditionDeletionResponse = z.infer<
  typeof catalogEditionDeletionResponseSchema
>;
