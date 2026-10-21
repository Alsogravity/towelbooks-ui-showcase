import {
  resolveBannerPresetId,
  type BannerPresetId,
  type UpdateMeRequest,
} from '@towelbooks/schemas';

export type ProfileEditBaseline = {
  avatarBackground: string;
  bannerPresetId: BannerPresetId;
  bio: string;
  displayName: string;
  username: string;
};

export type ProfileEditDrafts = {
  avatarBackground: string;
  bannerPresetId: BannerPresetId;
  bio: string;
  displayName: string;
  username: string;
};

function normalizeNullableText(value: string): string | null {
  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

export function buildDirtyProfileUpdate(
  drafts: ProfileEditDrafts,
  baseline: ProfileEditBaseline,
  currentUsername: string,
): UpdateMeRequest {
  const payload: UpdateMeRequest = {};

  const nextDisplayName = normalizeNullableText(drafts.displayName);
  const baselineDisplayName = normalizeNullableText(baseline.displayName);

  if (nextDisplayName !== baselineDisplayName) {
    payload.displayName =
      nextDisplayName === currentUsername ? null : nextDisplayName;
  }

  const nextUsername = drafts.username.trim().toLowerCase();

  if (nextUsername !== baseline.username) {
    payload.username = nextUsername;
  }

  const nextBio = normalizeNullableText(drafts.bio);
  const baselineBio = normalizeNullableText(baseline.bio);

  if (nextBio !== baselineBio) {
    payload.bio = nextBio;
  }

  if (drafts.avatarBackground !== baseline.avatarBackground) {
    payload.avatarBackground = drafts.avatarBackground;
  }

  const nextBannerPresetId = resolveBannerPresetId(drafts.bannerPresetId);
  const baselineBannerPresetId = resolveBannerPresetId(baseline.bannerPresetId);

  if (nextBannerPresetId !== baselineBannerPresetId) {
    payload.bannerPresetId = nextBannerPresetId;
  }

  return payload;
}
