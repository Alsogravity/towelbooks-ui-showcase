import { useCallback, useState } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
} from '../../../components/primitives';
import { useI18n } from '../../../i18n';
import {
  getTodayLocalDateString,
  toDateOnlyInputValue,
} from '../../../lib/datetime';
import {
  localDateDaysFromNow,
  toManualAccessExpiresAt,
} from './manualAccessDateOptions';

type DialogAction = 'set' | 'restore' | 'update';

type ManualAccessExpirationDialogProps = {
  action: DialogAction;
  currentExpiresAt: string | null;
  error: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (input: { expiresAt: string | null }) => void;
};

export function ManualAccessExpirationDialog({
  action,
  currentExpiresAt,
  error,
  isSubmitting,
  onClose,
  onSubmit,
}: ManualAccessExpirationDialogProps) {
  const { t } = useI18n();

  const hasFiniteExpiration = Boolean(currentExpiresAt);
  const defaultDate = hasFiniteExpiration
    ? toDateOnlyInputValue(currentExpiresAt) || getTodayLocalDateString()
    : localDateDaysFromNow(30);

  const [mode, setMode] = useState<'none' | 'date'>(
    hasFiniteExpiration ? 'date' : 'none',
  );
  const [dateValue, setDateValue] = useState(defaultDate);

  const handleModeChange = useCallback((newMode: 'none' | 'date') => {
    setMode(newMode);
  }, []);

  const handlePreset = useCallback((days: number) => {
    setDateValue(localDateDaysFromNow(days));
  }, []);

  const handleSubmit = useCallback(() => {
    onSubmit({
      expiresAt: toManualAccessExpiresAt(
        mode === 'none' ? { mode: 'none' } : { mode: 'date', date: dateValue },
      ),
    });
  }, [dateValue, mode, onSubmit]);

  const isDateValid = dateValue.length > 0;
  const isSubmitDisabled = isSubmitting || (mode === 'date' && !isDateValid);

  const titleKey =
    action === 'set'
      ? 'rooms.members.management.access.manual.set'
      : action === 'restore'
        ? 'rooms.members.management.access.manual.restore'
        : 'rooms.members.management.access.manual.updateExpiration';

  const confirmKey =
    action === 'update'
      ? 'rooms.members.management.access.manual.updateExpirationDialog.confirm'
      : action === 'restore'
        ? 'rooms.members.management.access.manual.restore'
        : 'rooms.members.management.access.manual.set';

  return (
    <Dialog onClose={onClose} title={t(titleKey)} size="sm">
      <DialogBody className="gap-4">
        {error ? (
          <p role="alert" className="meta text-brick">
            {error}
          </p>
        ) : null}

        <fieldset className="space-y-3">
          <legend className="vui-form-field__label mb-1">
            {t('rooms.members.management.access.manual.dialogExpiration')}
          </legend>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              checked={mode === 'none'}
              className="h-4 w-4 accent-brick"
              name="manual-expiration-mode"
              onChange={() => handleModeChange('none')}
              type="radio"
              value="none"
            />
            <span className="text-sm text-ink">
              {t('rooms.members.management.access.manual.expirationMode.none')}
            </span>
          </label>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              checked={mode === 'date'}
              className="h-4 w-4 accent-brick"
              name="manual-expiration-mode"
              onChange={() => handleModeChange('date')}
              type="radio"
              value="date"
            />
            <span className="text-sm text-ink">
              {t('rooms.members.management.access.manual.expirationMode.date')}
            </span>
          </label>
        </fieldset>

        {mode === 'date' ? (
          <div className="space-y-3">
            <div>
              <label
                htmlFor="manual-expiration-date"
                className="vui-form-field__label mb-1.5"
              >
                {t('rooms.members.management.access.manual.expirationDate')}
              </label>
              <input
                id="manual-expiration-date"
                className="min-h-11 w-full rounded-[var(--radius-control)] border border-rule bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-brick/60 focus:ring-2 focus:ring-brick/25"
                min={getTodayLocalDateString()}
                type="date"
                value={dateValue}
                onChange={(event) => setDateValue(event.currentTarget.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                type="button"
                variant="secondary"
                onClick={() => handlePreset(7)}
              >
                {t(
                  'rooms.members.management.access.manual.expirationPreset.days7',
                )}
              </Button>
              <Button
                size="sm"
                type="button"
                variant="secondary"
                onClick={() => handlePreset(30)}
              >
                {t(
                  'rooms.members.management.access.manual.expirationPreset.days30',
                )}
              </Button>
              <Button
                size="sm"
                type="button"
                variant="secondary"
                onClick={() => handlePreset(90)}
              >
                {t(
                  'rooms.members.management.access.manual.expirationPreset.days90',
                )}
              </Button>
            </div>
          </div>
        ) : null}
      </DialogBody>

      <DialogActions>
        <Button
          type="button"
          variant="tertiary"
          disabled={isSubmitting}
          onClick={onClose}
        >
          {t('rooms.members.access.custom.cancel')}
        </Button>
        <Button
          type="button"
          variant="primary"
          isLoading={isSubmitting}
          loadingLabel={t(
            action === 'restore'
              ? 'rooms.members.management.access.manual.restoring'
              : 'rooms.members.management.access.manual.setting',
          )}
          disabled={isSubmitDisabled}
          onClick={handleSubmit}
        >
          {t(confirmKey)}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export type { DialogAction };
