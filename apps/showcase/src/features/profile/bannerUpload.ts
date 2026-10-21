import {
  BANNER_UPLOAD_ALLOWED_CONTENT_TYPES,
  BANNER_UPLOAD_MAX_SIZE_BYTES,
  BANNER_UPLOAD_MIN_SIZE_BYTES,
} from '@towelbooks/schemas';

const ALLOWED_CONTENT_TYPE_SET = new Set<string>(
  BANNER_UPLOAD_ALLOWED_CONTENT_TYPES,
);

export type BannerUploadValidationError =
  'unsupportedType' | 'tooSmall' | 'tooLarge';

function validateContentTypeAndSize(
  file: File,
): BannerUploadValidationError | null {
  if (!ALLOWED_CONTENT_TYPE_SET.has(file.type)) {
    return 'unsupportedType';
  }

  if (file.size < BANNER_UPLOAD_MIN_SIZE_BYTES) {
    return 'tooSmall';
  }

  if (file.size > BANNER_UPLOAD_MAX_SIZE_BYTES) {
    return 'tooLarge';
  }

  return null;
}

/**
 * Validate a candidate banner *source* before the crop UI.
 * Dimension/aspect limits are not enforced here — the crop step always exports
 * a fixed 4:1 JPEG at a size the API accepts; the API remains authoritative.
 */
export async function validateBannerSourceFile(
  file: File,
): Promise<BannerUploadValidationError | null> {
  return validateContentTypeAndSize(file);
}

/**
 * Validate a banner file after crop (or for non-crop callers). Type and byte
 * size only on the client; dimensions are guaranteed by the crop export and
 * re-checked server-side.
 */
export async function validateBannerFile(
  file: File,
): Promise<BannerUploadValidationError | null> {
  return validateContentTypeAndSize(file);
}
