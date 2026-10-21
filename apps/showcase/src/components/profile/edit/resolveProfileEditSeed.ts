import {
  type BannerPresetId,
  type MeResponse,
  type ProfileSummary,
} from '@towelbooks/schemas';

import { resolveBannerPresetId } from '../../../features/banner-presets';

import type { ProfileEditBaseline } from './buildDirtyProfileUpdate';

export type ProfileEditSeed = {
  baseline: ProfileEditBaseline;
  drafts: {
    avatarBackground: string;
    bannerPresetId: BannerPresetId;
    bio: string;
    displayName: string;
    username: string;
  };
};

export function resolveProfileMeSnapshot(
  initialProfile: ProfileSummary | undefined,
  me: MeResponse,
): MeResponse {
  if (!initialProfile) {
    return me;
  }

  return {
    ...me,
    avatar: initialProfile.avatar,
    bannerPresetId: initialProfile.bannerPresetId,
    bio: initialProfile.bio,
    displayName: initialProfile.displayName,
    links: initialProfile.links,
    locale: initialProfile.locale ?? me.locale,
    username: initialProfile.username,
  };
}

export function resolveProfileEditSeed(
  initialProfile: ProfileSummary | undefined,
  me: MeResponse,
): ProfileEditSeed {
  const displayNameSource = initialProfile?.displayName ?? me.displayName ?? '';
  const bioSource = initialProfile?.bio ?? me.bio ?? '';
  const username = initialProfile?.username ?? me.username;
  const avatarBackground =
    initialProfile?.avatar.background ?? me.avatar.background;
  const bannerPresetId = resolveBannerPresetId(
    initialProfile?.bannerPresetId ?? me.bannerPresetId,
  );

  return {
    baseline: {
      avatarBackground,
      bannerPresetId,
      bio: bioSource.trim(),
      displayName: displayNameSource.trim(),
      username,
    },
    drafts: {
      avatarBackground,
      bannerPresetId,
      bio: bioSource,
      displayName: displayNameSource,
      username,
    },
  };
}
