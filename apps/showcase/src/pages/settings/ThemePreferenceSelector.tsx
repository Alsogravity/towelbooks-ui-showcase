import {
  Icon,
  SegmentedControl,
  type IconName,
} from '../../components/primitives';
import { useI18n } from '../../i18n';
import {
  themePreferenceOptions,
  type ThemePreference,
} from '../../features/theme/theme';

const themePreferenceIcons: Record<ThemePreference, IconName> = {
  system: 'monitor-smartphone',
  light: 'sun',
  dark: 'moon',
};

export function ThemePreferenceSelector({
  effectiveTheme,
  onChange,
  themePreference,
}: {
  effectiveTheme: ThemePreference;
  onChange: (nextValue: ThemePreference) => void;
  themePreference: ThemePreference;
}) {
  const { t } = useI18n();

  return (
    <SegmentedControl
      ariaLabel={t('settings.preferences.theme.title')}
      name="themePreference"
      onChange={onChange}
      value={themePreference}
      options={themePreferenceOptions.map((option) => ({
        value: option.value,
        ariaLabel:
          option.value === 'system'
            ? `${t(option.labelKey)} (${t(
                `settings.preferences.theme.${effectiveTheme}`,
              )})`
            : t(option.labelKey),
        title: t(option.labelKey),
        content: (
          <>
            <Icon
              name={themePreferenceIcons[option.value]}
              size={19}
              className="text-inherit"
            />
            <span className="sr-only">{t(option.labelKey)}</span>
          </>
        ),
      }))}
    />
  );
}
