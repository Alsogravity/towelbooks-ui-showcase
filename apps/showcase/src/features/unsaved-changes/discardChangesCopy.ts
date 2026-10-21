/**
 * Shared i18n keys for the discard-unsaved-changes dialog.
 * Forms may override individual keys via `copy` on the dialog/guard.
 */
export type DiscardChangesCopyKeys = {
  title: string;
  body: string;
  confirm: string;
  cancel: string;
};

export const DEFAULT_DISCARD_CHANGES_COPY = {
  title: 'common.unsavedChanges.title',
  body: 'common.unsavedChanges.body',
  confirm: 'common.unsavedChanges.confirm',
  cancel: 'common.unsavedChanges.cancel',
} as const satisfies DiscardChangesCopyKeys;
