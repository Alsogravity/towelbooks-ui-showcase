import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { useToast } from '../../components/feedback';
import { useAuth } from '../../features/auth/AuthContext';
import { meQueryKey } from '../../features/auth/meQuery';
import { createApiProblemToast } from '../../features/errors';
import { useI18n } from '../../i18n';
import { sdk } from '../../lib/sdk';

import type {
  LegalAcceptanceSelection,
  RequiredLegalAcceptance,
  RequiredLegalAcceptanceType,
} from '@towelbooks/schemas';

function toAcceptanceSelection(
  acceptance: RequiredLegalAcceptance,
): LegalAcceptanceSelection {
  if (acceptance.type === 'adult_attestation') {
    return { type: acceptance.type };
  }

  if (!acceptance.legalDocument) {
    throw new Error('Required legal document metadata is unavailable.');
  }

  return {
    type: acceptance.type,
    version: acceptance.legalDocument.version,
  };
}

export function useLegalUpdatesPageState() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, setHasPendingLegalAcceptances } = useAuth();
  const { t } = useI18n();
  const { pushToast } = useToast();
  const [selectedTypes, setSelectedTypes] = useState<
    Partial<Record<RequiredLegalAcceptanceType, boolean>>
  >({});

  const {
    data: me,
    error,
    isLoading,
    refetch,
  } = useQuery({
    enabled: user !== null,
    queryFn: () => sdk.users.me.get(),
    queryKey: meQueryKey(user?.id ?? ''),
    retry: false,
  });

  const pendingAcceptances = useMemo(
    () => me?.requiredLegalAcceptances ?? [],
    [me],
  );
  const allSelected = pendingAcceptances.every(
    (acceptance) => selectedTypes[acceptance.type] === true,
  );
  const selectedPendingTypes = useMemo(
    () =>
      pendingAcceptances.flatMap((acceptance) =>
        selectedTypes[acceptance.type]
          ? [toAcceptanceSelection(acceptance)]
          : [],
      ),
    [pendingAcceptances, selectedTypes],
  );

  const acceptMutation = useMutation({
    mutationFn: (acceptances: LegalAcceptanceSelection[]) =>
      sdk.users.me.acceptLegalDocuments({ acceptances }),
    onSuccess: (updatedUser) => {
      if (user) {
        queryClient.setQueryData(meQueryKey(user.id), updatedUser);
      }
      setHasPendingLegalAcceptances(false);
      pushToast({
        title: t('settings.legalUpdates.saved'),
        variant: 'success',
      });
      navigate('/', { replace: true });
    },
    onError: (mutationError: unknown) => {
      pushToast(
        createApiProblemToast(mutationError, {
          fallbackKey: 'settings.legalUpdates.error.save',
          t,
        }),
      );
    },
  });

  function setAcceptanceSelected(
    type: RequiredLegalAcceptanceType,
    checked: boolean,
  ) {
    setSelectedTypes((current) => ({
      ...current,
      [type]: checked,
    }));
  }

  function submitAcceptances() {
    if (selectedPendingTypes.length === 0) {
      return;
    }

    void acceptMutation.mutateAsync(selectedPendingTypes);
  }

  return {
    acceptMutation,
    allSelected,
    error,
    isLoading,
    me,
    pendingAcceptances,
    refetch,
    selectedTypes,
    setAcceptanceSelected,
    submitAcceptances,
  };
}
