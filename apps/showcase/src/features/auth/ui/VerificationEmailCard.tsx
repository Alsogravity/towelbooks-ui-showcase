import { Alert, Button } from '../../../components/primitives';
import { useI18n } from '../../../i18n';

import type { ReactNode } from 'react';

type VerificationEmailCardProps = {
  bodyKey: string;
  canResendVerificationEmail: boolean;
  footerAction: ReactNode;
  isResending: boolean;
  onResendVerificationEmail: () => void;
  resendCooldownSecondsRemaining: number;
  resendError: string | null;
  resendMessage: string | null;
};

export function VerificationEmailCard({
  bodyKey,
  canResendVerificationEmail,
  footerAction,
  isResending,
  onResendVerificationEmail,
  resendCooldownSecondsRemaining,
  resendError,
  resendMessage,
}: VerificationEmailCardProps) {
  const { t } = useI18n();
  const isResendCoolingDown = resendCooldownSecondsRemaining > 0;

  return (
    <div key="success" className="text-center">
      <h2 className="app-text-dialog-title mb-4 text-ink">
        {t('auth.register.successHeading')}
      </h2>
      <p className="supporting-copy mb-6 text-ink-2">{t(bodyKey)}</p>
      {canResendVerificationEmail && (
        <div className="mb-6 space-y-3">
          {resendMessage && <Alert variant="success">{resendMessage}</Alert>}
          {resendError && <Alert variant="error">{resendError}</Alert>}
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
          {resendCooldownSecondsRemaining > 0 && (
            <p className="supporting-copy text-ink-2" role="status">
              {t('auth.verificationResend.cooldown', {
                values: { seconds: resendCooldownSecondsRemaining },
              })}
            </p>
          )}
        </div>
      )}
      {footerAction}
    </div>
  );
}
