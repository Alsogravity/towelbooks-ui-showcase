import { Button } from '../../../../components/primitives';
import { useRoomSettingsNavigation } from '../../../../pages/rooms/settings/useRoomSettingsNavigation';

type RoomDetailSettingsLinkProps = {
  label: string;
};

export function RoomDetailSettingsLink({ label }: RoomDetailSettingsLinkProps) {
  const { openSettings } = useRoomSettingsNavigation();

  return (
    <Button
      onClick={openSettings}
      aria-label={label}
      className="shrink-0"
      icon="settings"
      size="sm"
      title={label}
      variant="icon"
    />
  );
}
