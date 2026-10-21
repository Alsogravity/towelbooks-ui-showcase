import { useMutation } from '@tanstack/react-query';
import {
  ApiRequestError,
  getApiErrorCode,
  getApiProblemDetails,
} from '@towelbooks/sdk';
import { useMemo, useState } from 'react';

import { useI18n } from '../../i18n';
import { sdk } from '../../lib/sdk';

const CONFIRMATION_PHRASE = 'EXCLUIR MINHA CONTA';

type OwnershipBlockDetails = {
  roomId?: string;
  roomName?: string;
  roomSlug?: string;
};

function getOwnershipBlockDetails(
  error: unknown,
): OwnershipBlockDetails | null {
  if (
    error instanceof ApiRequestError &&
    error.problem.code === 'ACCOUNT_DELETE_REQUIRES_ROOM_OWNERSHIP_TRANSFER'
  ) {
    return getApiProblemDetails<OwnershipBlockDetails>(error);
  }

  return null;
}

export function useDeleteAccountPageState({
  googleReauthSatisfied,
  hasLocalPassword,
}: {
  googleReauthSatisfied: boolean;
  hasLocalPassword: boolean;
}) {
  const { locale } = useI18n();
  const [confirmationPhrase, setConfirmationPhrase] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const reauthMutation = useMutation({
    mutationFn: () => sdk.auth.googleAccountDeletionReauthStart(),
    onSuccess: ({ redirectUrl }) => {
      window.location.assign(redirectUrl);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      sdk.users.me.delete({
        locale,
        ...(hasLocalPassword ? { password } : {}),
      }),
    onSuccess: (response) => {
      setSuccessMessage(response.message);
    },
  });

  const ownershipBlock = useMemo(
    () => getOwnershipBlockDetails(deleteMutation.error),
    [deleteMutation.error],
  );
  const requiresOwnershipTransfer =
    getApiErrorCode(deleteMutation.error) ===
    'ACCOUNT_DELETE_REQUIRES_ROOM_OWNERSHIP_TRANSFER';
  const requiresGoogleReauthentication =
    !hasLocalPassword &&
    (!googleReauthSatisfied ||
      getApiErrorCode(deleteMutation.error) ===
        'AUTH_REAUTHENTICATION_REQUIRED' ||
      getApiErrorCode(deleteMutation.error) === 'AUTH_REAUTH_STALE');

  return {
    canSubmit:
      confirmationPhrase.trim() === CONFIRMATION_PHRASE &&
      (hasLocalPassword
        ? password.length >= 12
        : googleReauthSatisfied && !reauthMutation.isPending),
    confirmationPhrase,
    deleteMutation,
    ownershipBlock,
    password,
    hasLocalPassword,
    googleReauthSatisfied,
    reauthMutation,
    requiresGoogleReauthentication,
    requiresOwnershipTransfer,
    startGoogleReauthentication: () => reauthMutation.mutate(),
    setConfirmationPhrase,
    setPassword,
    successMessage,
  };
}

export { CONFIRMATION_PHRASE };
