import type { CatalogCoverVariant } from './coverImages';

/**
 * Delivery choices belong to the surface that renders a cover. Presentation
 * components may forward this narrow policy, but should not choose it from a
 * route or viewport.
 */
export type CatalogCoverDelivery = {
  decoding?: 'async' | 'auto' | 'sync';
  fetchPriority?: 'high' | 'low' | 'auto';
  loading?: 'eager' | 'lazy';
  preferredVariant?: CatalogCoverVariant;
};
