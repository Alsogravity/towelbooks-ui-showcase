import type {
  CollectionAccentKey,
  CollectionIconKey,
} from '@towelbooks/schemas';

import { Icon } from '../../components/primitives';
import { useI18n } from '../../i18n';
import {
  COLLECTION_ACCENT_CLASS_BY_KEY,
  COLLECTION_ACCENT_KEYS_FOR_PICKER,
  COLLECTION_ICON_KEYS_FOR_PICKER,
  COLLECTION_ICON_NAME_BY_KEY,
  getCollectionAccentLabel,
  getCollectionIconLabel,
} from './collectionPresentation';

type CollectionPresentationPickerProps = {
  accentKey: CollectionAccentKey;
  iconKey: CollectionIconKey;
  onAccentChange: (accentKey: CollectionAccentKey) => void;
  onIconChange: (iconKey: CollectionIconKey) => void;
};

export function CollectionPresentationPicker({
  accentKey,
  iconKey,
  onAccentChange,
  onIconChange,
}: CollectionPresentationPickerProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-5">
      <fieldset className="space-y-3">
        <legend className="app-text-label text-ink">
          {t('collections.form.icon')}
        </legend>
        <div
          aria-label={t('collections.form.icon')}
          className="grid grid-cols-3 gap-2 sm:grid-cols-5"
          role="radiogroup"
        >
          {COLLECTION_ICON_KEYS_FOR_PICKER.map((key) => {
            const selected = key === iconKey;
            const label = getCollectionIconLabel(key, t);

            return (
              <button
                aria-checked={selected}
                aria-label={label}
                className={[
                  'flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-md border px-2 py-2 text-center transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus-visible:ring-offset-2',
                  selected
                    ? 'border-brick bg-brick-soft/25 text-ink shadow-sm'
                    : 'border-rule bg-paper-2/60 text-ink-3 hover:border-brick/50 hover:text-ink',
                ].join(' ')}
                key={key}
                onClick={() => onIconChange(key)}
                role="radio"
                type="button"
              >
                <Icon
                  aria-hidden="true"
                  name={COLLECTION_ICON_NAME_BY_KEY[key]}
                  size={21}
                  strokeWidth={1.7}
                />
                <span className="text-xs leading-tight">{label}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="app-text-label text-ink">
          {t('collections.form.accent')}
        </legend>
        <div
          aria-label={t('collections.form.accent')}
          className="flex flex-wrap gap-2"
          role="radiogroup"
        >
          {COLLECTION_ACCENT_KEYS_FOR_PICKER.map((key) => {
            const selected = key === accentKey;
            const label = getCollectionAccentLabel(key, t);
            const accent = COLLECTION_ACCENT_CLASS_BY_KEY[key];

            return (
              <button
                aria-checked={selected}
                aria-label={label}
                className={[
                  'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus-visible:ring-offset-2',
                  selected
                    ? `${accent.border} ${accent.surface} text-ink`
                    : 'border-rule bg-paper-2/60 text-ink-3 hover:border-brick/50 hover:text-ink',
                ].join(' ')}
                key={key}
                onClick={() => onAccentChange(key)}
                role="radio"
                type="button"
              >
                <span
                  aria-hidden="true"
                  className={`size-3 rounded-full ${accent.surface} ${accent.border} border`}
                />
                {label}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
