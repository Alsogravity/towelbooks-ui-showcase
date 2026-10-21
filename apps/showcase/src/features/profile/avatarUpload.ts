import {
  AVATAR_UPLOAD_ALLOWED_CONTENT_TYPES,
  AVATAR_UPLOAD_MAX_DIMENSION,
  AVATAR_UPLOAD_MAX_SIZE_BYTES,
  AVATAR_UPLOAD_MIN_DIMENSION,
  AVATAR_UPLOAD_MIN_SIZE_BYTES,
} from '@towelbooks/schemas';

const ALLOWED_CONTENT_TYPE_SET = new Set<string>(
  AVATAR_UPLOAD_ALLOWED_CONTENT_TYPES,
);

export type ProfileAvatarUploadValidationError =
  'unsupportedType' | 'tooSmall' | 'tooLarge' | 'invalidDimensions';

function validateContentTypeAndSize(
  file: File,
): ProfileAvatarUploadValidationError | null {
  if (!ALLOWED_CONTENT_TYPE_SET.has(file.type)) {
    return 'unsupportedType';
  }

  if (file.size < AVATAR_UPLOAD_MIN_SIZE_BYTES) {
    return 'tooSmall';
  }

  if (file.size > AVATAR_UPLOAD_MAX_SIZE_BYTES) {
    return 'tooLarge';
  }

  return null;
}

async function readImageDimensions(
  file: File,
): Promise<{ width: number; height: number } | null> {
  if (typeof createImageBitmap !== 'function') {
    return null;
  }

  try {
    const bitmap = await createImageBitmap(file);

    return {
      height: bitmap.height,
      width: bitmap.width,
    };
  } catch {
    return null;
  }
}

/**
 * Validate a candidate avatar *source* before the crop UI. Same dimension
 * bounds as the final file — the crop always emits a 1:1 square within range.
 */
export async function validateAvatarSourceFile(
  file: File,
): Promise<ProfileAvatarUploadValidationError | null> {
  return validateAvatarFile(file);
}

/**
 * Validate a candidate avatar file at selection / post-crop time so the user
 * gets immediate feedback before anything is staged for upload. Mirrors the
 * constraints the API re-enforces server-side when the upload is committed
 * on Save.
 */
export async function validateAvatarFile(
  file: File,
): Promise<ProfileAvatarUploadValidationError | null> {
  const contentTypeOrSizeError = validateContentTypeAndSize(file);

  if (contentTypeOrSizeError) {
    return contentTypeOrSizeError;
  }

  const dimensions = await readImageDimensions(file);

  if (
    dimensions &&
    (dimensions.width < AVATAR_UPLOAD_MIN_DIMENSION ||
      dimensions.height < AVATAR_UPLOAD_MIN_DIMENSION ||
      dimensions.width > AVATAR_UPLOAD_MAX_DIMENSION ||
      dimensions.height > AVATAR_UPLOAD_MAX_DIMENSION)
  ) {
    return 'invalidDimensions';
  }

  return null;
}
