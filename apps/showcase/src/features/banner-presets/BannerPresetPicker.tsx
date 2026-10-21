import { memo } from 'react';

import { DEFAULT_BANNER_PRESET_ID } from './bannerPresets';
import {
  BannerPresetGridSection,
  BannerPresetInlineList,
} from './BannerPresetPickerSection';
import { BannerPresetTabbedPicker } from './BannerPresetTabbedPicker';
import {
  BANNER_PRESET_SECTIONS,
  type BannerPresetPickerLayout,
} from './bannerPresetPickerShared';
import { useI18n } from '../../i18n';

import type { BannerPresetId } from '@towelbooks/schemas';

/**
 * - `grid`: stacked sections with headings; fits regular forms.
 * - `inline`: compact vertical list of 4:1 previews.
 * - `tabbed`: category tabs; requires a flex column parent with bounded height
 *   (for example an appearance bottom sheet body).
 */
type BannerPresetPickerProps = {
  value: BannerPresetId;
  onChange: (nextValue: BannerPresetId) => void;
  layout?: BannerPresetPickerLayout;
};

export const BannerPresetPicker = memo(function BannerPresetPicker({
  value,
  onChange,
  layout = 'grid',
}: BannerPresetPickerProps) {
  const { t } = useI18n();
  const selectedValue = value ?? DEFAULT_BANNER_PRESET_ID;

  if (layout === 'inline') {
    return (
      <div data-testid="banner-preset-picker" data-layout="inline">
        <BannerPresetInlineList
          onChange={onChange}
          sections={BANNER_PRESET_SECTIONS}
          selectedValue={selectedValue}
          t={t}
        />
      </div>
    );
  }

  if (layout === 'tabbed') {
    return (
      <div
        className="flex min-h-0 flex-1 flex-col"
        data-testid="banner-preset-picker"
        data-layout="tabbed"
      >
        <BannerPresetTabbedPicker
          onChange={onChange}
          selectedValue={selectedValue}
        />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-6"
      data-testid="banner-preset-picker"
      data-layout="grid"
    >
      {BANNER_PRESET_SECTIONS.map((section) => (
        <BannerPresetGridSection
          key={section.labelKey}
          layout={layout}
          onChange={onChange}
          section={section}
          selectedValue={selectedValue}
          t={t}
        />
      ))}
    </div>
  );
});
