import { Alert, Button } from '../../../components/primitives';
import { useI18n } from '../../../i18n';

export function LoginReactivationPanel({
  deleteAfterLabel,
  isReactivating,
  onDismiss,
  onReactivate,
  reactivateError,
}: {
  deleteAfterLabel: string | null;
  isReactivating: boolean;
  onDismiss: () => void;
  onReactivate: () => void;
  reactivateError: string | null;
}) {
  const { t } = useI18n();

  return (
    <div className="mb-6 space-y-3 rounded-2xl border border-ink/10 bg-paper p-4 text-center">
      <p className="font-medium text-ink">
        {t('auth.login.reactivate.heading')}
      </p>
      <p className="supporting-copy text-ink-2">
        {deleteAfterLabel
          ? t('auth.login.reactivate.bodyWithDate', {
              values: { deleteAfter: deleteAfterLabel },
            })
          : t('auth.login.reactivate.body')}
      </p>
      {reactivateError ? (
        <Alert variant="error">{reactivateError}</Alert>
      ) : null}
      <Button
        type="button"
        isLoading={isReactivating}
        loadingLabel={t('auth.login.reactivate.submitting')}
        onClick={onReactivate}
        className="w-full justify-center"
      >
        {t('auth.login.reactivate.confirm')}
      </Button>
      <Button
        type="button"
        variant="secondary"
        disabled={isReactivating}
        onClick={onDismiss}
        className="w-full justify-center"
      >
        {t('auth.login.reactivate.dismiss')}
      </Button>
    </div>
  );
}
