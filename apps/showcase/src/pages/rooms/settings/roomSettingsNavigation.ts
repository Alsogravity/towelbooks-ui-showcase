import { matchPath } from 'react-router';

import type { IconName } from '../../../components/primitives';

export type RoomSettingsSectionKey = 'general' | 'activity' | 'community';

export type RoomSettingsSection = {
  key: RoomSettingsSectionKey;
  iconName: IconName;
  labelKey: string;
};

const sectionKeys: readonly RoomSettingsSectionKey[] = [
  'general',
  'activity',
  'community',
];

const sectionIcons: Record<RoomSettingsSectionKey, IconName> = {
  general: 'settings-2',
  activity: 'activity',
  community: 'message-square',
};

export function getRoomSettingsSections(): RoomSettingsSection[] {
  return sectionKeys.map((key) => ({
    key,
    iconName: sectionIcons[key],
    labelKey: `rooms.settings.nav.${key}`,
  }));
}

export function getActiveRoomSettingsSection(
  pathname: string,
): RoomSettingsSectionKey | null {
  const match = matchPath('/rooms/:roomId/settings/:section', pathname);
  const section = match?.params.section;

  return sectionKeys.find((key) => key === section) ?? null;
}
