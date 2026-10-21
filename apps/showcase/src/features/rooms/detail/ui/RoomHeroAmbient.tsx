import type { BannerImageUrls } from '@towelbooks/schemas';

import { BannerAmbient } from '../../../banner-presets';

interface RoomHeroAmbientProps {
  bannerPresetId: string | null;
  imageUrl?: string | null;
  imageUrls?: BannerImageUrls | null;
}

// Room banner backlight — the shared ambient with its default full-width room
// layout (bleeds up behind the mobile header scrim and out to the page edges).
export function RoomHeroAmbient({
  bannerPresetId,
  imageUrl = null,
  imageUrls = null,
}: RoomHeroAmbientProps) {
  return (
    <BannerAmbient
      bannerPresetId={bannerPresetId}
      imageUrl={imageUrl}
      imageUrls={imageUrls}
      surfaceTestId="ambient-banner-preset"
    />
  );
}
