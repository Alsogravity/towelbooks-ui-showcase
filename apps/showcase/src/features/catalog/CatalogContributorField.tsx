import type {
  ContributionContributor,
  ContributionContributorRole,
} from '@towelbooks/schemas';
import { CONTRIBUTION_MAX_CONTRIBUTORS } from '@towelbooks/schemas';
import { useState } from 'react';

import { FilterSelectableOption } from '../../components/filters';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  FormSelectField,
  FormTextField,
} from '../../components/primitives';
import { useI18n } from '../../i18n';

export type CatalogContributorFieldProps = {
  addLabel: string;
  dialogTitle: string;
  emptyMessage: string;
  id: string;
  inputLabel: string;
  inputPlaceholder: string;
  label: string;
  duplicateError: string;
  requiredError: string;
  roleLabel: string;
  roleOptions: readonly {
    label: string;
    value: ContributionContributorRole;
  }[];
  roleRequiredError: string;
  values: readonly ContributionContributor[];
  onChange: (values: ContributionContributor[]) => void;
};

export function normalizeContributorDraftName(value: string): string {
  return value.trim().replace(/\s+/gu, ' ');
}

function contributorKey(value: ContributionContributor): string {
  return `${normalizeContributorDraftName(value.name).toLocaleLowerCase()}:${value.role}`;
}

export function CatalogContributorField({
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
  roleLabel,
  roleOptions,
  roleRequiredError,
  values,
}: CatalogContributorFieldProps) {
  const { t } = useI18n();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftRole, setDraftRole] =
    useState<ContributionContributorRole | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);
  const labelId = `${id}-label`;

  const openDialog = () => {
    setDraftName('');
    setDraftRole(null);
    setInputError(null);
    setRoleError(null);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setDraftName('');
    setDraftRole(null);
    setInputError(null);
    setRoleError(null);
    setIsDialogOpen(false);
  };

  const addContributor = (close?: () => void) => {
    const normalizedName = normalizeContributorDraftName(draftName);

    if (!normalizedName) {
      setInputError(requiredError);
      return;
    }

    if (!draftRole) {
      setRoleError(roleRequiredError);
      return;
    }

    const contributor = { name: normalizedName, role: draftRole };
    if (
      values.some(
        (value) => contributorKey(value) === contributorKey(contributor),
      )
    ) {
      setInputError(duplicateError);
      return;
    }

    onChange([...values, contributor]);
    setDraftName('');
    setDraftRole(null);
    setInputError(null);
    setRoleError(null);
    if (close) {
      close();
    } else {
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      <fieldset aria-labelledby={labelId} className="space-y-1.5">
        <legend className="app-text-label flex w-full items-center justify-between gap-3 text-ink">
          <span id={labelId}>{label}</span>
          <Button
            className="shrink-0"
            disabled={values.length >= CONTRIBUTION_MAX_CONTRIBUTORS}
            onClick={openDialog}
            size="sm"
            type="button"
            variant="secondary"
          >
            {addLabel}
          </Button>
        </legend>
        <div
          className="flex min-h-14 flex-wrap items-center gap-2 rounded-md border border-rule/60 p-3 dark:border-night-fg/30"
          id={id}
        >
          {values.map((value, contributorIndex) => (
            <FilterSelectableOption
              appearance="removable-chip"
              isSelected
              key={`${contributorKey(value)}-${contributorIndex}`}
              label={`${value.name} · ${roleOptions.find((option) => option.value === value.role)?.label ?? value.role}`}
              onToggle={() =>
                onChange(
                  values.filter((_, index) => index !== contributorIndex),
                )
              }
            />
          ))}
          {values.length === 0 ? (
            <p className="app-text-metadata m-0 text-ink-3">{emptyMessage}</p>
          ) : null}
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
                <FormTextField
                  autoComplete="off"
                  error={inputError ?? undefined}
                  id={`${id}-name`}
                  label={inputLabel}
                  placeholder={inputPlaceholder}
                  value={draftName}
                  onChange={(event) => {
                    setDraftName(event.currentTarget.value);
                    setInputError(null);
                  }}
                />
                <FormSelectField
                  error={roleError ?? undefined}
                  id={`${id}-role`}
                  label={roleLabel}
                  onChange={(event) => {
                    const nextRole = event.currentTarget.value;
                    setDraftRole(
                      nextRole
                        ? (nextRole as ContributionContributorRole)
                        : null,
                    );
                    setRoleError(null);
                  }}
                  aria-required="true"
                  value={draftRole ?? ''}
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </FormSelectField>
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
