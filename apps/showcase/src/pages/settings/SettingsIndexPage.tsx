import { settingsSections } from './settingsNavigation';
import {
  settingsIndexActionRowChevronClassName,
  settingsIndexActionRowClassName,
  settingsIndexActionRowIconClassName,
  settingsIndexActionRowLabelClassName,
} from './ui/settingsIndexActionRowClassName';
import { settingsSectionTitleClassName } from './ui/settingsTypography';
import { PageSection } from '../../components/layout';
import { ContactDialog } from '../../components/contact/ContactDialog';
import { Icon, Section } from '../../components/primitives';
import { useAuth } from '../../features/auth/AuthContext';
import { useSettingsShell } from '../../features/settings/SettingsShellContext';
import { useI18n } from '../../i18n';

import { useState, type ComponentProps } from 'react';

export function SettingsIndexPage() {
  const { goTo } = useSettingsShell();
  const { t } = useI18n();
  const { logout } = useAuth();
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <PageSection spacing="none">
      <section
        aria-labelledby="settings-index-section-general"
        className="space-y-3"
      >
        <Section
          as="div"
          className="space-y-1"
          text={t('settings.layout.description')}
          textClassName="supporting-copy leading-6 text-ink-2"
          title={t('settings.preferences.general.title')}
          titleClassName={settingsSectionTitleClassName}
          titleId="settings-index-section-general"
        />
        <div className="space-y-1">
          {settingsSections.map((section) => (
            <SettingsIndexActionRow
              key={section.key}
              iconName={section.iconName}
              label={t(section.labelKey)}
              onClick={() => goTo(section.route)}
            />
          ))}
          <SettingsIndexActionRow
            iconName="heart-handshake"
            label={t('shell.action.support')}
            onClick={() => setIsContactDialogOpen(true)}
          />
          <SettingsIndexActionRow
            iconName="log-out"
            label={t('shell.action.logout')}
            onClick={() => {
              void handleLogout();
            }}
            className="mt-3"
            tone="accent"
            showChevron={false}
          />
        </div>
      </section>
      <ContactDialog
        isOpen={isContactDialogOpen}
        onClose={() => setIsContactDialogOpen(false)}
      />
    </PageSection>
  );
}

type SettingsIndexActionRowProps = {
  className?: string;
  iconName: ComponentProps<typeof Icon>['name'];
  label: string;
  onClick: () => void;
  showChevron?: boolean;
  tone?: 'accent' | 'default';
};

function SettingsIndexActionRow({
  className = '',
  iconName,
  label,
  onClick,
  showChevron = true,
  tone = 'default',
}: SettingsIndexActionRowProps) {
  const isAccent = tone === 'accent';

  return (
    <button
      type="button"
      onClick={onClick}
      className={[settingsIndexActionRowClassName, className]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="flex min-w-0 items-center gap-2">
        <Icon
          name={iconName}
          size={18}
          className={
            isAccent
              ? 'shrink-0 text-brick transition-colors group-hover:text-brick'
              : settingsIndexActionRowIconClassName
          }
        />
        <span
          className={
            isAccent
              ? 'label block min-w-0 text-brick transition-colors group-hover:text-brick'
              : settingsIndexActionRowLabelClassName
          }
        >
          {label}
        </span>
      </span>
      {showChevron ? (
        <Icon
          name="chevron-right"
          size={18}
          className={settingsIndexActionRowChevronClassName}
        />
      ) : null}
    </button>
  );
}
