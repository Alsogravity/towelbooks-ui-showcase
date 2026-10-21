import { type Avatar, type BannerImageUrls } from '@towelbooks/schemas';
import { forwardRef } from 'react';

import { AppearancePreview } from '../../appearance/AppearancePreview';
import { useI18n } from '../../../i18n';

export interface ProfileEditAppearancePreviewProps {
  avatar: Avatar;
  bannerPresetId: string | null;
  bannerImageUrl?: string | null;
  bannerImageUrls?: BannerImageUrls | null;
  displayName: string;
  onEditAvatar: () => void;
  onEditBanner: () => void;
}

export const ProfileEditAppearancePreview = forwardRef<
  HTMLDivElement,
  ProfileEditAppearancePreviewProps
>(function ProfileEditAppearancePreview(
  {
    avatar,
    bannerPresetId,
    bannerImageUrl = null,
    bannerImageUrls = null,
    displayName,
    onEditAvatar,
    onEditBanner,
  },
  ref,
) {
  const { t } = useI18n();

  return (
    <AppearancePreview
      ref={ref}
      avatar={avatar}
      bannerPresetId={bannerPresetId}
      bannerImageUrl={bannerImageUrl}
      bannerImageUrls={bannerImageUrls}
      name={displayName}
      onEditAvatar={onEditAvatar}
      onEditBanner={onEditBanner}
      editAvatarAriaLabel={t('settings.profile.edit.editAvatar')}
      editBannerAriaLabel={t('settings.profile.edit.editBanner')}
    />
  );
});
