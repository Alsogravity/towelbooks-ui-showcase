import type { CatalogReview } from '@towelbooks/schemas';

import type { CatalogReviewEditorFormValues } from './catalogReviewEditorCopy';
import type { CatalogReviewOrigin } from './catalogReviewNavigation';

export type CatalogReviewEditorMode = 'create' | 'edit';

export type CatalogReviewEditorProps =
  | {
      initialCatalogWork: {
        catalogWorkId: string;
        title: string;
      };
      mode: 'create';
      origin?: CatalogReviewOrigin | null;
    }
  | {
      initialReflection: CatalogReview;
      mode: 'edit';
      origin?: CatalogReviewOrigin | null;
    };

export function buildCatalogReviewsTabHref(catalogWorkId: string) {
  return `/catalog/${encodeURIComponent(catalogWorkId)}?tab=catalog-reviews`;
}

export function buildCatalogReviewInitialValues(
  mode: CatalogReviewEditorMode,
  initialReflection: CatalogReview | null,
): CatalogReviewEditorFormValues {
  if (mode === 'create') {
    return { body: '', title: '' };
  }

  return {
    body: initialReflection!.body,
    title: initialReflection!.title,
  };
}
