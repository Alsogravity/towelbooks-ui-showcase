import type { BannerImageUrls } from '@towelbooks/schemas';

import { BannerSurface } from '../../features/banner-presets';
import { Icon } from '../primitives';

export interface ProfileCoverAvatarEditAction {
  ariaLabel: string;
  onClick: () => void;
}

export interface ProfileCoverAvatarBlockProps {
  bannerPresetId: string | null;
  bannerImageUrl?: string | null;
  bannerImageUrls?: BannerImageUrls | null;
  bannerEdit?: ProfileCoverAvatarEditAction;
  className?: string;
}

export function ProfileCoverAvatarBlock({
  bannerPresetId,
  bannerImageUrl = null,
  bannerImageUrls = null,
  bannerEdit,
  className,
}: ProfileCoverAvatarBlockProps) {
  const rootClassName = ['relative isolate', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClassName}>
      <div className="relative">
        <BannerSurface
          className="profile-header__cover relative z-0 rounded-t-none rounded-b-2xl"
          imageUrl={bannerImageUrl}
          imageUrls={bannerImageUrls}
          presetId={bannerPresetId}
          testId="profile-banner"
        />
        {bannerEdit ? (
          <button
            type="button"
            onClick={bannerEdit.onClick}
            className="pointer-events-auto absolute top-3 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-ink/20 bg-paper-2 text-ink-3 shadow-md transition-all hover:bg-paper-3 hover:text-ink active:scale-95"
            aria-label={bannerEdit.ariaLabel}
          >
            <Icon name="image-pen" size={18} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
