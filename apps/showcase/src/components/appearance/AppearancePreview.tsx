import { type Avatar, type BannerImageUrls } from '@towelbooks/schemas';
import { forwardRef } from 'react';

import { ProfileAppearanceEditIconButton } from '../profile/appearance/ProfileAppearanceEditIconButton';
import { ProfileCoverAvatarBlock } from '../profile/ProfileCoverAvatarBlock';
import { ProfileHeaderAvatar } from '../profile/ProfileHeaderAvatar';

export interface AppearancePreviewProps {
  avatar: Avatar;
  bannerPresetId: string | null;
  bannerImageUrl?: string | null;
  bannerImageUrls?: BannerImageUrls | null;
  name: string;
  onEditAvatar: () => void;
  onEditBanner: () => void;
  editAvatarAriaLabel: string;
  editBannerAriaLabel: string;
  className?: string;
}

export const AppearancePreview = forwardRef<
  HTMLDivElement,
  AppearancePreviewProps
>(function AppearancePreview(
  {
    avatar,
    bannerPresetId,
    bannerImageUrl = null,
    bannerImageUrls = null,
    name,
    onEditAvatar,
    onEditBanner,
    editAvatarAriaLabel,
    editBannerAriaLabel,
    className,
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className={['profile-header__hero shrink-0', className]
        .filter(Boolean)
        .join(' ')}
    >
      <ProfileCoverAvatarBlock
        bannerPresetId={bannerPresetId}
        bannerImageUrl={bannerImageUrl}
        bannerImageUrls={bannerImageUrls}
        bannerEdit={{
          ariaLabel: editBannerAriaLabel,
          onClick: onEditBanner,
        }}
      />
      <div className="profile-header__content px-4 lg:px-0">
        <div className="profile-header__topline">
          <div className="profile-header__identity">
            <div className="profile-header__avatar-slot">
              <ProfileHeaderAvatar avatar={avatar} displayName={name}>
                <ProfileAppearanceEditIconButton
                  ariaLabel={editAvatarAriaLabel}
                  onClick={onEditAvatar}
                  className="absolute right-[16%] top-[16%] z-20 -translate-y-1/2 translate-x-1/2"
                />
              </ProfileHeaderAvatar>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
