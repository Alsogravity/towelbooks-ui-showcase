import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';

import { demoLoginDefaults, enterDemo } from '../../../demo/auth';
import {
  createLoginSchema,
  type LoginForm,
} from '../../../features/auth/authCopy';
import { useI18n } from '../../../i18n';

// Preserve the original page's controller interface without service actions.
export function useLoginPageState() {
  const { t } = useI18n();
  const form = useForm<LoginForm>({
    defaultValues: demoLoginDefaults,
    resolver: zodResolver(createLoginSchema(t)),
  });
  const identifierValue = useWatch({
    control: form.control,
    name: 'identifier',
  });
  const unavailableAction = async () => {};

  return {
    deleteAfterLabel: null,
    forgotPasswordEmail: identifierValue.includes('@') ? identifierValue : null,
    form,
    handleLoginSubmit: form.handleSubmit(enterDemo),
    isReactivating: false,
    isResendCoolingDown: false,
    isResending: false,
    onDismissReactivation: unavailableAction,
    onReactivateAccount: unavailableAction,
    onResendVerificationEmail: unavailableAction,
    pendingReactivation: null,
    reactivateError: null,
    resendCooldownSecondsRemaining: 0,
    resendError: null,
    resendMessage: null,
    serverError: null,
    showRecoveryLink: false,
    verificationIdentifier: null,
  };
}
