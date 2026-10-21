import type { BannerImageUrls } from '@towelbooks/schemas';

import { BannerSurface } from './BannerSurface';

import type { CSSProperties } from 'react';

interface BannerAmbientProps {
  bannerPresetId: string | null;
  imageUrl?: string | null;
  imageUrls?: BannerImageUrls | null;
  /**
   * Colour-wash opacity per theme (0–1). Light paper needs a stronger wash than
   * dark paper for the same perceived glow.
   */
  intensity?: { light: number; dark: number };
  /**
   * Positioning + bleed extent, relative to the cover box (the ambient's
   * positioned parent). Anchor with top/bottom/inset rather than a fixed height
   * so the glow tracks the banner's responsive `aspect-[4/1]` size. Defaults to
   * the full-bleed room hero layout. The surrounding scroll container is
   * responsible for clipping the bleed and preventing horizontal scroll.
   */
  positionClassName?: string;
  /** Test id for the inner banner surface. */
  surfaceTestId?: string;
}

// Spotify-style backlight: a heavily blurred, scaled copy of the banner sits
// behind the cover and bleeds out around it, melting into the surrounding
// surface. Because it's behind the opaque cover, it's only visible where it
// extends past the cover's edges — so the `positionClassName` controls how far
// it spills on each side.
const FADE = 'radial-gradient(135% 100% at 50% 0%, #000 36%, transparent 92%)';

// Full content-column width, up behind the mobile header scrim, modest spill
// below — clipped to the main area by the room page shell.
const ROOM_POSITION =
  'left-1/2 w-screen -translate-x-1/2 -top-[calc(var(--app-mobile-header-height,4rem)+env(safe-area-inset-top,0px))] lg:top-0 -bottom-20 lg:-bottom-28';

export function BannerAmbient({
  bannerPresetId,
  imageUrl = null,
  imageUrls = null,
  intensity = { light: 0.6, dark: 0.2 },
  positionClassName = ROOM_POSITION,
  surfaceTestId = 'banner-ambient-surface',
}: BannerAmbientProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none absolute -z-10 ${positionClassName}`}
      style={{ maskImage: FADE, WebkitMaskImage: FADE }}
    >
      <div
        className="absolute inset-0 scale-150 blur-3xl saturate-[1.2] opacity-[var(--banner-ambient-light)] dark:opacity-[var(--banner-ambient-dark)]"
        style={
          {
            '--banner-ambient-light': intensity.light,
            '--banner-ambient-dark': intensity.dark,
          } as CSSProperties
        }
      >
        <BannerSurface
          presetId={bannerPresetId}
          imageUrl={imageUrl}
          imageUrls={imageUrls}
          className="!h-full !w-full !object-cover !aspect-auto !rounded-none"
          testId={surfaceTestId}
        />
      </div>
    </div>
  );
}
