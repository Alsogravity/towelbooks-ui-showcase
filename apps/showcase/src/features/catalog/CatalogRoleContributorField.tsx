import { CONTRIBUTION_MAX_CONTRIBUTORS_PER_ROLE } from '@towelbooks/schemas';
import { useState } from 'react';

import { FilterSelectableOption } from '../../components/filters';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  Input,
} from '../../components/primitives';
import { useI18n } from '../../i18n';

export type CatalogRoleContributorFieldProps = {
  addLabel: string;
  dialogTitle: string;
  emptyMessage: string;
  id: string;
  inputLabel: string;
  inputPlaceholder: string;
  label: string;
  duplicateError: string;
  requiredError: string;
  values: readonly string[];
  onChange: (values: string[]) => void;
};

export function normalizeContributorDraftName(value: string): string {
  return value.trim().replace(/\s+/gu, ' ');
}

function contributorKey(value: string): string {
  return normalizeContributorDraftName(value).toLocaleLowerCase();
}

export function CatalogRoleContributorField({
  addLabel,
  dialogTitle,
  duplicateError,
  emptyMessage,
  id,
  inputLabel,
  inputPlaceholder,
  label,
  onChange,
  requiredError,
  values,
}: CatalogRoleContributorFieldProps) {
  const { t } = useI18n();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const labelId = `${id}-label`;

  const openDialog = () => {
    setDraftName('');
    setInputError(null);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setDraftName('');
    setInputError(null);
    setIsDialogOpen(false);
  };

  const addContributor = (close?: () => void) => {
    const normalizedName = normalizeContributorDraftName(draftName);

    if (!normalizedName) {
      setInputError(requiredError);
      return;
    }

    if (
      values.some(
        (value) => contributorKey(value) === contributorKey(normalizedName),
      )
    ) {
      setInputError(duplicateError);
      return;
    }

    onChange([...values, normalizedName]);
    setDraftName('');
    setInputError(null);
    if (close) {
      close();
    } else {
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      <fieldset className="space-y-1.5">
        <legend className="app-text-label text-ink" id={labelId}>
          {label}
        </legend>
        <div
          className="flex min-h-14 flex-wrap items-center gap-2 rounded-md border border-rule/60 p-3"
          id={id}
        >
          {values.map((value) => (
            <FilterSelectableOption
              isSelected
              key={`${contributorKey(value)}-${value}`}
              label={value}
              onToggle={() =>
                onChange(values.filter((candidate) => candidate !== value))
              }
            />
          ))}
          {values.length === 0 ? (
            <p className="app-text-metadata m-0 text-ink-3">{emptyMessage}</p>
          ) : null}
          <Button
            disabled={values.length >= CONTRIBUTION_MAX_CONTRIBUTORS_PER_ROLE}
            onClick={openDialog}
            size="sm"
            type="button"
            variant="secondary"
          >
            {addLabel}
          </Button>
        </div>
      </fieldset>

      {isDialogOpen ? (
        <Dialog
          closeButtonLabel={t('common.close')}
          onClose={closeDialog}
          showCloseButton
          size="sm"
          title={dialogTitle}
        >
          {({ close }) => (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                addContributor(close);
              }}
            >
              <DialogBody>
                <div className="space-y-1.5">
                  <label
                    className="app-text-label text-ink"
                    htmlFor={`${id}-name`}
                  >
                    {inputLabel}
                  </label>
                  <Input
                    autoComplete="off"
                    error={inputError ?? undefined}
                    id={`${id}-name`}
                    placeholder={inputPlaceholder}
                    value={draftName}
                    onChange={(event) => {
                      setDraftName(event.currentTarget.value);
                      setInputError(null);
                    }}
                  />
                </div>
              </DialogBody>
              <DialogActions>
                <Button onClick={() => close()} type="button" variant="ghost">
                  {t('common.cancel')}
                </Button>
                <Button type="submit">{addLabel}</Button>
              </DialogActions>
            </form>
          )}
        </Dialog>
      ) : null}
    </>
  );
}
