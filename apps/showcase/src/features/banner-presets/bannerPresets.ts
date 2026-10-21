import {
  BANNER_PRESETS,
  DEFAULT_BANNER_PRESET_ID,
  getBannerPreset,
  resolveBannerPresetId,
  type BannerPreset,
  type BannerPresetId,
} from '@towelbooks/schemas';

import type { useI18n } from '../../i18n';

export {
  BANNER_PRESETS,
  DEFAULT_BANNER_PRESET_ID,
  resolveBannerPresetId,
  type BannerPreset,
  type BannerPresetId,
};

export function resolveBannerPreset(
  presetId: string | null | undefined,
): BannerPreset {
  const id = resolveBannerPresetId(presetId);
  return getBannerPreset(id) ?? getBannerPreset(DEFAULT_BANNER_PRESET_ID)!;
}

export function getBannerPresetLabel(
  t: ReturnType<typeof useI18n>['t'],
  preset: BannerPreset,
): string {
  return t(preset.nameKey);
}

export const BANNER_ILLUSTRATION_PRESETS = BANNER_PRESETS.filter(
  (preset) => preset.type === 'illustration',
);

export const BANNER_BACKGROUND_PRESETS = BANNER_PRESETS.filter(
  (preset) => preset.type === 'background',
);

export const BANNER_GRADIENT_PRESETS = BANNER_PRESETS.filter(
  (preset) => preset.type === 'gradient',
);
