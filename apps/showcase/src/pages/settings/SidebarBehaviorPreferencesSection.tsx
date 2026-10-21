import {
  SettingsOptionCard,
  SettingsOptionGroup,
} from './ui/SettingsOptionGroup';
import { SettingsSubsection } from './ui/SettingsSubsection';
import { Icon } from '../../components/primitives';
import { useI18n } from '../../i18n';
import { sidebarBehaviorPreferenceOptions } from '../../features/preferences/sidebarBehavior';

export function SidebarBehaviorPreferencesSection({
  onChange,
  sidebarBehaviorPreference,
}: {
  onChange: (
    nextValue: (typeof sidebarBehaviorPreferenceOptions)[number]['value'],
  ) => void;
  sidebarBehaviorPreference: (typeof sidebarBehaviorPreferenceOptions)[number]['value'];
}) {
  const { t } = useI18n();

  return (
    <SettingsSubsection
      title={t('settings.preferences.sidebar.title')}
      description={t('settings.preferences.sidebar.description')}
    >
      <SettingsOptionGroup legend={t('settings.preferences.sidebar.title')}>
        {sidebarBehaviorPreferenceOptions.map((option) => (
          <SettingsOptionCard
            key={option.value}
            checked={sidebarBehaviorPreference === option.value}
            label={t(option.labelKey)}
            name="sidebarBehaviorPreference"
            onChange={() => onChange(option.value)}
            titlePrefix={
              <Icon name={option.iconName} size={18} className="text-inherit" />
            }
            value={option.value}
          />
        ))}
      </SettingsOptionGroup>
    </SettingsSubsection>
  );
}
