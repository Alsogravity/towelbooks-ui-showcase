export type RoomSettingsRouteKey =
  'index' | 'general' | 'activity' | 'community';

const ROOM_SETTINGS_HASH_PREFIX = '#room-settings';

const VALID_ROUTE_KEYS = new Set<RoomSettingsRouteKey>([
  'index',
  'general',
  'activity',
  'community',
]);

export function parseRoomSettingsHash(
  hash: string,
): RoomSettingsRouteKey | null {
  if (hash === ROOM_SETTINGS_HASH_PREFIX) {
    return 'index';
  }

  if (!hash.startsWith(`${ROOM_SETTINGS_HASH_PREFIX}/`)) {
    return null;
  }

  const segment = hash.slice(`${ROOM_SETTINGS_HASH_PREFIX}/`.length);

  if (!segment || segment.includes('/')) {
    return null;
  }

  if (!VALID_ROUTE_KEYS.has(segment as RoomSettingsRouteKey)) {
    return null;
  }

  return segment as RoomSettingsRouteKey;
}

export function buildRoomSettingsHash(route: RoomSettingsRouteKey): string {
  if (route === 'index') {
    return ROOM_SETTINGS_HASH_PREFIX;
  }

  return `${ROOM_SETTINGS_HASH_PREFIX}/${route}`;
}

export function isRoomSettingsHashOpen(hash: string): boolean {
  return parseRoomSettingsHash(hash) !== null;
}

export function getDefaultRoomSettingsRoute(
  isDesktop: boolean,
): RoomSettingsRouteKey {
  return isDesktop ? 'general' : 'index';
}
