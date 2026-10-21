import type { SettingsSectionKey } from '../../pages/settings/settingsNavigation';

export type SettingsRouteKey =
  | 'index'
  | 'account'
  | 'preferences'
  | 'notifications'
  | 'privacy'
  | 'change-password'
  | 'set-password'
  | 'delete-account';

const SETTINGS_HASH_PREFIX = '#settings';

const VALID_ROUTE_KEYS = new Set<SettingsRouteKey>([
  'index',
  'account',
  'preferences',
  'notifications',
  'privacy',
  'change-password',
  'delete-account',
  'set-password',
]);

const TOP_LEVEL_NAV_ROUTES = new Set<SettingsRouteKey>([
  'index',
  'account',
  'preferences',
  'notifications',
  'privacy',
]);

export function parseSettingsHash(hash: string): SettingsRouteKey | null {
  if (hash === SETTINGS_HASH_PREFIX) {
    return 'index';
  }

  if (!hash.startsWith(`${SETTINGS_HASH_PREFIX}/`)) {
    return null;
  }

  const segment = hash.slice(`${SETTINGS_HASH_PREFIX}/`.length);

  if (!segment || segment.includes('/')) {
    return null;
  }

  if (!VALID_ROUTE_KEYS.has(segment as SettingsRouteKey)) {
    return null;
  }

  return segment as SettingsRouteKey;
}

export function buildSettingsHash(route: SettingsRouteKey): string {
  if (route === 'index') {
    return SETTINGS_HASH_PREFIX;
  }

  return `${SETTINGS_HASH_PREFIX}/${route}`;
}

export function isSettingsHashOpen(hash: string): boolean {
  return parseSettingsHash(hash) !== null;
}

export function getActiveNavSection(
  route: SettingsRouteKey,
): SettingsSectionKey {
  if (route === 'preferences') {
    return 'preferences';
  }

  if (route === 'notifications') {
    return 'notifications';
  }

  if (route === 'privacy') {
    return 'privacy';
  }

  return 'account';
}

export function isTopLevelSettingsRoute(route: SettingsRouteKey): boolean {
  return TOP_LEVEL_NAV_ROUTES.has(route);
}

export function getDefaultSettingsRoute(isDesktop: boolean): SettingsRouteKey {
  return isDesktop ? 'account' : 'index';
}
