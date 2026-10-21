import {
  CATALOG_REVIEW_BODY_MAX_LENGTH,
  CATALOG_REVIEW_TITLE_MAX_LENGTH,
} from '@towelbooks/schemas';
import { z } from 'zod';

type Translate = (
  key: string,
  options?: { fallback?: string; values?: Record<string, number | string> },
) => string;

export function createCatalogReviewEditorSchema(t: Translate) {
  return z.object({
    body: z
      .string()
      .trim()
      .min(1, t('catalog.catalogReviewEditor.validation.bodyRequired'))
      .max(
        CATALOG_REVIEW_BODY_MAX_LENGTH,
        t('catalog.catalogReviewEditor.validation.bodyMax', {
          values: { max: CATALOG_REVIEW_BODY_MAX_LENGTH },
        }),
      ),
    title: z
      .string()
      .trim()
      .min(1, t('catalog.catalogReviewEditor.validation.titleRequired'))
      .max(
        CATALOG_REVIEW_TITLE_MAX_LENGTH,
        t('catalog.catalogReviewEditor.validation.titleMax', {
          values: { max: CATALOG_REVIEW_TITLE_MAX_LENGTH },
        }),
      ),
  });
}

export type CatalogReviewEditorFormValues = z.output<
  ReturnType<typeof createCatalogReviewEditorSchema>
>;
