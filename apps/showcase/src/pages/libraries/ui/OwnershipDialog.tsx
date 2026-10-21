import {
  LIBRARY_ITEM_OWNERSHIP_NOTE_MAX_LENGTH,
  type LibraryItemAcquisitionSource,
  type LibraryItemDigitalPlatform,
  type LibraryItemOwnership,
  type LibraryItemOwnershipFormat,
  type LibraryItemPhysicalCondition,
} from '@towelbooks/schemas';
import { useState } from 'react';

import { ResponsiveOverlayShell } from '../../../components/overlay';
import {
  Button,
  DialogActions,
  FormField,
  Input,
  Select,
  Textarea,
} from '../../../components/primitives';
import { useIsBelowSmViewport } from '../../../layouts/app/shellViewport';
import { useI18n } from '../../../i18n';
import { toDateOnlyInputValue } from '../../../lib/datetime';

import {
  libraryItemAcquisitionSourceValues,
  libraryItemDigitalPlatformValues,
  libraryItemOwnershipFormatValues,
  libraryItemPhysicalConditionValues,
  ownershipConditionLabelKeys,
  ownershipFormatLabelKeys,
  ownershipPlatformLabelKeys,
  ownershipSourceLabelKeys,
} from './libraryPageShared';

export type OwnershipDraft = {
  acquiredAt: string;
  condition: LibraryItemPhysicalCondition | '';
  format: LibraryItemOwnershipFormat;
  note: string;
  platform: LibraryItemDigitalPlatform | '';
  source: LibraryItemAcquisitionSource | '';
};

type OwnershipFormErrors = Partial<
  Record<keyof OwnershipDraft | 'form', string>
>;

export function getOwnershipSummaryLabel(
  t: ReturnType<typeof useI18n>['t'],
  ownership: LibraryItemOwnership,
): string {
  const formatLabel = t(ownershipFormatLabelKeys[ownership.format]);
  const platformLabel = ownership.platform
    ? t(ownershipPlatformLabelKeys[ownership.platform])
    : null;
  return platformLabel ? `${formatLabel} · ${platformLabel}` : formatLabel;
}

function createOwnershipDraft(
  ownership?: LibraryItemOwnership | null,
): OwnershipDraft {
  return {
    acquiredAt: ownership ? toDateOnlyInputValue(ownership.acquiredAt) : '',
    condition: ownership?.condition ?? '',
    format: ownership?.format ?? 'physical',
    note: ownership?.note ?? '',
    platform: ownership?.platform ?? '',
    source: ownership?.source ?? '',
  };
}

export function serializeOwnershipDraft(draft: OwnershipDraft) {
  const isPhysical = draft.format === 'physical';

  return {
    acquiredAt: draft.acquiredAt || null,
    condition: isPhysical ? draft.condition || null : null,
    format: draft.format,
    note: draft.note.trim() || null,
    platform: isPhysical ? null : draft.platform || null,
    source: draft.source || null,
  };
}

