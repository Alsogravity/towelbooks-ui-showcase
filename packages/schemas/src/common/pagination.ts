import { z } from 'zod';

export const cursorPageInfoSchema = z.object({
  nextCursor: z.string().min(1).nullable(),
  hasNextPage: z.boolean(),
});
export type CursorPageInfo = z.infer<typeof cursorPageInfoSchema>;

export const createCursorPaginatedResponseSchema = <T extends z.ZodTypeAny>(
  itemSchema: T,
) =>
  z.object({
    items: z.array(itemSchema),
    pageInfo: cursorPageInfoSchema,
  });

export const offsetPaginatedResponseSchema = <T extends z.ZodTypeAny>(
  itemSchema: T,
) =>
  z.object({
    items: z.array(itemSchema),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  });
