import {
  roomActivityRows,
  type ConfigurableActivityType,
} from './roomSettingsActivity';
import { Alert } from '../../../components/primitives';
import { handleApiProblem } from '../../../features/errors';
import { useI18n } from '../../../i18n';
import { SettingsRowGroup } from '../../settings/ui/SettingsRowGroup';
import { SettingsSwitch } from '../../settings/ui/SettingsSwitch';

export function RoomSettingsActivitySection({
  getPreferenceVisible,
  isPending,
  mutationError,
  updatePreferences,
}: {
  getPreferenceVisible: (activityType: ConfigurableActivityType) => boolean;
  isPending: boolean;
  mutationError: unknown;
  updatePreferences: (
    preferences: Array<{
      activityType: ConfigurableActivityType;
      visible: boolean;
    }>,
  ) => Promise<unknown>;
}) {
  const { t } = useI18n();

  return (
    <section
      aria-label={t('rooms.settings.activity.title')}
      className="space-y-4"
    >
      {mutationError ? (
        <Alert variant="error">
          {
            handleApiProblem(mutationError, {
              fallbackKey: 'rooms.settings.activity.error.submit',
              t,
            }).message
          }
        </Alert>
      ) : null}

      <SettingsRowGroup>
        {roomActivityRows.map((activityType) => (
          <SettingsSwitch
            key={activityType}
            id={`room-settings-activity-${activityType.replaceAll('.', '-')}`}
            checked={getPreferenceVisible(activityType)}
            disabled={isPending}
            label={t(`rooms.settings.activity.rows.${activityType}`)}
            onChange={(checked) =>
              updatePreferences([{ activityType, visible: checked }])
            }
          />
        ))}
      </SettingsRowGroup>
    </section>
  );
}
