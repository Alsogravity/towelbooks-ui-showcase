import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useToast } from '../../components/feedback';
import { useAuth } from '../../features/auth/AuthContext';
import type { LocaleMode } from '../../features/auth/types';
import { meQueryKey } from '../../features/auth/meQuery';
import { createApiProblemToast } from '../../features/errors';
import { type AppLocale, useI18n } from '../../i18n';
import { sdk } from '../../lib/sdk';

export type LocalePreferenceInput = {
  localeMode: LocaleMode;
  locale: AppLocale | null;
  lastResolvedLocale?: AppLocale | null;
};

export function usePreferencesPageState() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { updateUser, user } = useAuth();
  const { pushToast } = useToast();

  const { data: me, isLoading: isMeLoading } = useQuery({
    enabled: user !== null,
    queryKey: meQueryKey(user?.id ?? ''),
    queryFn: () => sdk.users.me.get(),
  });

  const updateLanguageMutation = useMutation({
    mutationFn: (input: LocalePreferenceInput) =>
      sdk.users.me.update({
        localeMode: input.localeMode,
        locale: input.locale,
        lastResolvedLocale: input.lastResolvedLocale,
      }),
    onSuccess: async (updatedMe) => {
      if (user) {
        queryClient.setQueryData(meQueryKey(user.id), updatedMe);
      }
      await queryClient.invalidateQueries({ queryKey: ['profiles'] });
      updateUser({
        avatar: updatedMe.avatar,
        authMethods: updatedMe.authMethods,
        bannerPresetId: updatedMe.bannerPresetId,
        bio: updatedMe.bio,
        defaultLibraryId: updatedMe.defaultLibraryId,
        displayName: updatedMe.displayName,
        email: updatedMe.email,
        id: updatedMe.id,
        locale: updatedMe.locale,
        localeMode: updatedMe.localeMode,
        lastResolvedLocale: updatedMe.lastResolvedLocale,
        username: updatedMe.username,
      });
    },
    onError: (error: unknown) => {
      pushToast(
        createApiProblemToast(error, {
          fallbackKey: 'settings.profile.error.save',
          t,
        }),
      );
    },
  });

  function updateLocale(input: LocalePreferenceInput) {
    updateLanguageMutation.mutate(input);
  }

  return {
    isMeLoading,
    me,
    updateLanguageMutation,
    updateLocale,
  };
}
