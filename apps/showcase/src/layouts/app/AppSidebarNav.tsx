import { Link, useLocation } from 'react-router';
import { CountBadge } from '@towelbooks/ui';
import { useEffect, useState } from 'react';

import { appNavigation, isAppNavigationItemActive } from './appNavigation';
import { AppNavProfileAvatar } from './appNavProfileAvatar';
import { useIsDesktopShellViewport } from './shellViewport';
import { LanguageFade } from '../../components/motion/LanguageMotion';
import { Icon } from '../../components/primitives';
import { useAuth } from '../../features/auth/AuthContext';
import { getNotificationsBellAriaLabel } from '../../features/notifications/notificationsBellAriaLabel';
import { useNotificationsPanel } from '../../features/notifications/NotificationsPanelContext';
import { useNotificationBellCount } from '../../features/notifications/useNotificationBellCount';
import { useI18n } from '../../i18n';

import type { IconName } from '../../components/primitives';

interface AppSidebarNavProps {
  enableNotifications?: boolean;
  isCollapsed: boolean;
}

export const sidebarNavRadiusClassName = 'rounded-[var(--radius-paper-4)]';

function getRailItemClassName(isActive: boolean) {
  return [
    `room relative flex min-h-12 w-full items-center gap-3 ${sidebarNavRadiusClassName} border border-transparent px-3 text-left transition-colors duration-200 hover:bg-paper-2`,
    isActive ? 'font-semibold text-brick' : 'text-ink-2',
  ].join(' ');
}

const railLinkClassName = (isActive: boolean) => getRailItemClassName(isActive);

export function AppSidebarNav({
  enableNotifications = true,
  isCollapsed,
}: AppSidebarNavProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const location = useLocation();
  const isDesktopShellViewport = useIsDesktopShellViewport();
  const { isOpen, openFromSidebar } = useNotificationsPanel();
  const [notificationQueriesReady, setNotificationQueriesReady] =
    useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setNotificationQueriesReady(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const notificationBellCount = useNotificationBellCount({
    enabled:
      enableNotifications && notificationQueriesReady && isDesktopShellViewport,
  });
  const unreadNotificationsCount = notificationBellCount.count;
  const userFallback = t('shell.userFallback');
  const notificationsLabel = t('shell.link.notifications');
  const notificationsAriaLabel = getNotificationsBellAriaLabel(
    unreadNotificationsCount,
    t,
  );
  const renderNotificationsButton = () => (
    <button
      type="button"
      className={getRailItemClassName(isOpen)}
      title={isCollapsed ? notificationsLabel : undefined}
      aria-label={notificationsAriaLabel}
      onClick={openFromSidebar}
    >
      <span className="vui-count-badge-anchor shrink-0">
        <Icon name="bell" size={24} strokeWidth={isOpen ? 2.25 : 1.75} />
        <CountBadge count={unreadNotificationsCount} />
      </span>
      <span
        className={[
          'min-w-0 truncate text-base text-inherit transition-all duration-300 ease-out origin-left',
          isCollapsed
            ? 'w-0 max-w-0 opacity-0 -translate-x-4 pointer-events-none -ml-3'
            : 'w-auto max-w-[180px] opacity-100 translate-x-0 ml-0',
        ].join(' ')}
      >
        <LanguageFade className="min-w-0 truncate text-base text-inherit">
          {isCollapsed ? '' : notificationsLabel}
        </LanguageFade>
      </span>
    </button>
  );
  const renderNavIcon = (
    labelKey: string,
    iconName: IconName,
    isActive: boolean,
  ) =>
    labelKey === 'shell.link.profile' ? (
      <AppNavProfileAvatar
        isActive={isActive}
        user={user}
        userFallback={userFallback}
      />
    ) : (
      <Icon name={iconName} size={24} strokeWidth={isActive ? 2.25 : 1.75} />
    );

  return (
    <>
      {appNavigation
        .filter((item) => item.sidebarLabelKey)
        .map((item) => {
          const label = t(item.sidebarLabelKey!);
          const to = typeof item.to === 'function' ? item.to(user) : item.to;
          const isActive = isAppNavigationItemActive(
            item,
            location.pathname,
            user,
          );

          return (
            <div key={`${label}-${to}`} className="contents">
              {item.sidebarLabelKey === 'shell.link.profile'
                ? renderNotificationsButton()
                : null}
              <Link
                to={to}
                aria-current={isActive ? 'page' : undefined}
                className={railLinkClassName(isActive)}
                title={isCollapsed ? label : undefined}
                aria-label={isCollapsed ? label : undefined}
              >
                {renderNavIcon(item.sidebarLabelKey!, item.icon, isActive)}
                <span
                  className={[
                    'min-w-0 truncate text-base text-inherit transition-all duration-300 ease-out origin-left',
                    isCollapsed
                      ? 'w-0 max-w-0 opacity-0 -translate-x-4 pointer-events-none -ml-3'
                      : 'w-auto max-w-[180px] opacity-100 translate-x-0 ml-0',
                  ].join(' ')}
                >
                  <LanguageFade className="min-w-0 truncate text-base text-inherit">
                    {isCollapsed ? '' : label}
                  </LanguageFade>
                </span>
              </Link>
            </div>
          );
        })}
    </>
  );
}

export { railLinkClassName };
