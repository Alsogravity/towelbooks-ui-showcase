import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  createChangePasswordSchema,
  type ChangePasswordForm,
} from '../../features/auth/authCopy';
import {
  applyApiValidationErrors,
  handleApiProblem,
} from '../../features/errors';
import { useI18n } from '../../i18n';
import { invalidateSession } from '../../lib/authSession';
import { sdk } from '../../lib/sdk';

export function useChangePasswordPageState() {
  const { t } = useI18n();
  const changePasswordSchema = createChangePasswordSchema(t);
  const [changePasswordServerError, setChangePasswordServerError] = useState<
    string | null
  >(null);

  const form = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmitChangePassword = async (data: ChangePasswordForm) => {
    setChangePasswordServerError(null);

    try {
      await sdk.users.me.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      form.reset();
      invalidateSession();
    } catch (submitError) {
      if (
        applyApiValidationErrors(submitError, form.setError, {
          currentPassword: 'currentPassword',
          newPassword: 'newPassword',
        }) > 0
      ) {
        return;
      }

      setChangePasswordServerError(
        handleApiProblem(submitError, {
          fallbackKey: 'settings.account.password.error.update',
          messageKeys: {
            AUTH_INVALID_CREDENTIALS:
              'settings.account.password.error.invalidCurrentPassword',
            AUTH_WEAK_PASSWORD: 'auth.errors.weakPassword',
          },
          t,
        }).message,
      );
    }
  };

  return {
    changePasswordServerError,
    form,
    handleChangePasswordSubmit: form.handleSubmit(onSubmitChangePassword),
  };
}
