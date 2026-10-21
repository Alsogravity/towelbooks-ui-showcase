import type { ThemePreference } from '@towelbooks/ui';

export {
  applyResolvedThemeToDocument,
  getSystemThemePreference,
  isThemePreference,
  parseThemePreference,
  persistThemePreference,
  readThemePreference,
  resolveThemePreference,
  themePreferenceStorageKey,
} from '@towelbooks/ui';
export type { ResolvedTheme, ThemePreference } from '@towelbooks/ui';

export type ThemePreferenceOption = {
  labelKey: string;
  value: ThemePreference;
};

export const themePreferenceOptions = [
  {
    value: 'system',
    labelKey: 'settings.preferences.theme.system',
  },
  {
    value: 'light',
    labelKey: 'settings.preferences.theme.light',
  },
  {
    value: 'dark',
    labelKey: 'settings.preferences.theme.dark',
  },
] as const satisfies readonly ThemePreferenceOption[];
