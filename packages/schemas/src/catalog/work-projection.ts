import { z } from 'zod';

import { coverGeometrySchema } from './cover-geometry.js';
import { catalogWorkTypeSchema } from '../enums/catalog-work.js';
import { catalogWorkTagSchema } from './search.js';
import { catalogLanguageTagSchema } from './language.js';
import { supportedLocaleSchema } from './taxonomy-localization.js';

export const catalogWorkDisplaySchema = z
  .object({
    title: z.string(),
    subtitle: z.string().nullable(),
    synopsis: z.string().nullable(),
    language: catalogLanguageTagSchema.nullable(),
    catalogEditionId: z.string().nullable(),
    coverCatalogEditionId: z.string().nullable().optional(),
    coverUrl: z.string().nullable(),
    coverThumbnailUrl: z.string().nullable(),
    coverGeometry: coverGeometrySchema.nullable().optional(),
  })
  .strict();

export type CatalogWorkDisplay = z.infer<typeof catalogWorkDisplaySchema>;

export const catalogWorkCategorySchema = z
  .object({
    slug: z.string().min(1),
    displayName: z.string().min(1),
    displayNameLocale: supportedLocaleSchema,
  })
  .strict();

export const catalogWorkProjectionSchema = z
  .object({
    id: z.string().min(1),
    kind: catalogWorkTypeSchema,
    display: catalogWorkDisplaySchema,
    contributors: z.array(z.string()),
    categories: z.array(catalogWorkCategorySchema),
    tags: z.array(catalogWorkTagSchema).max(30).optional(),
  })
  .strict();

export type CatalogWorkProjection = z.infer<typeof catalogWorkProjectionSchema>;
