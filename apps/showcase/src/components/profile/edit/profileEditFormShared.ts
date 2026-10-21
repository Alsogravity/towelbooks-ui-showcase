import type { MeResponse } from '@towelbooks/schemas';

export const FORM_ID = 'profile-edit-form';
export const PROFILE_EDIT_PANEL_TITLE_ID = 'profile-edit-panel-title';

export type CloseProfileEditForm = (afterClose?: () => void) => void;

export type ProfileEditField = 'displayName' | 'username' | 'bio';

/**
 * A staged avatar change that has not been persisted yet. The selected file is
 * only previewed locally; it is uploaded (or the existing photo cleared) when
 * the user saves the profile.
 */
export type AvatarSelection =
  | { kind: 'pending-upload'; file: File; previewUrl: string }
  | { kind: 'pending-remove' };

/**
 * A staged custom banner change. Preset selection stays on `bannerPresetId`;
 * this only covers upload/clear of the custom image.
 */
export type BannerSelection =
  | { kind: 'pending-upload'; file: File; previewUrl: string }
  | { kind: 'pending-remove' };

export type ProfileSaveFailure = {
  cause: unknown;
  failedStep?: 'categories';
  savedProfile?: MeResponse;
};

export function isProfileEditField(field: string): field is ProfileEditField {
  return field === 'displayName' || field === 'username' || field === 'bio';
}

export function isProfileSaveFailure(
  error: unknown,
): error is ProfileSaveFailure {
  if (!error || typeof error !== 'object') {
    return false;
  }

  return 'cause' in error && ('savedProfile' in error || 'failedStep' in error);
}
