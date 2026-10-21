import { AppMobileHeader, type AppMobileHeaderConfig } from './AppMobileHeader';
import { AppMobileNav } from './AppMobileNav';
import { AppSidebar } from './AppSidebar';
import { useSidebarState } from './useSidebarState';
import { useAuth } from '../../features/auth/AuthContext';

import type { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
  enableSidebarNotifications?: boolean;
  hideMobileHeader?: boolean;
  hideSidebar?: boolean;
  isSettingsPanelOpen?: boolean;
  mainOverlay?: ReactNode;
  mobileHeaderConfig?: AppMobileHeaderConfig;
}

function resolvePageShellMinHeightClass(
  hideMobileHeader: boolean,
  isMobileNavHidden: boolean,
) {
  if (hideMobileHeader && isMobileNavHidden) {
    return '[--page-shell-min-height:calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))]';
  }

  if (hideMobileHeader) {
    return '[--page-shell-min-height:calc(100dvh-env(safe-area-inset-top)-var(--app-mobile-nav-height)-env(safe-area-inset-bottom))]';
  }

  if (isMobileNavHidden) {
    return '[--page-shell-min-height:calc(100dvh-var(--app-mobile-header-height)-env(safe-area-inset-top)-env(safe-area-inset-bottom))]';
  }

  return '[--page-shell-min-height:calc(100dvh-var(--app-mobile-header-height)-env(safe-area-inset-top)-var(--app-mobile-nav-height)-env(safe-area-inset-bottom))]';
}

export function AppShell({
  children,
  enableSidebarNotifications = true,
  hideMobileHeader = false,
  hideSidebar = false,
  isSettingsPanelOpen = false,
  mainOverlay,
  mobileHeaderConfig,
}: AppShellProps) {
  const { logout } = useAuth();
  const {
    collapseSidebar,
    collapseSidebarAfterMenuClose,
    expandSidebar,
    isCollapsed,
    isPinnedExpanded,
    setSidebarFocusWithin,
    setSidebarMenuOpen,
  } = useSidebarState();

  const handleLogout = async () => {
    await logout();
  };

  const pageShellMinHeightClass = resolvePageShellMinHeightClass(
    hideMobileHeader,
    isSettingsPanelOpen,
  );

  return (
    <div
      className={[
        'relative flex min-h-screen flex-col bg-paper',
        '[--app-desktop-content-inset:108px]',
        '[--app-mobile-header-height:4rem]',
        '[--app-mobile-nav-height:48px]',
        pageShellMinHeightClass,
        'lg:flex-row lg:[--page-shell-min-height:100dvh]',
      ].join(' ')}
    >
      {hideSidebar ? null : (
        <div
          className={[
            'hidden shrink-0 overflow-visible transition-[width] duration-200 ease-in-out lg:block',
            isPinnedExpanded ? 'w-[240px]' : 'w-0',
          ].join(' ')}
        >
          <AppSidebar
            enableNotifications={enableSidebarNotifications}
            isDocked={isPinnedExpanded}
            isCollapsed={isCollapsed}
            onLogout={handleLogout}
            onMouseEnter={expandSidebar}
            onMouseLeave={collapseSidebar}
            onFocusWithinChange={setSidebarFocusWithin}
            onMenuOpenChange={setSidebarMenuOpen}
            onMenuSelect={collapseSidebarAfterMenuClose}
          />
        </div>
      )}

      {hideMobileHeader ? null : (
        <AppMobileHeader config={mobileHeaderConfig} />
      )}

      <main
        className={[
          'relative z-0 flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-x-clip',
          'transition-[padding] duration-300 ease-in-out motion-reduce:transition-none',
          'lg:px-[var(--app-desktop-content-inset)] lg:pt-0 lg:pb-0',
          isSettingsPanelOpen
            ? 'pb-0'
            : 'pb-[calc(var(--app-mobile-nav-height)+env(safe-area-inset-bottom))]',
          hideMobileHeader
            ? 'pt-0'
            : 'pt-[calc(var(--app-mobile-header-height)+env(safe-area-inset-top))]',
        ].join(' ')}
      >
        {mainOverlay ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
          >
            {mainOverlay}
          </div>
        ) : null}
        {children}
      </main>

      <AppMobileNav isHidden={isSettingsPanelOpen} />
    </div>
  );
}
