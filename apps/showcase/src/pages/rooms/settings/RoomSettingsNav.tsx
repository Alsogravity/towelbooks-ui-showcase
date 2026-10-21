import { Icon } from '../../../components/primitives';
import { useI18n } from '../../../i18n';
import { useRoomSettingsNavigation } from './useRoomSettingsNavigation';
import type { RoomSettingsRouteKey } from './roomSettingsHash';

type RoomSettingsSection = {
  key: RoomSettingsRouteKey;
  iconName: 'settings-2' | 'activity' | 'message-square';
  labelKey: string;
};

const roomSettingsSections: RoomSettingsSection[] = [
  {
    key: 'general',
    iconName: 'settings-2',
    labelKey: 'rooms.settings.nav.general',
  },
  {
    key: 'activity',
    iconName: 'activity',
    labelKey: 'rooms.settings.nav.activity',
  },
  {
    key: 'community',
    iconName: 'message-square',
    labelKey: 'rooms.settings.nav.community',
  },
];

export function RoomSettingsNav() {
  const { currentRoute, goTo } = useRoomSettingsNavigation();
  const { t } = useI18n();

  if (currentRoute === null) {
    return null;
  }

  // Map 'index' to 'general' for navigation highlighting
  const activeKey = currentRoute === 'index' ? 'general' : currentRoute;

  return (
    <nav
      aria-label={t('rooms.settings.layout.navAriaLabel')}
      className="flex flex-col gap-1"
    >
      {roomSettingsSections.map((section) => {
        const isActive = activeKey === section.key;

        return (
          <button
            key={section.key}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => goTo(section.key)}
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
