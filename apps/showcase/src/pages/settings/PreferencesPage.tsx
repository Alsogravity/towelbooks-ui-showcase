import { SidebarBehaviorPreferencesSection } from './SidebarBehaviorPreferencesSection';
import { SettingsRow } from './ui/SettingsRow';
import { SettingsRowGroup } from './ui/SettingsRowGroup';
import { SettingsSectionPageHeader } from './ui/SettingsSectionPageHeader';
import { SettingsSelectRow } from './ui/SettingsSelectRow';
import { SettingsSubsection } from './ui/SettingsSubsection';
import { Select, Tag } from '../../components/primitives';
import { useSidebarBehaviorPreference } from '../../features/preferences/sidebarBehavior';
import { useThemePreference } from '../../features/theme/ThemeContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import {
  getBrowserLocale,
  DEFAULT_APP_LOCALE,
  localeSelfLabels,
  type AppLocale,
  useI18n,
} from '../../i18n';
import { useIsDesktopShellViewport } from '../../layouts/app/shellViewport';
import { ThemePreferenceSelector } from './ThemePreferenceSelector';
import { usePreferencesPageState } from './usePreferencesPageState';

export function PreferencesPage() {
  usePageTitle({
    key: 'page.settings.preferences.title',
    fallback: 'Preferences',
  });

  const { t } = useI18n();
  const isDesktopShellViewport = useIsDesktopShellViewport();
  const { effectiveTheme, setThemePreference, themePreference } =
    useThemePreference();
  const { setSidebarBehaviorPreference, sidebarBehaviorPreference } =
    useSidebarBehaviorPreference();
  const { isMeLoading, me, updateLanguageMutation, updateLocale } =
    usePreferencesPageState();

  return (
    <div className="space-y-8">
      <SettingsSectionPageHeader
        title={t('settings.preferences.header.title')}
      />

      <div className="flex flex-col gap-10">
        <SettingsSubsection
          title={t('settings.preferences.general.title')}
          description={t('settings.preferences.header.description')}
          actions={
            updateLanguageMutation.isPending ? (
              <Tag variant="default">{t('settings.profile.edit.saving')}</Tag>
            ) : null
          }
        >
          <SettingsRowGroup>
            <SettingsSelectRow
              htmlFor="locale"
              label={t('settings.profile.edit.localeLabel')}
            >
              <Select
                id="locale"
                disabled={isMeLoading || updateLanguageMutation.isPending}
                matchActivatorWidth={false}
                onChange={(event) => {
                  const value = event.target.value;

                  if (value === 'auto') {
                    updateLocale({
                      localeMode: 'auto',
                      locale: null,
                      lastResolvedLocale: getBrowserLocale(),
                    });
                  } else {
                    updateLocale({
                      localeMode: 'manual',
                      locale: value as AppLocale,
                    });
                  }
                }}
                value={
                  me?.localeMode === 'auto'
                    ? 'auto'
                    : (me?.locale ?? DEFAULT_APP_LOCALE)
                }
                variant="ghost"
              >
                <option value="auto">
                  {t('settings.profile.edit.localeAuto')}
                </option>
                <option value="pt-BR">{localeSelfLabels['pt-BR']}</option>
                <option value="en-US">{localeSelfLabels['en-US']}</option>
              </Select>
            </SettingsSelectRow>
            <SettingsRow
              title={t('settings.preferences.theme.title')}
              control={
                <div
                  data-testid="theme-preference-row"
                  className="flex justify-end"
                >
                  <ThemePreferenceSelector
                    effectiveTheme={effectiveTheme}
                    onChange={setThemePreference}
                    themePreference={themePreference}
                  />
                </div>
              }
            />
          </SettingsRowGroup>
        </SettingsSubsection>

        {isDesktopShellViewport ? (
          <SidebarBehaviorPreferencesSection
            onChange={setSidebarBehaviorPreference}
            sidebarBehaviorPreference={sidebarBehaviorPreference}
          />
        ) : null}
      </div>
    </div>
  );
}
