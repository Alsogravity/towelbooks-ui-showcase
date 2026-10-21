import { z } from 'zod';

import { catalogSearchCandidateSchema } from './catalog/search.js';

export const homeResponseSchema = z
  .object({
    forYou: z.array(catalogSearchCandidateSchema),
    discover: z.array(catalogSearchCandidateSchema),
  })
  .strict();

export type HomeResponse = z.infer<typeof homeResponseSchema>;
