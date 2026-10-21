import { type ReactNode } from 'react';

import { getBannerPresetLabel, resolveBannerPreset } from './bannerPresets';
import {
  type BannerPresetPickerLayout,
  type BannerPresetSection,
} from './bannerPresetPickerShared';
import { useI18n } from '../../i18n';

import type { BannerPresetId } from '@towelbooks/schemas';

type BannerOptionSelectionMode = 'radio' | 'toggle';

type BannerOptionCardProps = {
  checked: boolean;
  label: string;
  layout: BannerPresetPickerLayout;
  onChange: () => void;
  preview: ReactNode;
  selectionMode: BannerOptionSelectionMode;
};

function BannerOptionCard({
  checked,
  label,
  layout,
  onChange,
  preview,
  selectionMode,
}: BannerOptionCardProps) {
  const isInline = layout === 'inline';
  const isToggle = selectionMode === 'toggle';

  return (
    <button
      type="button"
      {...(isToggle
        ? { 'aria-pressed': checked }
        : { role: 'radio', 'aria-checked': checked })}
      aria-label={isInline ? label : undefined}
      onMouseDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.stopPropagation();

        if (checked) {
          return;
        }

        onChange();
      }}
      className={[
        'cursor-pointer overflow-hidden border transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brick',
        isInline
          ? 'block w-full rounded-lg text-left'
          : 'block w-full rounded-xl text-left',
        checked
          ? 'border-brick bg-brick-soft/25 shadow-2'
          : 'border-rule bg-paper-2/60',
      ].join(' ')}
    >
      <div className="aspect-[4/1] w-full overflow-hidden">{preview}</div>
      {isInline ? null : (
        <p className="px-3 py-2 text-sm font-medium text-ink">{label}</p>
      )}
    </button>
  );
}

function BannerPreview({ presetId }: { presetId: BannerPresetId }) {
  const preset = resolveBannerPreset(presetId);

  if (
    (preset.type === 'illustration' || preset.type === 'background') &&
    preset.assetPath
  ) {
    return (
      <img
        alt=""
        aria-hidden="true"
        className="h-full w-full object-cover"
        loading="lazy"
        src={preset.assetPath}
      />
    );
  }

  if (preset.gradientStops) {
    return (
      <div
        aria-hidden="true"
        className="h-full w-full"
        style={{
          backgroundImage: `linear-gradient(135deg, ${preset.gradientStops[0]} 0%, ${preset.gradientStops[1]} 55%, ${preset.gradientStops[2]} 100%)`,
        }}
      />
    );
  }

  return null;
}

export function BannerPresetGridSection({
  layout,
  onChange,
  section,
  selectedValue,
  showSectionLabel = true,
  t,
}: {
  layout: BannerPresetPickerLayout;
  onChange: (nextValue: BannerPresetId) => void;
  section: BannerPresetSection;
  /** When null, no preset card is selected (e.g. custom image is active). */
  selectedValue: BannerPresetId | null;
  showSectionLabel?: boolean;
  t: ReturnType<typeof useI18n>['t'];
}) {
  return (
    <fieldset>
      <legend className="sr-only">{t(section.legendKey)}</legend>
      {showSectionLabel ? (
        <p className="mb-3 text-sm font-medium text-ink">
          {t(section.labelKey)}
        </p>
      ) : null}
      <div
        role="radiogroup"
        aria-label={t(section.labelKey)}
        className="grid grid-cols-1 gap-3"
      >
        {section.presets.map((preset) => (
          <BannerOptionCard
            key={preset.id}
            checked={selectedValue === preset.id}
            label={getBannerPresetLabel(t, preset)}
            layout={layout}
            onChange={() => onChange(preset.id)}
            preview={<BannerPreview presetId={preset.id} />}
            selectionMode="radio"
          />
        ))}
      </div>
    </fieldset>
  );
}

export function BannerPresetInlineList({
  onChange,
  sections,
  selectedValue,
  t,
}: {
  onChange: (nextValue: BannerPresetId) => void;
  sections: readonly BannerPresetSection[];
  selectedValue: BannerPresetId;
  t: ReturnType<typeof useI18n>['t'];
}) {
  return (
    <div
      role="group"
      aria-label={t('banner.picker.groupLabel')}
      className="flex flex-col gap-2"
    >
      {sections.map((section) =>
        section.presets.map((preset) => (
          <BannerOptionCard
            key={preset.id}
            checked={selectedValue === preset.id}
            label={getBannerPresetLabel(t, preset)}
            layout="inline"
            onChange={() => onChange(preset.id)}
            preview={<BannerPreview presetId={preset.id} />}
            selectionMode="toggle"
          />
        )),
      )}
    </div>
  );
}
