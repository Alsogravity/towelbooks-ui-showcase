import {
  AVATAR_PRESET_BACKGROUNDS,
  deriveAvatarForeground,
  isValidAvatarHex,
  normalizeAvatarHex,
  type Avatar,
} from '@towelbooks/schemas';
import { useId, useState } from 'react';

import { useI18n } from '../../../i18n';
import { Avatar as AvatarPrimitive } from '../../primitives';

export interface AvatarColorPickerProps {
  previewAvatar: Avatar;
  value: string;
  onChange: (background: string) => void;
}

function normalizeHexInput(value: string): string {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return '';
  }

  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
}

type CustomHexFieldProps = {
  customInputId: string;
  onChange: (background: string) => void;
  previewAvatar: Avatar;
  value: string;
};

function CustomHexField({
  customInputId,
  onChange,
  previewAvatar,
  value,
}: CustomHexFieldProps) {
  const { t } = useI18n();
  const [customHexDraft, setCustomHexDraft] = useState(value);
  const [customHexError, setCustomHexError] = useState<string | null>(null);

  const previewForeground = isValidAvatarHex(value)
    ? deriveAvatarForeground(value)
    : previewAvatar.foreground;

  const commitCustomHex = (rawValue: string) => {
    const candidate = normalizeHexInput(rawValue);

    if (!isValidAvatarHex(candidate)) {
      setCustomHexError(t('settings.profile.edit.avatarColor.invalid'));
      return;
    }

    setCustomHexError(null);
    onChange(normalizeAvatarHex(candidate));
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <AvatarPrimitive
          background={
            isValidAvatarHex(value) ? value : previewAvatar.background
          }
          foreground={previewForeground}
          initial={previewAvatar.initial}
          imageUrl={previewAvatar.imageUrl}
          imageAlt={previewAvatar.initial}
          size="md"
        />
        <input
          id={customInputId}
          type="text"
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          maxLength={7}
          value={customHexDraft}
          placeholder="#581810"
          aria-invalid={customHexError ? true : undefined}
          aria-describedby={
            customHexError ? `${customInputId}-error` : undefined
          }
          onChange={(event) => {
            setCustomHexDraft(event.target.value);
            if (customHexError) {
              setCustomHexError(null);
            }
          }}
          onBlur={() => {
            if (customHexDraft.trim().length === 0) {
              setCustomHexError(null);
              return;
            }

            commitCustomHex(customHexDraft);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              commitCustomHex(customHexDraft);
            }
          }}
          className="min-w-[8rem] rounded-md border border-rule bg-paper px-3 py-2 font-mono text-body-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brick"
        />
        <input
          type="color"
          value={
            isValidAvatarHex(value)
              ? value
              : previewAvatar.background.slice(0, 7)
          }
          aria-label={t('settings.profile.edit.avatarColor.nativePicker')}
          onChange={(event) => {
            setCustomHexError(null);
            onChange(normalizeAvatarHex(event.target.value));
          }}
          className="size-10 cursor-pointer rounded-md border border-rule bg-paper p-1"
        />
      </div>
      {customHexError ? (
        <p
          id={`${customInputId}-error`}
          className="text-body-sm text-brick"
          role="alert"
        >
          {customHexError}
        </p>
      ) : null}
    </>
  );
}

export function AvatarColorPicker({
  previewAvatar,
  value,
  onChange,
}: AvatarColorPickerProps) {
  // TODO: Reintroduce avatar color picker after UX refinement (MVP uses only initial color)
  //       This component is intentionally not rendered by any consumer.
  const { t } = useI18n();
  const customInputId = useId();

  return (
    <div className="flex flex-col gap-4">
      <div
        role="group"
        aria-label={t('settings.profile.edit.avatarColor')}
        className="flex flex-wrap gap-3"
      >
        {AVATAR_PRESET_BACKGROUNDS.map((presetBackground, index) => {
          const isSelected =
            value.toUpperCase() === presetBackground.toUpperCase();
          const presetForeground = deriveAvatarForeground(presetBackground);

          return (
            <button
              key={presetBackground}
              type="button"
              aria-pressed={isSelected}
              aria-label={t('settings.profile.edit.avatarColor.preset', {
                values: {
                  index: index + 1,
                  hex: presetBackground,
                },
              })}
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.stopPropagation();
                onChange(presetBackground);
              }}
              className="rounded-full p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brick"
              data-selected={isSelected ? 'true' : undefined}
            >
              <span
                aria-hidden="true"
                className={[
                  'block size-9 rounded-full border border-rule',
                  isSelected ? 'ring-2 ring-offset-2 ring-brick' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{ backgroundColor: presetBackground }}
              />
              <span className="sr-only">{presetForeground}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={customInputId} className="text-body-sm text-ink-2">
          {t('settings.profile.edit.avatarColor.custom')}
        </label>
        <CustomHexField
          key={value}
          customInputId={customInputId}
          onChange={onChange}
          previewAvatar={previewAvatar}
          value={value}
        />
      </div>
    </div>
  );
}
