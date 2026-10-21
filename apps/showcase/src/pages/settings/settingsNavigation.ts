import type { IconName } from '../../components/primitives';
import type { SettingsRouteKey } from '../../features/settings/settingsHash';

export type SettingsSectionKey =
  'account' | 'preferences' | 'notifications' | 'privacy';

export type SettingsSection = {
  key: SettingsSectionKey;
  route: SettingsRouteKey;
  iconName: IconName;
  labelKey: string;
};

export const settingsSections: SettingsSection[] = [
  {
    key: 'account',
    route: 'account',
    iconName: 'user-round-cog',
    labelKey: 'settings.nav.account',
  },
  {
    key: 'preferences',
    route: 'preferences',
    iconName: 'settings-2',
    labelKey: 'settings.nav.preferences',
  },
  {
    key: 'notifications',
    route: 'notifications',
    iconName: 'bell',
    labelKey: 'settings.nav.notifications',
  },
  {
    key: 'privacy',
    route: 'privacy',
    iconName: 'file-text',
    labelKey: 'settings.nav.privacy',
  },
];

export function getActiveSettingsSection(
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

export type SettingsSubrouteConfig = {
  backAriaLabelKey: string;
  parentRoute: SettingsRouteKey;
  titleKey: string;
};

export const settingsSubroutes: Partial<
  Record<SettingsRouteKey, SettingsSubrouteConfig>
> = {
  'change-password': {
    backAriaLabelKey: 'settings.account.password.backToAccount',
    parentRoute: 'account',
    titleKey: 'settings.account.password.title',
  },
  'set-password': {
    backAriaLabelKey: 'settings.account.setPassword.backToAccount',
    parentRoute: 'account',
    titleKey: 'settings.account.setPassword.title',
  },
};

export function getSettingsSubroute(
  route: SettingsRouteKey,
): SettingsSubrouteConfig | null {
  return settingsSubroutes[route] ?? null;
}
