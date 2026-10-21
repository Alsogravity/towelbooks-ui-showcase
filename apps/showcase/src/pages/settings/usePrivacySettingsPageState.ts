import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type UpdatePrivacyPreferencesRequest } from '@towelbooks/schemas';
import { useState } from 'react';

import { createApiProblemToast } from '../../features/errors';
import {
  incomingFollowRequestsQueryKey,
  incomingFollowRequestsSummaryQueryKey,
} from '../../features/follow-requests/followRequestsQuery';
import { notificationQueryKeys } from '../../features/notifications/useNotifications';
import { privacyPreferencesQueryKey } from '../../features/privacy/privacyPreferencesQuery';
import { useI18n } from '../../i18n';
import { sdk } from '../../lib/sdk';
import { useAuth } from '../../features/auth/AuthContext';
import { useAnalyticsConsent } from '../../features/privacy/AnalyticsConsentContext';
import { useToast } from '../../components/feedback';

export type ConsentPreferenceField =
  'marketingEmailsOptIn' | 'productAnalyticsOptIn' | 'profileVisibility';

function buildPrivacyExportFilename(exportedAt: string): string {
  return `towelbooks-privacy-export-${exportedAt.replaceAll(':', '-')}.json`;
}

function triggerJsonDownload(filename: string, payload: unknown): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

export function usePrivacySettingsPageState() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { saveConsent } = useAnalyticsConsent();
  const { t } = useI18n();
  const { pushToast } = useToast();
  const [pendingConsentId, setPendingConsentId] =
    useState<ConsentPreferenceField | null>(null);
  const [
    pendingVisibilityConfirmationCount,
    setPendingVisibilityConfirmationCount,
  ] = useState<number | null>(null);

  const {
    data: preferences,
    error,
    isLoading,
    refetch,
  } = useQuery({
    enabled: user !== null,
    queryKey: privacyPreferencesQueryKey(user?.id ?? ''),
    queryFn: () => sdk.privacy.getPreferences(),
    retry: false,
  });

  const saveMutation = useMutation({
    mutationFn: (nextState: UpdatePrivacyPreferencesRequest) =>
      sdk.privacy.updatePreferences(nextState),
    onSuccess: async (updatedPreferences, nextState) => {
      if (user) {
        queryClient.setQueryData(
          privacyPreferencesQueryKey(user.id),
          updatedPreferences,
        );
      }

      if (typeof nextState.profileVisibility === 'string') {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['profiles'] }),
          queryClient.invalidateQueries({
            queryKey: incomingFollowRequestsQueryKey(),
          }),
          queryClient.invalidateQueries({
            queryKey: incomingFollowRequestsSummaryQueryKey(),
          }),
          queryClient.invalidateQueries({
            queryKey: notificationQueryKeys.list(),
          }),
          queryClient.invalidateQueries({
            queryKey: notificationQueryKeys.unreadCount(),
          }),
        ]);
      }

      if (typeof nextState.marketingEmailsOptIn === 'boolean') {
        pushToast({
          variant: 'success',
          title: t('settings.privacy.marketing.saved'),
        });
        return;
      }

      if (typeof nextState.profileVisibility === 'string') {
        pushToast({
          variant: 'success',
          title: t('settings.privacy.profileVisibility.saved'),
        });
      }
    },
    onError: (error: unknown) => {
      pushToast(
        createApiProblemToast(error, {
          fallbackKey: 'settings.privacy.error.save',
          messageKeys: {
            PROFILE_VISIBILITY_PENDING_FOLLOW_REQUESTS_CONFIRMATION_REQUIRED:
              'settings.privacy.profileVisibility.pendingRequests.error',
          },
          t,
        }),
      );
    },
  });

  const exportMutation = useMutation({
    mutationFn: () => sdk.users.me.exportPrivacyData(),
    onSuccess: (exportPayload) => {
      triggerJsonDownload(
        buildPrivacyExportFilename(exportPayload.exportedAt),
        exportPayload,
      );
      pushToast({
        variant: 'success',
        title: t('settings.privacy.export.saved'),
      });
    },
    onError: (error: unknown) => {
      pushToast(
        createApiProblemToast(error, {
          fallbackKey: 'settings.privacy.export.error.download',
          messageKeys: {
            RATE_LIMIT_EXCEEDED: 'settings.privacy.export.error.cooldown',
          },
          t,
        }),
      );
    },
  });

  const updateConsentPreference = async (
    field: ConsentPreferenceField,
    nextState: UpdatePrivacyPreferencesRequest,
  ) => {
    setPendingConsentId(field);
    let openedPendingVisibilityConfirmation = false;

    try {
      const isPrivateToPublicTransition =
        field === 'profileVisibility' &&
        preferences?.profileVisibility === 'private' &&
        nextState.profileVisibility === 'public';

      if (isPrivateToPublicTransition) {
        let summary;

        try {
          summary = await sdk.users.me.getFollowRequestsSummary();
        } catch (error) {
          pushToast(
            createApiProblemToast(error, {
              fallbackKey: 'settings.privacy.error.save',
              t,
            }),
          );
          return;
        }

        if (summary.pendingCount > 0) {
          openedPendingVisibilityConfirmation = true;
          setPendingVisibilityConfirmationCount(summary.pendingCount);
          return;
        }
      }

      if (typeof nextState.productAnalyticsOptIn === 'boolean') {
        try {
          const saved = await saveConsent(
            nextState.productAnalyticsOptIn ? 'granted' : 'denied',
          );
          pushToast({
            variant: saved ? 'success' : 'error',
            title: saved
              ? t('settings.privacy.analytics.saved')
              : t('settings.privacy.error.save'),
          });
        } catch (error) {
          pushToast(
            createApiProblemToast(error, {
              fallbackKey: 'settings.privacy.error.save',
              t,
            }),
          );
        }
        return;
      }
      await saveMutation.mutateAsync(nextState);
    } finally {
      if (!openedPendingVisibilityConfirmation) {
        setPendingConsentId((currentField) =>
          currentField === field ? null : currentField,
        );
      }
    }
  };

  const cancelPendingVisibilityConfirmation = () => {
    setPendingVisibilityConfirmationCount(null);
    setPendingConsentId((currentField) =>
      currentField === 'profileVisibility' ? null : currentField,
    );
  };

  const confirmPendingVisibilityChange = async () => {
    try {
      await saveMutation.mutateAsync({
        acceptPendingFollowRequests: true,
        profileVisibility: 'public',
      });
    } catch {
      // The mutation's onError handler presents the localized API problem.
    } finally {
      setPendingVisibilityConfirmationCount(null);
      setPendingConsentId((currentField) =>
        currentField === 'profileVisibility' ? null : currentField,
      );
    }
  };

  return {
    error,
    exportPrivacyData: () => {
      exportMutation.mutate();
    },
    isExportPending: exportMutation.isPending,
    isLoading,
    isVisibilityConfirmationPending: saveMutation.isPending,
    pendingConsentId,
    pendingVisibilityConfirmationCount,
    preferences,
    refetch,
    cancelPendingVisibilityConfirmation,
    confirmPendingVisibilityChange,
    updateConsentPreference,
  };
}
