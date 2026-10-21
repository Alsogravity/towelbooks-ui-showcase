import {
  BANNER_BACKGROUND_PRESETS,
  BANNER_GRADIENT_PRESETS,
  BANNER_ILLUSTRATION_PRESETS,
} from './bannerPresets';

import type { BannerPreset, BannerPresetId } from '@towelbooks/schemas';
import type { IconName } from '../../components/primitives';

export type BannerPresetPickerLayout = 'grid' | 'inline' | 'tabbed';

export type BannerPresetCategoryKey =
  'gradients' | 'illustrations' | 'backgrounds';

export type BannerDialogTabKey = 'upload' | BannerPresetCategoryKey;

export type BannerPresetSection = {
  categoryKey: BannerPresetCategoryKey;
  icon: IconName;
  legendKey: string;
  labelKey: string;
  presets: readonly BannerPreset[];
};

export const BANNER_PRESET_SECTIONS: ReadonlyArray<BannerPresetSection> = [
  {
    categoryKey: 'illustrations',
    icon: 'feather',
    legendKey: 'banner.picker.illustrationsLegend',
    labelKey: 'banner.picker.illustrations',
    presets: BANNER_ILLUSTRATION_PRESETS,
  },
  {
    categoryKey: 'backgrounds',
    icon: 'square-chart-gantt',
    legendKey: 'banner.picker.backgroundsLegend',
    labelKey: 'banner.picker.backgrounds',
    presets: BANNER_BACKGROUND_PRESETS,
  },
  {
    categoryKey: 'gradients',
    icon: 'palette',
    legendKey: 'banner.picker.gradientsLegend',
    labelKey: 'banner.picker.gradients',
    presets: BANNER_GRADIENT_PRESETS,
  },
];

export const BANNER_CATEGORY_TAB_ID_PREFIX = 'banner-category-tab';

export function resolveCategoryKeyForPreset(
  presetId: BannerPresetId,
): BannerPresetCategoryKey {
  const section = BANNER_PRESET_SECTIONS.find((candidate) =>
    candidate.presets.some((preset) => preset.id === presetId),
  );

  return section?.categoryKey ?? BANNER_PRESET_SECTIONS[0]!.categoryKey;
}
