import { useQuery } from '@tanstack/react-query';

import { defaultActivityVisibility } from './roomSettingsActivity';
import { RoomSettingsActivitySection } from './RoomSettingsActivitySection';
import { useRoomSettingsContext } from './roomSettingsContext';
import { useRoomActivityPreferencesMutation } from './useRoomSettingsMutations';
import { LoadingState } from '../../../components/feedback';
import { Alert, Button } from '../../../components/primitives';
import { handleApiProblem } from '../../../features/errors';
import { useI18n } from '../../../i18n';
import { sdk } from '../../../lib/sdk';
import { SettingsSectionPageHeader } from '../../settings/ui/SettingsSectionPageHeader';

export function RoomSettingsActivityPage() {
  const { roomId } = useRoomSettingsContext();
  const { t } = useI18n();

  const preferencesQuery = useQuery({
    queryKey: ['rooms', roomId, 'activity-feed-preferences'],
    queryFn: () => sdk.activityEvents.getRoomPreferences(roomId),
  });

  const { updatePreferences, updatePreferencesMutation } =
    useRoomActivityPreferencesMutation(roomId);

  const preferenceByType = new Map(
    (preferencesQuery.data?.items ?? []).map((preference) => [
      preference.activityType,
      preference.visible,
    ]),
  );

  const getPreferenceVisible = (
    activityType: keyof typeof defaultActivityVisibility,
  ) =>
    preferenceByType.get(activityType) ??
    defaultActivityVisibility[activityType];

  return (
    <div className="space-y-8">
      <SettingsSectionPageHeader
        title={t('rooms.settings.activity.title')}
        description={t('rooms.settings.activity.description')}
      />

      {preferencesQuery.isLoading ? (
        <LoadingState
          label={{
            key: 'rooms.settings.loading',
            fallback: 'Opening room settings...',
          }}
        />
      ) : preferencesQuery.error ? (
        <div className="space-y-4">
          <Alert variant="error">
            {
              handleApiProblem(preferencesQuery.error, {
                fallbackKey: 'rooms.settings.activity.error.loadTitle',
                t,
              }).message
            }
          </Alert>
          <Button
            variant="secondary"
            onClick={() => void preferencesQuery.refetch()}
          >
            {t('errors.action.retry')}
          </Button>
        </div>
      ) : (
        <RoomSettingsActivitySection
          getPreferenceVisible={getPreferenceVisible}
          isPending={updatePreferencesMutation.isPending}
          mutationError={updatePreferencesMutation.error}
          updatePreferences={updatePreferences}
        />
      )}
    </div>
  );
}
