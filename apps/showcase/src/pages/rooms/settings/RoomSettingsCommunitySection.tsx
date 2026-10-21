import { Alert, Select } from '../../../components/primitives';
import { handleApiProblem } from '../../../features/errors';
import { useI18n } from '../../../i18n';
import { SettingsRowGroup } from '../../settings/ui/SettingsRowGroup';
import { SettingsSelectRow } from '../../settings/ui/SettingsSelectRow';

import type {
  CommunitySettings,
  UpdateCommunitySettingsRequest,
} from '@towelbooks/schemas';

export function RoomSettingsCommunitySection({
  communitySettings,
  isPending,
  mutationError,
  updateDiscussionCreatePolicy,
  updatePollCreatePolicy,
}: {
  communitySettings: CommunitySettings;
  isPending: boolean;
  mutationError: unknown;
  updateDiscussionCreatePolicy: (
    value: UpdateCommunitySettingsRequest['discussionCreatePolicy'],
  ) => void;
  updatePollCreatePolicy: (
    value: UpdateCommunitySettingsRequest['pollCreatePolicy'],
  ) => void;
}) {
  const { t } = useI18n();

  return (
    <section
      aria-label={t('rooms.settings.community.title')}
      className="space-y-4"
    >
      {mutationError ? (
        <Alert variant="error">
          {
            handleApiProblem(mutationError, {
              fallbackKey: 'rooms.settings.community.error.submit',
              t,
            }).message
          }
        </Alert>
      ) : null}

      <SettingsRowGroup>
        <SettingsSelectRow
          htmlFor="room-settings-discussion-create-policy"
          label={t('rooms.settings.community.discussionCreatePolicy.label')}
        >
          <Select
            disabled={isPending}
            id="room-settings-discussion-create-policy"
            matchActivatorWidth={false}
            value={communitySettings.discussionCreatePolicy}
            variant="ghost"
            onChange={(event) =>
              updateDiscussionCreatePolicy(
                event.target
                  .value as UpdateCommunitySettingsRequest['discussionCreatePolicy'],
              )
            }
          >
            <option value="members">
              {t('rooms.settings.community.discussionCreatePolicy.members')}
            </option>
            <option value="moderators">
              {t('rooms.settings.community.discussionCreatePolicy.moderators')}
            </option>
          </Select>
        </SettingsSelectRow>

        <SettingsSelectRow
          htmlFor="room-settings-poll-create-policy"
          label={t('rooms.settings.community.pollCreatePolicy.label')}
        >
          <Select
            disabled={isPending}
            id="room-settings-poll-create-policy"
            matchActivatorWidth={false}
            value={communitySettings.pollCreatePolicy}
            variant="ghost"
            onChange={(event) =>
              updatePollCreatePolicy(
                event.target
                  .value as UpdateCommunitySettingsRequest['pollCreatePolicy'],
              )
            }
          >
            <option value="members">
              {t('rooms.settings.community.pollCreatePolicy.members')}
            </option>
            <option value="moderators">
              {t('rooms.settings.community.pollCreatePolicy.moderators')}
            </option>
          </Select>
        </SettingsSelectRow>
      </SettingsRowGroup>
    </section>
  );
}
