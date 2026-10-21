import { getBannerPresetLabel, resolveBannerPreset } from './bannerPresets';
import { useI18n } from '../../i18n';

type BannerPresetSurfaceProps = {
  presetId: string | null;
  className?: string;
  testId?: string;
};

export function BannerPresetSurface({
  presetId,
  className = '',
  testId = 'banner-preset-surface',
}: BannerPresetSurfaceProps) {
  const { t } = useI18n();
  const preset = resolveBannerPreset(presetId);
  const label = getBannerPresetLabel(t, preset);

  const containerClassName = [
    'relative w-full overflow-hidden rounded-2xl aspect-[4/1]',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClassName} data-testid={testId}>
      {preset.type === 'illustration' && preset.assetPath ? (
        <img
          alt=""
          aria-hidden="true"
          className="absolute inset-0 z-0 h-full w-full object-cover"
          loading="lazy"
          src={preset.assetPath}
        />
      ) : null}

      {preset.type === 'background' && preset.assetPath ? (
        <img
          alt=""
          aria-hidden="true"
          className="absolute inset-0 z-0 h-full w-full object-cover"
          loading="lazy"
          src={preset.assetPath}
        />
      ) : null}

      {preset.type === 'gradient' && preset.gradientStops ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(135deg, ${preset.gradientStops[0]} 0%, ${preset.gradientStops[1]} 55%, ${preset.gradientStops[2]} 100%)`,
          }}
        />
      ) : null}

      <span className="sr-only">{label}</span>
    </div>
  );
}
