import { utcDateTimeStringSchema } from '../common/utc-datetime.js';
import { z } from 'zod';

import { avatarSchema } from './avatars.js';

export const AVATAR_UPLOAD_ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;
export type AvatarUploadContentType =
  (typeof AVATAR_UPLOAD_ALLOWED_CONTENT_TYPES)[number];

export const avatarUploadContentTypeSchema = z.enum(
  AVATAR_UPLOAD_ALLOWED_CONTENT_TYPES,
);

export const AVATAR_UPLOAD_MIN_SIZE_BYTES = 256;
export const AVATAR_UPLOAD_MAX_SIZE_BYTES = 5 * 1024 * 1024;

/** Width:height aspect ratio for processed images. Always express as width:height. */
export type ProcessedImageAspectRatio = {
  readonly width: number;
  readonly height: number;
};

export type ProcessedImagePresetKind =
  'avatar' | 'banner' | 'catalog_edition_cover';

/**
 * Typed processing preset for square and rectangular processed-image uploads.
 * Output heights are derived as `width * aspectRatio.height / aspectRatio.width`.
 */
export type ProcessedImagePreset = {
  readonly kind: ProcessedImagePresetKind;
  readonly aspectRatio: ProcessedImageAspectRatio;
  readonly minWidth: number;
  readonly minHeight: number;
  readonly maxWidth: number;
  readonly maxHeight: number;
  readonly outputWidths: readonly number[];
  readonly quality: number;
};

export const AVATAR_ASPECT_RATIO = { width: 1, height: 1 } as const;
export const BANNER_ASPECT_RATIO = { width: 4, height: 1 } as const;

export const AVATAR_PROCESSED_IMAGE_PRESET = {
  kind: 'avatar',
  aspectRatio: AVATAR_ASPECT_RATIO,
  minWidth: 128,
  minHeight: 128,
  maxWidth: 4096,
  maxHeight: 4096,
  outputWidths: [128, 256],
  quality: 85,
} as const satisfies ProcessedImagePreset;

export const BANNER_PROCESSED_IMAGE_PRESET = {
  kind: 'banner',
  aspectRatio: BANNER_ASPECT_RATIO,
  minWidth: 1200,
  minHeight: 300,
  maxWidth: 7680,
  maxHeight: 1920,
  outputWidths: [640, 1280, 1920],
  quality: 85,
} as const satisfies ProcessedImagePreset;

export const AVATAR_UPLOAD_MIN_DIMENSION =
  AVATAR_PROCESSED_IMAGE_PRESET.minWidth;
export const AVATAR_UPLOAD_MAX_DIMENSION =
  AVATAR_PROCESSED_IMAGE_PRESET.maxWidth;

export const AVATAR_OUTPUT_SIZES = AVATAR_PROCESSED_IMAGE_PRESET.outputWidths;
export type AvatarOutputSize = (typeof AVATAR_OUTPUT_SIZES)[number];

export const BANNER_UPLOAD_ALLOWED_CONTENT_TYPES =
  AVATAR_UPLOAD_ALLOWED_CONTENT_TYPES;
export type BannerUploadContentType =
  (typeof BANNER_UPLOAD_ALLOWED_CONTENT_TYPES)[number];

export const bannerUploadContentTypeSchema = z.enum(
  BANNER_UPLOAD_ALLOWED_CONTENT_TYPES,
);

export const BANNER_UPLOAD_MIN_SIZE_BYTES = 1024;
export const BANNER_UPLOAD_MAX_SIZE_BYTES = 10 * 1024 * 1024;

export const BANNER_UPLOAD_MIN_WIDTH = BANNER_PROCESSED_IMAGE_PRESET.minWidth;
export const BANNER_UPLOAD_MIN_HEIGHT = BANNER_PROCESSED_IMAGE_PRESET.minHeight;
export const BANNER_UPLOAD_MAX_WIDTH = BANNER_PROCESSED_IMAGE_PRESET.maxWidth;
export const BANNER_UPLOAD_MAX_HEIGHT = BANNER_PROCESSED_IMAGE_PRESET.maxHeight;

export const BANNER_OUTPUT_WIDTHS = BANNER_PROCESSED_IMAGE_PRESET.outputWidths;
export type BannerOutputWidth = (typeof BANNER_OUTPUT_WIDTHS)[number];

export const CATALOG_EDITION_COVER_UPLOAD_ALLOWED_CONTENT_TYPES =
  AVATAR_UPLOAD_ALLOWED_CONTENT_TYPES;
export type CatalogEditionCoverUploadContentType =
  (typeof CATALOG_EDITION_COVER_UPLOAD_ALLOWED_CONTENT_TYPES)[number];

export const catalogEditionCoverUploadContentTypeSchema = z.enum(
  CATALOG_EDITION_COVER_UPLOAD_ALLOWED_CONTENT_TYPES,
);

export const CATALOG_EDITION_COVER_UPLOAD_MIN_SIZE_BYTES = 256;
export const CATALOG_EDITION_COVER_UPLOAD_MAX_SIZE_BYTES = 5 * 1024 * 1024;

export const CATALOG_EDITION_COVER_ASPECT_RATIO = {
  width: 2,
  height: 3,
} as const;

export const CATALOG_EDITION_COVER_PROCESSED_IMAGE_PRESET = {
  kind: 'catalog_edition_cover',
  aspectRatio: CATALOG_EDITION_COVER_ASPECT_RATIO,
  minWidth: 160,
  minHeight: 240,
  maxWidth: 4096,
  maxHeight: 6144,
  outputWidths: [320, 640, 960],
  quality: 85,
} as const satisfies ProcessedImagePreset;

