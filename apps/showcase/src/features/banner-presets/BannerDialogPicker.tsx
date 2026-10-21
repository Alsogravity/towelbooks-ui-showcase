import { useState, type ReactNode } from 'react';

import { BannerPhotoSection } from '../../components/appearance/BannerPhotoSection';
import { Icon, Tabs, type Tab } from '../../components/primitives';
import { useI18n } from '../../i18n';
import { BannerPresetGridSection } from './BannerPresetPickerSection';
import {
  BANNER_PRESET_SECTIONS,
  resolveCategoryKeyForPreset,
} from './bannerPresetPickerShared';

import type { BannerImageUrls, BannerPresetId } from '@towelbooks/schemas';

export type BannerActiveSource = 'custom' | 'preset';

export type BannerDialogPickerProps = {
  presetId: string | null;
  /**
   * Available custom banner (saved or pending), even when a preset is active
   * for display. Used as the selectable option in the upload tab.
   */
  imageUrl: string | null;
  imageUrls?: BannerImageUrls | null;
  activeSource: BannerActiveSource;
  onBannerSelectFile: (file: File, previewUrl: string) => void;
  onBannerSelectCustom: () => void;
  onBannerRemove: () => void;
  bannerPhotoChooseLabel: string;
  bannerPhotoRemoveLabel: string;
  bannerPhotoErrorKeyPrefix: string;
  bannerPresetValue: BannerPresetId;
  onBannerPresetChange: (presetId: BannerPresetId) => void;
  close: (afterClose?: () => void) => void;
};

const UPLOAD_TAB_KEY = 'upload';

export function BannerDialogPicker({
  presetId,
  imageUrl,
  imageUrls,
  activeSource,
  onBannerSelectFile,
  onBannerSelectCustom,
  onBannerRemove,
  bannerPhotoChooseLabel,
  bannerPhotoRemoveLabel,
  bannerPhotoErrorKeyPrefix,
  bannerPresetValue,
  onBannerPresetChange,
  close,
}: BannerDialogPickerProps) {
  const { t } = useI18n();

  const [activeTabKey, setActiveTabKey] = useState<string>(() =>
    activeSource === 'custom' && imageUrl
      ? UPLOAD_TAB_KEY
      : resolveCategoryKeyForPreset(bannerPresetValue),
  );

  const tabs: Tab[] = [
    {
      key: UPLOAD_TAB_KEY,
      label: (
        <span className="inline-flex items-center justify-center gap-2">
          <Icon name="upload" size={24} aria-hidden />
          <span className="sr-only sm:not-sr-only">
            {t('banner.picker.upload')}
          </span>
        </span>
      ),
    },
    ...BANNER_PRESET_SECTIONS.map((section) => ({
      key: section.categoryKey,
      label: (
        <span className="inline-flex items-center justify-center gap-2">
          <Icon name={section.icon} size={24} aria-hidden />
          <span className="sr-only sm:not-sr-only">{t(section.labelKey)}</span>
        </span>
      ),
    })),
  ];

  const selectedPresetValue =
    activeSource === 'preset' ? bannerPresetValue : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Tabs
        tabs={tabs}
        activeKey={activeTabKey}
        onChange={setActiveTabKey}
        idPrefix="banner-dialog-tab"
        ariaLabel={t('banner.picker.categories')}
        className="w-full shrink-0"
      />
      <TabPanel
        id="banner-dialog-tab-upload-panel"
        labelledBy="banner-dialog-tab-upload"
        isActive={activeTabKey === UPLOAD_TAB_KEY}
      >
        <BannerPhotoSection
          presetId={presetId}
          imageUrl={imageUrl}
          imageUrls={imageUrls}
          customSelected={activeSource === 'custom'}
          onSelectCustom={
            imageUrl
              ? () => {
                  onBannerSelectCustom();
                  close();
                }
              : undefined
          }
          onSelectFile={onBannerSelectFile}
          onRemove={onBannerRemove}
          chooseLabel={bannerPhotoChooseLabel}
          removeLabel={bannerPhotoRemoveLabel}
          errorKeyPrefix={bannerPhotoErrorKeyPrefix}
        />
      </TabPanel>
      {BANNER_PRESET_SECTIONS.map((section) => (
        <TabPanel
          key={section.categoryKey}
          id={`banner-dialog-tab-${section.categoryKey}-panel`}
          labelledBy={`banner-dialog-tab-${section.categoryKey}`}
          isActive={activeTabKey === section.categoryKey}
        >
          <BannerPresetGridSection
            layout="grid"
            onChange={(nextValue) => {
              onBannerPresetChange(nextValue);
              close();
            }}
            section={section}
            selectedValue={selectedPresetValue}
            showSectionLabel={false}
            t={t}
          />
        </TabPanel>
      ))}
    </div>
  );
}

function TabPanel({
  id,
  labelledBy,
  isActive,
  children,
}: {
  id: string;
  labelledBy: string;
  isActive: boolean;
  children: ReactNode;
}) {
  return (
    <div
      id={id}
      role="tabpanel"
      aria-labelledby={labelledBy}
      hidden={!isActive}
      className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-4"
    >
      {isActive ? children : null}
    </div>
  );
}
