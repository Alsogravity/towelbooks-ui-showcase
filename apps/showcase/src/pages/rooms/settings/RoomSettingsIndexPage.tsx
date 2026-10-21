import { appSectionTitleClassName } from '../../../components/application';
import { getRoomSettingsSections } from './roomSettingsNavigation';
import { useRoomSettingsNavigation } from './useRoomSettingsNavigation';
import { PageSection } from '../../../components/layout';
import { Icon, Section } from '../../../components/primitives';
import { useI18n } from '../../../i18n';
import { useIsDesktopSettingsViewport } from '../../settings/settingsViewport';
import {
  settingsIndexActionRowChevronClassName,
  settingsIndexActionRowClassName,
  settingsIndexActionRowIconClassName,
  settingsIndexActionRowLabelClassName,
} from '../../settings/ui/settingsIndexActionRowClassName';

export function RoomSettingsIndexPage() {
  const { goTo } = useRoomSettingsNavigation();
  const { t } = useI18n();
  const isDesktopSettingsViewport = useIsDesktopSettingsViewport();

  return (
    <PageSection spacing="none">
      <section
        aria-labelledby={
          isDesktopSettingsViewport ? 'room-settings-index-title' : undefined
        }
        className="space-y-3"
      >
        <Section
          as="div"
          className="space-y-1"
          text={t('rooms.settings.layout.description')}
          textClassName="supporting-copy leading-6 text-ink-2"
          title={
            isDesktopSettingsViewport
              ? t('rooms.settings.index.title')
              : undefined
          }
          titleClassName={appSectionTitleClassName}
          titleId="room-settings-index-title"
        />
        <div className="space-y-1">
          {getRoomSettingsSections().map((section) => (
            <button
              key={section.key}
              type="button"
              onClick={() => goTo(section.key)}
              className={settingsIndexActionRowClassName}
            >
              <span className="flex min-w-0 items-center gap-2">
                <Icon
                  name={section.iconName}
                  size={18}
                  className={settingsIndexActionRowIconClassName}
                />
                <span className={settingsIndexActionRowLabelClassName}>
                  {t(section.labelKey)}
                </span>
              </span>
              <Icon
                name="chevron-right"
                size={18}
                className={settingsIndexActionRowChevronClassName}
              />
            </button>
          ))}
        </div>
      </section>
    </PageSection>
  );
}
