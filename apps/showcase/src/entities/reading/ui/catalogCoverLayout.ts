/** Standard synthetic/loading fallback ratio; real covers keep intrinsic geometry. */
export const CATALOG_COVER_ASPECT_CLASS = 'aspect-[2/3]';

/**
 * Natural cover height bounds relative to width.
 * Typical paperback is 1.5 (2:3); slack prevents ultra-short or ultra-tall UI breakage.
 */
export const CATALOG_COVER_NATURAL_MIN_HEIGHT_RATIO = 1.15;
export const CATALOG_COVER_NATURAL_MAX_HEIGHT_RATIO = 1.9;

/** Enables cqw units for natural cover height clamps. */
export const CATALOG_COVER_NATURAL_CONTAINER_CLASS_NAME =
  '@container relative w-full';

/**
 * Height follows the image, clamped between ~1.15× and ~1.9× the cover width.
 * `object-contain` avoids distortion when a clamp engages.
 */
export const CATALOG_COVER_NATURAL_IMAGE_SIZE_CLASS_NAME =
  'block h-auto w-full min-h-[115cqw] max-h-[190cqw] object-contain object-top';
