import { useState } from 'react';

import {
  BANNER_CATEGORY_TAB_ID_PREFIX,
  BANNER_PRESET_SECTIONS,
  resolveCategoryKeyForPreset,
} from './bannerPresetPickerShared';
import { BannerPresetGridSection } from './BannerPresetPickerSection';
import { Icon, Tabs, type IconName } from '../../components/primitives';
import { useI18n } from '../../i18n';

import type { BannerPresetId } from '@towelbooks/schemas';

function BannerCategoryTabLabel({
  icon,
  label,
}: {
  icon: IconName;
  label: string;
}) {
  return (
    <span className="inline-flex items-center justify-center gap-2">
      <Icon name={icon} size={16} aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function BannerPresetTabbedPicker({
  onChange,
  selectedValue,
}: {
  onChange: (nextValue: BannerPresetId) => void;
  selectedValue: BannerPresetId;
}) {
  const { t } = useI18n();
  const [activeCategoryKey, setActiveCategoryKey] = useState(() =>
    resolveCategoryKeyForPreset(selectedValue),
  );
  const [prevSelectedValue, setPrevSelectedValue] = useState(selectedValue);

  if (selectedValue !== prevSelectedValue) {
    setPrevSelectedValue(selectedValue);
    setActiveCategoryKey(resolveCategoryKeyForPreset(selectedValue));
  }

  const categoryTabs = BANNER_PRESET_SECTIONS.map((section) => ({
    key: section.categoryKey,
    label: (
      <BannerCategoryTabLabel icon={section.icon} label={t(section.labelKey)} />
    ),
  }));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Tabs
        tabs={categoryTabs}
        activeKey={activeCategoryKey}
        onChange={setActiveCategoryKey}
        idPrefix={BANNER_CATEGORY_TAB_ID_PREFIX}
        ariaLabel={t('banner.picker.categories')}
        className="profile-tabs-scrollbar-hidden w-full shrink-0 [&_[role=tablist]]:min-w-0"
      />
      {BANNER_PRESET_SECTIONS.map((section) => {
        const isActive = section.categoryKey === activeCategoryKey;

        return (
          <div
            key={section.categoryKey}
            id={`${BANNER_CATEGORY_TAB_ID_PREFIX}-${section.categoryKey}-panel`}
            role="tabpanel"
            aria-labelledby={`${BANNER_CATEGORY_TAB_ID_PREFIX}-${section.categoryKey}`}
            hidden={!isActive}
            className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-4"
          >
            {isActive ? (
              <BannerPresetGridSection
                layout="grid"
                onChange={onChange}
                section={section}
                selectedValue={selectedValue}
                showSectionLabel={false}
                t={t}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
