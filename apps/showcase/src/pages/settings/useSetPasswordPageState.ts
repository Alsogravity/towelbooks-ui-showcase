import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  createSetPasswordSchema,
  type SetPasswordForm,
} from '../../features/auth/authCopy';
import {
  applyApiValidationErrors,
  handleApiProblem,
} from '../../features/errors';
import { useI18n } from '../../i18n';
import { invalidateSession } from '../../lib/authSession';
import { sdk } from '../../lib/sdk';

export function useSetPasswordPageState() {
  const { t } = useI18n();
  const setPasswordSchema = createSetPasswordSchema(t);
  const [setPasswordServerError, setSetPasswordServerError] = useState<
    string | null
  >(null);

  const form = useForm<SetPasswordForm>({
    resolver: zodResolver(setPasswordSchema),
  });

  const onSubmitSetPassword = async (data: SetPasswordForm) => {
    setSetPasswordServerError(null);

    try {
      await sdk.users.me.changePassword({
        newPassword: data.newPassword,
      });
      form.reset();
      invalidateSession();
    } catch (submitError) {
      if (
        applyApiValidationErrors(submitError, form.setError, {
          newPassword: 'newPassword',
        }) > 0
      ) {
        return;
      }

      setSetPasswordServerError(
        handleApiProblem(submitError, {
          fallbackKey: 'settings.account.setPassword.error.update',
          messageKeys: {
            AUTH_WEAK_PASSWORD: 'auth.errors.weakPassword',
          },
          t,
        }).message,
      );
    }
  };

  return {
    form,
    handleSetPasswordSubmit: form.handleSubmit(onSubmitSetPassword),
    setPasswordServerError,
  };
}
