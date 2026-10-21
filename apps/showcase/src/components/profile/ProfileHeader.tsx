import {
  type Avatar as AvatarShape,
  type BannerImageUrls,
  type ExternalLink,
} from '@towelbooks/schemas';

import { BannerAmbient } from '../../features/banner-presets';
import { ExternalLinksSummary } from '../../features/external-links';
import { useI18n } from '../../i18n';
import { ExpandableMultilineText } from '../text/ExpandableMultilineText';
import { ProfileActions, type ProfileActionsProps } from './ProfileActions';
import { ProfileCoverAvatarBlock } from './ProfileCoverAvatarBlock';
import { ProfileHeaderAvatar } from './ProfileHeaderAvatar';
import {
  ProfileVisitorMenu,
  type ProfileVisitorMenuProps,
} from './ProfileVisitorMenu';
import { ProfileStats, type ProfileStatItem } from './ProfileStats';

export interface ProfileHeaderProps {
  avatar: AvatarShape;
  bannerPresetId: string | null;
  bannerImageUrl?: string | null;
  bannerImageUrls?: BannerImageUrls | null;
  displayName: string;
  username: string;
  bio?: string;
  links?: ExternalLink[];
  stats: ProfileStatItem[];
  actions?: ProfileActionsProps;
  visitorMenu?: ProfileVisitorMenuProps;
}

export function ProfileHeader({
  avatar,
  bannerPresetId,
  bannerImageUrl = null,
  bannerImageUrls = null,
  displayName,
  username,
  bio,
  links = [],
  stats,
  actions,
  visitorMenu,
}: ProfileHeaderProps) {
  const { t } = useI18n();
  const hasBio = bio !== undefined && bio !== null && bio !== '';

  return (
    <section className="profile-header__hero relative isolate">
      <div className="relative">
        <BannerAmbient
          bannerPresetId={bannerPresetId}
          imageUrl={bannerImageUrl}
          imageUrls={bannerImageUrls}
          positionClassName="left-1/2 w-screen -translate-x-1/2 -top-4 -bottom-8"
          surfaceTestId="profile-ambient-banner-preset"
        />
        <ProfileCoverAvatarBlock
          bannerPresetId={bannerPresetId}
          bannerImageUrl={bannerImageUrl}
          bannerImageUrls={bannerImageUrls}
        />
      </div>

      <div className="profile-header__content px-4 lg:px-0">
        <div className="profile-header__topline">
          <div className="profile-header__identity">
            <div className="profile-header__avatar-slot">
              <ProfileHeaderAvatar avatar={avatar} displayName={displayName} />
            </div>
          </div>
        </div>

        <div className="profile-header__name-row">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h2 className="profile-header__display-name app-text-entity-title truncate text-ink">
                {displayName}
              </h2>
              {visitorMenu ? <ProfileVisitorMenu {...visitorMenu} /> : null}
            </div>
            <p className="profile-header__username app-text-body truncate text-ink-2">
              {t('profile.handle', { values: { handle: username } })}
            </p>
          </div>
        </div>

        {hasBio ? (
          <ExpandableMultilineText
            className="profile-header__bio mt-1"
            text={bio}
            textClassName="app-text-body text-ink-2"
          />
        ) : null}

        <div className="profile-header__stats-row mt-2">
          <ProfileStats items={stats} />
        </div>

        {links.length > 0 ? (
          <div className="profile-header__links mt-3">
            <ExternalLinksSummary links={links} variant="plain" />
          </div>
        ) : null}

        {actions ? (
          <div className="profile-header__header-actions mt-3 flex">
            <ProfileActions {...actions} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
