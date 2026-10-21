import {
  getActiveSettingsSection,
  settingsSections,
} from '../../pages/settings/settingsNavigation';
import { Icon } from '../../components/primitives';
import { useI18n } from '../../i18n';
import { useSettingsNavigation } from './useSettingsNavigation';

export function SettingsNav() {
  const { currentRoute, goTo } = useSettingsNavigation();
  const { t } = useI18n();

  if (currentRoute === null) {
    return null;
  }

  const activeSection = getActiveSettingsSection(currentRoute);

  return (
    <nav
      aria-label={t('settings.layout.navAriaLabel')}
      className="flex flex-col gap-1"
    >
      {settingsSections.map((section) => {
        const isActive = activeSection === section.key;

        return (
          <button
            key={section.key}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => goTo(section.route)}
            className={[
              'w-full min-w-0 rounded-lg px-3 py-2.5 text-left transition-colors',
              isActive
                ? 'bg-brick-soft/80 text-ink'
                : 'text-ink-2 hover:bg-paper-2 hover:text-ink',
            ].join(' ')}
          >
            <span className="flex min-w-0 items-center gap-3">
              <Icon
                name={section.iconName}
                size={18}
                className="shrink-0 text-inherit"
              />
              <span className="block min-w-0 truncate text-sm text-inherit">
                {t(section.labelKey)}
              </span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}
