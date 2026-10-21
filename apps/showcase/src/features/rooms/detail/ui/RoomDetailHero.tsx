import type { BannerImageUrls } from '@towelbooks/schemas';
import type { ReactNode } from 'react';

import { ProfileCoverAvatarBlock } from '../../../../components/profile/ProfileCoverAvatarBlock';
import { RoomDetailHeroSummary } from './RoomDetailHeroSummary';
import { RoomHeaderAvatar } from './RoomHeaderAvatar';
import { RoomHeroAmbient } from './RoomHeroAmbient';

import type { ComponentProps } from 'react';

const heroGutterClasses = 'px-4 lg:px-0';

type RoomDetailHeroProps = {
  bannerPresetId: string;
  bannerImageUrl?: string | null;
  bannerImageUrls?: BannerImageUrls | null;
  headerActions?: ReactNode;
  title: string;
} & ComponentProps<typeof RoomDetailHeroSummary>;

export function RoomDetailHero({
  bannerPresetId,
  bannerImageUrl = null,
  bannerImageUrls = null,
  headerActions,
  title,
  ...summaryProps
}: RoomDetailHeroProps) {
  return (
    <section className="profile-header__hero pt-0 relative isolate">
      <div className="relative">
        <RoomHeroAmbient
          bannerPresetId={bannerPresetId}
          imageUrl={bannerImageUrl}
          imageUrls={bannerImageUrls}
        />
        <ProfileCoverAvatarBlock
          bannerPresetId={bannerPresetId}
          bannerImageUrl={bannerImageUrl}
          bannerImageUrls={bannerImageUrls}
        />
      </div>

      <div className={['profile-header__content', heroGutterClasses].join(' ')}>
        <div className="profile-header__topline">
          <div className="profile-header__identity">
            <div className="profile-header__avatar-slot">
              <RoomHeaderAvatar
                avatar={summaryProps.room.avatar}
                name={title}
              />
            </div>
          </div>

          {headerActions ? (
            <div className="hidden lg:block">
              <div className="profile-header__actions-slot right-0 lg:flex">
                {headerActions}
              </div>
            </div>
          ) : null}
        </div>

        <div className="profile-header__name-row">
          <h1 className="profile-header__display-name app-text-entity-title truncate text-ink">
            {title}
          </h1>
        </div>

        <RoomDetailHeroSummary {...summaryProps} />
      </div>
    </section>
  );
}
