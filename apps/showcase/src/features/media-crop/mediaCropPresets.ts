import {
  AVATAR_ASPECT_RATIO,
  AVATAR_UPLOAD_MIN_DIMENSION,
  BANNER_ASPECT_RATIO,
} from '@towelbooks/schemas';

export type MediaCropShape = 'circle' | 'rect';

export type MediaCropPreset = {
  kind: 'avatar' | 'banner';
  /** Width / height. */
  aspectRatio: number;
  /** Visual mask for the crop frame (avatar is circular in product UI). */
  shape: MediaCropShape;
  /** Pixel size of the exported file (exact aspect). */
  outputWidth: number;
  outputHeight: number;
  mimeType: 'image/jpeg';
  quality: number;
  fileName: string;
  /**
   * Minimum natural-pixel size of the crop region (so the export is not
   * upscaled from a tiny source patch).
   */
  minCropWidth: number;
  minCropHeight: number;
};

export const AVATAR_MEDIA_CROP_PRESET = {
  kind: 'avatar',
  aspectRatio: AVATAR_ASPECT_RATIO.width / AVATAR_ASPECT_RATIO.height,
  shape: 'circle',
  // Export above the largest avatar variant so server resize stays sharp.
  outputWidth: 512,
  outputHeight: 512,
  mimeType: 'image/jpeg',
  quality: 0.92,
  fileName: 'avatar.jpg',
  minCropWidth: AVATAR_UPLOAD_MIN_DIMENSION,
  minCropHeight: AVATAR_UPLOAD_MIN_DIMENSION,
} as const satisfies MediaCropPreset;

export const BANNER_MEDIA_CROP_PRESET = {
  kind: 'banner',
  aspectRatio: BANNER_ASPECT_RATIO.width / BANNER_ASPECT_RATIO.height,
  shape: 'rect',
  // Match the largest published banner width. Smaller sources are upscaled on
  // export so any readable image can be used as a banner source.
  outputWidth: 1920,
  outputHeight: 480,
  mimeType: 'image/jpeg',
  quality: 0.9,
  fileName: 'banner.jpg',
  minCropWidth: 1,
  minCropHeight: 1,
} as const satisfies MediaCropPreset;

export const MEDIA_CROP_MIN_ZOOM = 1;
export const MEDIA_CROP_MAX_ZOOM = 4;
