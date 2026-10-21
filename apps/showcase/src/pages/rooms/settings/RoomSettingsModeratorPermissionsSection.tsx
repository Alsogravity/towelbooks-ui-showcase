import { Alert } from '../../../components/primitives';
import { handleApiProblem } from '../../../features/errors';
import { useI18n } from '../../../i18n';
import { SettingsRowGroup } from '../../settings/ui/SettingsRowGroup';
import { SettingsSwitch } from '../../settings/ui/SettingsSwitch';
import {
  useRoomRoleCapabilities,
  useUpdateRoomRoleCapabilities,
} from '../../../features/rooms/join/useRoomRoleCapabilities';

export function RoomSettingsModeratorPermissionsSection({
  roomId,
}: {
  roomId: string;
}) {
  const { t } = useI18n();
  const capabilitiesQuery = useRoomRoleCapabilities(roomId);
  const updateMutation = useUpdateRoomRoleCapabilities(roomId);

  if (capabilitiesQuery.isLoading) {
    return null;
  }

  if (capabilitiesQuery.isError || !capabilitiesQuery.data) {
    return (
      <Alert variant="error">
        {
          handleApiProblem(capabilitiesQuery.error, {
            fallbackKey: 'rooms.settings.moderatorPermissions.error.load',
            t,
          }).message
        }
      </Alert>
    );
  }

  const canReviewJoinRequests = capabilitiesQuery.data.capabilities.includes(
    'join_requests_review',
  );
  const showJoinPolicyControls =
    capabilitiesQuery.data.joinPolicy === 'request_to_join';

  if (!showJoinPolicyControls) {
    return null;
  }

  const handleToggle = (checked: boolean) => {
    const nextCapabilities = checked ? ['join_requests_review' as const] : [];
    updateMutation.mutate({
      role: 'moderator',
      capabilities: nextCapabilities,
    });
  };

  return (
    <section
      aria-label={t('rooms.settings.moderatorPermissions.title')}
      className="space-y-4"
    >
      {updateMutation.isError ? (
        <Alert variant="error">
          {
            handleApiProblem(updateMutation.error, {
              fallbackKey: 'rooms.settings.moderatorPermissions.error.submit',
              t,
            }).message
          }
        </Alert>
      ) : null}

      <SettingsRowGroup>
        <SettingsSwitch
          checked={canReviewJoinRequests}
          disabled={updateMutation.isPending}
          id="room-settings-moderator-join-requests-review"
          label={t('rooms.settings.moderatorPermissions.joinRequestsReview')}
          onChange={handleToggle}
        />
      </SettingsRowGroup>
    </section>
  );
}
