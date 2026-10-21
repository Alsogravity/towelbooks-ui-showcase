import { getApiErrorCode, getApiErrorMessage } from '@towelbooks/sdk';

import { PageSection } from '../../components/layout';
import { Alert, Button } from '../../components/primitives';
import { handleApiProblem } from '../../features/errors';
import { useI18n } from '../../i18n';
import { CONFIRMATION_PHRASE } from './useDeleteAccountPageState';

type DeleteAccountConfirmationSectionProps = {
  canSubmit: boolean;
  confirmationPhrase: string;
  deleteError: unknown;
  googleReauthSatisfied: boolean;
  hasLocalPassword: boolean;
  isDeleting: boolean;
  isReauthenticating: boolean;
  reauthError: unknown;
  onConfirmationPhraseChange: (nextValue: string) => void;
  onDelete: () => void;
  onPasswordChange: (nextValue: string) => void;
  onReauthenticate: () => void;
  ownershipBlock?: { roomName?: string } | null;
  password: string;
  requiresOwnershipTransfer: boolean;
  successMessage: string | null;
};

export function DeleteAccountConfirmationSection({
  canSubmit,
  confirmationPhrase,
  deleteError,
  googleReauthSatisfied,
  hasLocalPassword,
  isDeleting,
  isReauthenticating,
  reauthError,
  onConfirmationPhraseChange,
  onDelete,
  onPasswordChange,
  onReauthenticate,
  ownershipBlock,
  password,
  requiresOwnershipTransfer,
  successMessage,
}: DeleteAccountConfirmationSectionProps) {
  const { t } = useI18n();

  return (
    <PageSection
      className="rounded-xl border border-brick bg-brick-soft/40 px-5 py-6 sm:px-6"
      spacing="compact"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="section-title text-ink">
            {t('settings.delete.confirm.title')}
          </h2>
          <p className="supporting-copy text-ink-2">
            {t('settings.delete.confirm.description.before')}
            <span className="font-semibold text-ink">
              {CONFIRMATION_PHRASE}
            </span>
            {t('settings.delete.confirm.description.after')}
          </p>
        </div>

        <div>
          <label
            className="label mb-1 block text-ink"
            htmlFor="delete-account-confirmation"
          >
            {t('settings.delete.confirm.label')}
          </label>
          <input
            className="w-full rounded-md border border-rule bg-vellum px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brick"
            id="delete-account-confirmation"
            onChange={(event) => onConfirmationPhraseChange(event.target.value)}
            type="text"
            value={confirmationPhrase}
          />
        </div>
        {hasLocalPassword ? (
          <div>
            <label
              className="label mb-1 block text-ink"
              htmlFor="delete-account-password"
            >
              {t('settings.delete.confirm.passwordLabel')}
            </label>
            <input
              autoComplete="current-password"
              className="w-full rounded-md border border-rule bg-vellum px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brick"
              id="delete-account-password"
              onChange={(event) => onPasswordChange(event.target.value)}
              type="password"
              value={password}
            />
            <p className="mt-2 text-xs leading-5 text-ink-3">
              {t('settings.delete.confirm.passwordHint')}
            </p>
          </div>
        ) : (
          <div className="space-y-3 rounded-lg border border-rule bg-paper px-4 py-4">
            <p className="text-sm leading-6 text-ink-2">
              {t('settings.delete.confirm.googleReauthHint')}
            </p>
            <Button
              type="button"
              variant="secondary"
              isLoading={isReauthenticating}
              loadingLabel={t('settings.delete.confirm.googleReauthSubmitting')}
              onClick={onReauthenticate}
            >
              {t('settings.delete.confirm.googleReauth')}
            </Button>
            {googleReauthSatisfied ? (
              <p className="text-sm text-ink-2" role="status">
                {t('settings.delete.confirm.googleReauthComplete')}
              </p>
            ) : null}
          </div>
        )}

        {reauthError ? (
          <Alert variant="error">
            {
              handleApiProblem(reauthError, {
                fallbackKey: 'settings.delete.error.googleReauthRequired',
                t,
              }).message
            }
          </Alert>
        ) : null}

        {successMessage && <Alert variant="success">{successMessage}</Alert>}

        {requiresOwnershipTransfer ? (
          <Alert variant="warning">
            {ownershipBlock?.roomName ? (
              <p>
                {t('settings.delete.error.transferOwnershipOf.before')}
                <span className="font-medium text-ink">
                  {ownershipBlock.roomName}
                </span>{' '}
                {t('settings.delete.error.transferOwnershipOf.after')}
              </p>
            ) : null}
            <p className={ownershipBlock?.roomName ? 'mt-2' : undefined}>
              {getApiErrorMessage(
                deleteError,
                t('settings.delete.error.transferOwnership'),
              )}
            </p>
          </Alert>
        ) : null}

        {deleteError && !requiresOwnershipTransfer ? (
          <Alert variant="error">
            {
              handleApiProblem(deleteError, {
                fallbackKey: 'settings.delete.error.deleteNow',
                messageKeys: {
                  AUTH_INVALID_CREDENTIALS:
                    'settings.delete.error.invalidPassword',
                  AUTH_REAUTHENTICATION_REQUIRED:
                    'settings.delete.error.googleReauthRequired',
                  AUTH_REAUTH_STALE:
                    'settings.delete.error.googleReauthRequired',
                },
                t,
              }).message
            }
          </Alert>
        ) : null}

        {getApiErrorCode(deleteError) === 'AUTH_REAUTHENTICATION_REQUIRED' ||
        getApiErrorCode(deleteError) === 'AUTH_REAUTH_STALE' ? (
          <p className="text-sm text-ink-2">
            {t('settings.delete.confirm.googleReauthHint')}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
          <Button
            className="w-full lg:w-auto"
            variant="danger"
            disabled={!canSubmit}
            isLoading={isDeleting}
            loadingLabel={t('settings.delete.deleting')}
            onClick={onDelete}
            type="button"
          >
            {t('settings.delete.delete')}
          </Button>
        </div>
      </div>
    </PageSection>
  );
}
