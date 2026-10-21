import { ErrorState } from '../../../components/feedback';

export function RoomSettingsForbidden() {
  return (
    <ErrorState
      icon="lock"
      title={{
        key: 'rooms.settings.error.forbiddenTitle',
        fallback: 'Restricted access',
      }}
      body={{
        key: 'rooms.settings.error.forbiddenBody',
        fallback: 'You do not have permission to manage this room.',
      }}
    />
  );
}