export function OwnershipDialog({
  initialOwnership = null,
  isSaving,
  onClose,
  onSubmit,
}: {
  initialOwnership?: LibraryItemOwnership | null;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (draft: OwnershipDraft) => Promise<unknown>;
}) {
  const { t } = useI18n();
  const isBelowSmViewport = useIsBelowSmViewport();
  const [draft, setDraft] = useState(() =>
    createOwnershipDraft(initialOwnership),
  );
  const [errors, setErrors] = useState<OwnershipFormErrors>({});
  const prefix = initialOwnership?.id ?? 'new-ownership';
  const isPhysical = draft.format === 'physical';
  const formId = `${prefix}-ownership-form`;
  const title = initialOwnership
    ? t('myLibrary.items.ownership.editTitle')
    : t('myLibrary.items.ownership.create');

  const updateDraft = <K extends keyof OwnershipDraft>(
    key: K,
    value: OwnershipDraft[K],
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined, form: undefined }));
  };

  const actions = (
    <>
      <Button
        type="button"
        variant={isBelowSmViewport ? 'secondary' : 'tertiary'}
        onClick={onClose}
      >
        {t('common.cancel')}
      </Button>
      <Button
        form={formId}
        isLoading={isSaving}
        loadingLabel={t('myLibrary.items.ownership.saving')}
        type="submit"
      >
        {initialOwnership
          ? t('myLibrary.items.ownership.save')
          : t('myLibrary.items.ownership.create')}
      </Button>
    </>
  );

  return (
    <ResponsiveOverlayShell
      closeLabel={t('common.close')}
      dialogSize="md"
      footer={
        isBelowSmViewport ? (
          actions
        ) : (
          <DialogActions stackOnMobile>{actions}</DialogActions>
        )
      }
      onClose={onClose}
      title={title}
    >
      <form
        id={formId}
        className="flex flex-col gap-5"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const trimmedNote = draft.note.trim();
          if (trimmedNote.length > LIBRARY_ITEM_OWNERSHIP_NOTE_MAX_LENGTH) {
            setErrors({
              note: t('myLibrary.items.ownership.validation.noteMax'),
            });
            return;
          }

          setErrors({});
          void onSubmit({ ...draft, note: trimmedNote }).catch(() => {
            setErrors({ form: t('myLibrary.items.ownership.error.save') });
          });
        }}
      >
        <FormField
          htmlFor={`${prefix}-format`}
          label={t('myLibrary.items.ownership.formatLabel')}
        >
          <Select
            id={`${prefix}-format`}
            value={draft.format}
            onChange={(event) => {
              const format = event.target.value as LibraryItemOwnershipFormat;
              setDraft((current) => ({
                ...current,
                condition: format === 'physical' ? current.condition : '',
                format,
                platform: format === 'physical' ? '' : current.platform,
              }));
            }}
          >
            {libraryItemOwnershipFormatValues.map((format) => (
              <option key={format} value={format}>
                {t(ownershipFormatLabelKeys[format])}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          htmlFor={`${prefix}-source`}
          label={t('myLibrary.items.ownership.sourceLabel')}
        >
          <Select
            id={`${prefix}-source`}
            value={draft.source}
            onChange={(event) =>
              updateDraft(
                'source',
                event.target.value as LibraryItemAcquisitionSource | '',
              )
            }
          >
            <option value="">
              {t('myLibrary.items.ownership.notSpecified')}
            </option>
            {libraryItemAcquisitionSourceValues.map((source) => (
              <option key={source} value={source}>
                {t(ownershipSourceLabelKeys[source])}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          htmlFor={`${prefix}-acquired-at`}
          label={t('myLibrary.items.ownership.acquiredAtLabel')}
        >
          <Input
            id={`${prefix}-acquired-at`}
            type="date"
            value={draft.acquiredAt}
            onChange={(event) => updateDraft('acquiredAt', event.target.value)}
          />
        </FormField>

        {isPhysical ? (
          <FormField
            htmlFor={`${prefix}-condition`}
            label={t('myLibrary.items.ownership.conditionLabel')}
          >
            <Select
              id={`${prefix}-condition`}
              value={draft.condition}
              onChange={(event) =>
                updateDraft(
                  'condition',
                  event.target.value as LibraryItemPhysicalCondition | '',
                )
              }
            >
              <option value="">
                {t('myLibrary.items.ownership.notSpecified')}
              </option>
              {libraryItemPhysicalConditionValues.map((condition) => (
                <option key={condition} value={condition}>
                  {t(ownershipConditionLabelKeys[condition])}
                </option>
              ))}
            </Select>
          </FormField>
        ) : (
          <FormField
            htmlFor={`${prefix}-platform`}
            label={t('myLibrary.items.ownership.platformLabel')}
          >
            <Select
              id={`${prefix}-platform`}
              value={draft.platform}
              onChange={(event) =>
                updateDraft(
                  'platform',
                  event.target.value as LibraryItemDigitalPlatform | '',
                )
              }
            >
              <option value="">
                {t('myLibrary.items.ownership.notSpecified')}
              </option>
              {libraryItemDigitalPlatformValues.map((platform) => (
                <option key={platform} value={platform}>
                  {t(ownershipPlatformLabelKeys[platform])}
                </option>
              ))}
            </Select>
          </FormField>
        )}

        <FormField
          error={errors.note}
          htmlFor={`${prefix}-note`}
          label={t('myLibrary.items.ownership.noteLabel')}
        >
          <Textarea
            id={`${prefix}-note`}
            maxLength={LIBRARY_ITEM_OWNERSHIP_NOTE_MAX_LENGTH}
            rows={3}
            value={draft.note}
            onChange={(event) => updateDraft('note', event.target.value)}
          />
          <p className="app-text-caption mt-1 text-right text-ink-3">
            {draft.note.trim().length}/{LIBRARY_ITEM_OWNERSHIP_NOTE_MAX_LENGTH}
          </p>
        </FormField>

        {errors.form ? (
          <p className="vui-form-field__error" role="alert">
            {errors.form}
          </p>
        ) : null}
      </form>
    </ResponsiveOverlayShell>
  );
}
