import { z } from 'zod';

export const myInsightsResponseSchema = z.object({
  booksFinishedThisYear: z.number().int().nonnegative(),
  booksInProgress: z.number().int().nonnegative(),
  totalInLibrary: z.number().int().nonnegative(),
});

export type MyInsightsResponse = z.infer<typeof myInsightsResponseSchema>;