export const bannerImageUrlsSchema = z.object({
  '640': z.string().url(),
  '1280': z.string().url(),
  '1920': z.string().url(),
});
export type BannerImageUrls = z.infer<typeof bannerImageUrlsSchema>;

export const bannerImageSchema = z.object({
  imageUrl: z.string().nullable(),
  imageUrls: bannerImageUrlsSchema.nullable(),
});
export type BannerImage = z.infer<typeof bannerImageSchema>;

export const MEDIA_ASSET_STATUSES = [
  'pending_upload',
  'uploaded',
  'processing',
  'active',
  'rejected',
  'superseded',
  'deleted',
] as const;
export type MediaAssetStatus = (typeof MEDIA_ASSET_STATUSES)[number];

export const mediaAssetStatusSchema = z.enum(MEDIA_ASSET_STATUSES);

/** Persisted on `media_assets.rejection_reason` when status is `rejected`. */
export const MEDIA_ASSET_REJECTION_REASONS = [
  'expired',
  'forbidden',
  'invalid_content_type',
  'invalid_dimensions',
  'invalid_format',
  'oversized',
  'undersized',
  'corrupt_image',
  'processing_failed',
] as const;
export type MediaAssetRejectionReason =
  (typeof MEDIA_ASSET_REJECTION_REASONS)[number];

export const mediaAssetRejectionReasonSchema = z.enum(
  MEDIA_ASSET_REJECTION_REASONS,
);

export const createAvatarUploadIntentRequestSchema = z
  .object({
    contentType: avatarUploadContentTypeSchema,
    sizeBytes: z
      .number()
      .int()
      .min(AVATAR_UPLOAD_MIN_SIZE_BYTES)
      .max(AVATAR_UPLOAD_MAX_SIZE_BYTES),
  })
  .strict();

export type CreateAvatarUploadIntentRequest = z.infer<
  typeof createAvatarUploadIntentRequestSchema
>;

export const avatarUploadPutDescriptorSchema = z.object({
  kind: z.literal('put-url'),
  url: z.string().min(1),
  headers: z.record(z.string(), z.string()),
});

export const avatarUploadPostPolicyDescriptorSchema = z.object({
  kind: z.literal('post-policy'),
  url: z.string().min(1),
  formFields: z.record(z.string(), z.string()),
});

export const avatarUploadDescriptorSchema = z.discriminatedUnion('kind', [
  avatarUploadPutDescriptorSchema,
  avatarUploadPostPolicyDescriptorSchema,
]);

export type AvatarUploadDescriptor = z.infer<
  typeof avatarUploadDescriptorSchema
>;

export const avatarUploadIntentResponseSchema = z.object({
  uploadIntentToken: z.string().min(1),
  upload: avatarUploadDescriptorSchema,
  expiresAt: utcDateTimeStringSchema,
  maxSizeBytes: z.number().int().positive(),
  acceptedContentTypes: z.array(avatarUploadContentTypeSchema),
});

export type AvatarUploadIntentResponse = z.infer<
  typeof avatarUploadIntentResponseSchema
>;

export const completeAvatarUploadResponseSchema = z.object({
  avatar: avatarSchema,
});

export type CompleteAvatarUploadResponse = z.infer<
  typeof completeAvatarUploadResponseSchema
>;

export const createBannerUploadIntentRequestSchema = z
  .object({
    contentType: bannerUploadContentTypeSchema,
    sizeBytes: z
      .number()
      .int()
      .min(BANNER_UPLOAD_MIN_SIZE_BYTES)
      .max(BANNER_UPLOAD_MAX_SIZE_BYTES),
  })
  .strict();

export type CreateBannerUploadIntentRequest = z.infer<
  typeof createBannerUploadIntentRequestSchema
>;

export const bannerUploadIntentResponseSchema = z.object({
  uploadIntentToken: z.string().min(1),
  upload: avatarUploadDescriptorSchema,
  expiresAt: utcDateTimeStringSchema,
  maxSizeBytes: z.number().int().positive(),
  acceptedContentTypes: z.array(bannerUploadContentTypeSchema),
});

export type BannerUploadIntentResponse = z.infer<
  typeof bannerUploadIntentResponseSchema
>;

export const completeBannerUploadResponseSchema = z.object({
  bannerImage: bannerImageSchema.nullable(),
});

export type CompleteBannerUploadResponse = z.infer<
  typeof completeBannerUploadResponseSchema
>;

export const createCatalogEditionCoverUploadIntentRequestSchema = z
  .object({
    contentType: catalogEditionCoverUploadContentTypeSchema,
    sizeBytes: z
      .number()
      .int()
      .min(CATALOG_EDITION_COVER_UPLOAD_MIN_SIZE_BYTES)
      .max(CATALOG_EDITION_COVER_UPLOAD_MAX_SIZE_BYTES),
  })
  .strict();

export type CreateCatalogEditionCoverUploadIntentRequest = z.infer<
  typeof createCatalogEditionCoverUploadIntentRequestSchema
>;

export const catalogEditionCoverUploadIntentResponseSchema = z.object({
  uploadIntentToken: z.string().min(1),
  upload: avatarUploadDescriptorSchema,
  expiresAt: utcDateTimeStringSchema,
  maxSizeBytes: z.number().int().positive(),
  acceptedContentTypes: z.array(catalogEditionCoverUploadContentTypeSchema),
});

export type CatalogEditionCoverUploadIntentResponse = z.infer<
  typeof catalogEditionCoverUploadIntentResponseSchema
>;

export const catalogEditionCoverUploadResponseSchema = z
  .object({
    mediaAssetId: z.string().uuid(),
    publicUrl: z.string().url(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  })
  .strict();

export type CatalogEditionCoverUploadResponse = z.infer<
  typeof catalogEditionCoverUploadResponseSchema
>;
