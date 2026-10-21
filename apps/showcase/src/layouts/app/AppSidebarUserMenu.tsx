import { useMemo, useState } from 'react';

import { sidebarNavRadiusClassName } from './AppSidebarNav';
import { ContactDialog } from '../../components/contact/ContactDialog';
import { LanguageFade } from '../../components/motion/LanguageMotion';
import { ActionMenu, Icon } from '../../components/primitives';
import { useOpenSettingsAction } from '../../features/settings/useOpenSettingsAction';
import { useI18n } from '../../i18n';

const profileMenuItemClassName = 'text-base text-ink-2 hover:text-ink';

function getMenuPresentation(isCollapsed: boolean) {
  return {
    contentClassName: isCollapsed ? 'w-56' : undefined,
    placement: 'top-start',
  } as const;
}

interface AppSidebarUserMenuProps {
  isCollapsed: boolean;
  onMenuOpenChange: (isOpen: boolean) => void;
  onMenuSelect: () => void;
  onLogout: () => void | Promise<void>;
}

export function AppSidebarUserMenu({
  isCollapsed,
  onMenuOpenChange,
  onMenuSelect,
  onLogout,
}: AppSidebarUserMenuProps) {
  const { t } = useI18n();
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const openSettings = useOpenSettingsAction();
  const menuLabel = t('shell.action.menu');
  const menuPresentation = useMemo(
    () => getMenuPresentation(isCollapsed),
    [isCollapsed],
  );

  const handleMenuOpenChange = (isOpen: boolean) => {
    onMenuOpenChange(isOpen);
  };

  return (
    <div className="pt-4">
      <div className="mb-3">
        <ActionMenu
          ariaLabel={menuLabel}
          contentClassName={menuPresentation.contentClassName}
          matchActivatorWidth={!isCollapsed}
          onOpenChange={handleMenuOpenChange}
          placement={menuPresentation.placement}
          activator={({ activatorProps, ref }) => (
            <button
              ref={ref}
              type="button"
              className={[
                `flex min-h-12 w-full cursor-pointer items-center gap-3 ${sidebarNavRadiusClassName} border-0 bg-transparent px-3 text-left no-underline transition-colors hover:bg-paper-2`,
              ].join(' ')}
              aria-label={menuLabel}
              title={isCollapsed ? menuLabel : undefined}
              {...activatorProps}
            >
              <Icon name="menu" size={24} />
              <span
                className={[
                  'min-w-0 truncate text-sm text-ink transition-all duration-300 ease-out origin-left',
                  isCollapsed
                    ? 'w-0 max-w-0 opacity-0 -translate-x-4 pointer-events-none -ml-3'
                    : 'w-auto max-w-[180px] opacity-100 translate-x-0 ml-0',
                ].join(' ')}
              >
                {isCollapsed ? '' : menuLabel}
              </span>
            </button>
          )}
          sections={[
            {
              id: 'user-menu-actions',
              items: [
                {
                  id: 'settings',
                  kind: 'action',
                  className: profileMenuItemClassName,
                  icon: 'settings',
                  iconSize: 20,
                  label: (
                    <LanguageFade>
                      {t('shell.action.configurations')}
                    </LanguageFade>
                  ),
                  onSelect: () => {
                    onMenuSelect();
                    openSettings();
                  },
                },
                {
                  id: 'support',
                  kind: 'action',
                  className: profileMenuItemClassName,
                  icon: 'heart-handshake',
                  iconSize: 20,
                  label: (
                    <LanguageFade>{t('shell.action.support')}</LanguageFade>
                  ),
                  onSelect: () => {
                    onMenuSelect();
                    setIsContactDialogOpen(true);
                  },
                },
                {
                  id: 'logout',
                  kind: 'action',
                  className: profileMenuItemClassName,
                  icon: 'log-out',
                  iconSize: 20,
                  label: (
                    <LanguageFade>{t('shell.action.logout')}</LanguageFade>
                  ),
                  onSelect: () => {
                    onMenuSelect();
                    void onLogout();
                  },
                },
              ],
            },
          ]}
        />
      </div>
      <ContactDialog
        isOpen={isContactDialogOpen}
        onClose={() => setIsContactDialogOpen(false)}
      />
    </div>
  );
}
