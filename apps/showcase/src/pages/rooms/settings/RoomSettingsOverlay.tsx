import { RoomSettingsContext } from './roomSettingsContext';
import { RoomSettingsIndexPage } from './RoomSettingsIndexPage';
import { RoomSettingsGeneralPage } from './RoomSettingsGeneralPage';
import { RoomSettingsActivityPage } from './RoomSettingsActivityPage';
import { RoomSettingsCommunityPage } from './RoomSettingsCommunityPage';
import { RoomSettingsForbidden } from './RoomSettingsForbidden';
import { SettingsModalShell } from '../../../features/settings/SettingsModalShell';
import { useRoomSettingsNavigation } from './useRoomSettingsNavigation';
import { RoomSettingsMobilePanel } from './RoomSettingsMobilePanel';
import { RoomSettingsNav } from './RoomSettingsNav';
import { useI18n, resolveLocalizedText } from '../../../i18n';
import type { RoomDetail } from '../../../features/rooms/types';

export function RoomSettingsOverlay({
  canManageRoom,
  room,
  roomId,
}: {
  canManageRoom: boolean;
  room: RoomDetail;
  roomId: string;
}) {
  const { currentRoute, closeSettings, presentation } =
    useRoomSettingsNavigation();
  const { t } = useI18n();

  if (!currentRoute) {
    return null;
  }

  const contextValue = { room, roomId };
  const titleId = 'room-settings-title';
  const title = resolveLocalizedText(
    { key: 'page.rooms.settings.fallbackTitle' },
    t,
  );

  const content = canManageRoom ? (
    <RoomSettingsContext.Provider value={contextValue}>
      {renderContent(currentRoute)}
    </RoomSettingsContext.Provider>
  ) : (
    <RoomSettingsForbidden />
  );

  if (presentation === 'modal') {
    return (
      <SettingsModalShell
        title={title}
        titleId={titleId}
        onClose={closeSettings}
        closeLabel={t('common.close')}
        nav={canManageRoom ? <RoomSettingsNav /> : null}
      >
        {content}
      </SettingsModalShell>
    );
  }

  return <RoomSettingsMobilePanel>{content}</RoomSettingsMobilePanel>;
}

function renderContent(route: string) {
  switch (route) {
    case 'index':
      return <RoomSettingsIndexPage />;
    case 'general':
      return <RoomSettingsGeneralPage />;
    case 'activity':
      return <RoomSettingsActivityPage />;
    case 'community':
      return <RoomSettingsCommunityPage />;
    default:
      return null;
  }
}
