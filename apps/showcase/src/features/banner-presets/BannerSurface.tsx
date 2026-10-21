import type { BannerImageUrls } from '@towelbooks/schemas';

import { BannerPresetSurface } from './BannerPresetSurface';
import { getBannerPresetLabel, resolveBannerPreset } from './bannerPresets';
import { useI18n } from '../../i18n';

type BannerSurfaceProps = {
  presetId: string | null;
  imageUrl?: string | null;
  imageUrls?: BannerImageUrls | null;
  className?: string;
  testId?: string;
};

function buildBannerSrcSet(imageUrls: BannerImageUrls): string {
  return [
    `${imageUrls['640']} 640w`,
    `${imageUrls['1280']} 1280w`,
    `${imageUrls['1920']} 1920w`,
  ].join(', ');
}

/**
 * Renders a custom banner image when present, otherwise the fixed preset.
 * Keeps the single visual ratio `aspect-[4/1]`.
 */
export function BannerSurface({
  presetId,
  imageUrl = null,
  imageUrls = null,
  className = '',
  testId = 'banner-surface',
}: BannerSurfaceProps) {
  const { t } = useI18n();
  const preset = resolveBannerPreset(presetId);
  const label = getBannerPresetLabel(t, preset);
  const resolvedImageUrl = imageUrl ?? imageUrls?.['1920'] ?? null;

  if (resolvedImageUrl) {
    const containerClassName = [
      'relative w-full overflow-hidden rounded-2xl aspect-[4/1]',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={containerClassName} data-testid={testId}>
        <img
          alt=""
          aria-hidden="true"
          className="absolute inset-0 z-0 h-full w-full object-cover"
          loading="lazy"
          sizes="100vw"
          src={resolvedImageUrl}
          srcSet={imageUrls ? buildBannerSrcSet(imageUrls) : undefined}
        />
        <span className="sr-only">{label}</span>
      </div>
    );
  }

  return (
    <BannerPresetSurface
      className={className}
      presetId={presetId}
      testId={testId}
    />
  );
}
