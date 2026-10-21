import { Alert, Button } from '../../../components/primitives';
import { useI18n } from '../../../i18n';

export function LoginVerificationPanel({
  isResendCoolingDown,
  isResending,
  onResendVerificationEmail,
  resendCooldownSecondsRemaining,
  resendError,
  resendMessage,
}: {
  isResendCoolingDown: boolean;
  isResending: boolean;
  onResendVerificationEmail: () => void;
  resendCooldownSecondsRemaining: number;
  resendError: string | null;
  resendMessage: string | null;
}) {
  const { t } = useI18n();

  return (
    <div className="mb-6 space-y-3 rounded-2xl border border-ink/10 bg-paper p-4 text-center">
      <p className="font-medium text-ink">
        {t('auth.login.verifyEmail.heading')}
      </p>
      <p className="supporting-copy text-ink-2">
        {t('auth.login.verifyEmail.body')}
      </p>
      {resendMessage ? <Alert variant="success">{resendMessage}</Alert> : null}
      {resendError ? <Alert variant="error">{resendError}</Alert> : null}
      <Button
        type="button"
        disabled={isResendCoolingDown}
        isLoading={isResending}
        loadingLabel={t('auth.verificationResend.submitting')}
        onClick={onResendVerificationEmail}
        className="w-full justify-center"
      >
        {t('auth.verificationResend.action')}
      </Button>
      {resendCooldownSecondsRemaining > 0 ? (
        <p className="supporting-copy text-ink-2" role="status">
          {t('auth.verificationResend.cooldown', {
            values: { seconds: resendCooldownSecondsRemaining },
          })}
        </p>
      ) : null}
    </div>
  );
}
