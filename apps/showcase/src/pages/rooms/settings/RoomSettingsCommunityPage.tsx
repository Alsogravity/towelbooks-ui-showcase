import { useQuery } from '@tanstack/react-query';

import { RoomSettingsCommunitySection } from './RoomSettingsCommunitySection';
import { useRoomSettingsContext } from './roomSettingsContext';
import { useRoomCommunitySettingsMutation } from './useRoomSettingsMutations';
import { LoadingState } from '../../../components/feedback';
import { Alert, Button } from '../../../components/primitives';
import { handleApiProblem } from '../../../features/errors';
import { useI18n } from '../../../i18n';
import { sdk } from '../../../lib/sdk';
import { SettingsSectionPageHeader } from '../../settings/ui/SettingsSectionPageHeader';

export function RoomSettingsCommunityPage() {
  const { roomId } = useRoomSettingsContext();
  const { t } = useI18n();

  const communitySettingsQuery = useQuery({
    queryKey: ['rooms', roomId, 'community', 'settings'],
    queryFn: () => sdk.community.getSettings(roomId),
  });

  const updateCommunitySettingsMutation =
    useRoomCommunitySettingsMutation(roomId);

  return (
    <div className="space-y-8">
      <SettingsSectionPageHeader
        title={t('rooms.settings.community.title')}
        description={t('rooms.settings.community.description')}
      />

      {communitySettingsQuery.isLoading ? (
        <LoadingState
          label={{
            key: 'rooms.settings.loading',
            fallback: 'Opening room settings...',
          }}
        />
      ) : communitySettingsQuery.error || !communitySettingsQuery.data ? (
        <div className="space-y-4">
          <Alert variant="error">
            {
              handleApiProblem(communitySettingsQuery.error, {
                fallbackKey: 'rooms.settings.community.error.loadTitle',
                t,
              }).message
            }
          </Alert>
          <Button
            variant="secondary"
            onClick={() => void communitySettingsQuery.refetch()}
          >
            {t('errors.action.retry')}
          </Button>
        </div>
      ) : (
        <RoomSettingsCommunitySection
          communitySettings={communitySettingsQuery.data}
          isPending={updateCommunitySettingsMutation.isPending}
          mutationError={updateCommunitySettingsMutation.error}
          updateDiscussionCreatePolicy={(value) =>
            updateCommunitySettingsMutation.mutate({
              discussionCreatePolicy: value,
            })
          }
          updatePollCreatePolicy={(value) =>
            updateCommunitySettingsMutation.mutate({
              pollCreatePolicy: value,
            })
          }
        />
      )}
    </div>
  );
}
