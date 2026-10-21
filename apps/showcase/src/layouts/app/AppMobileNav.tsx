import { Link, useLocation } from 'react-router';

import { appNavigation, isAppNavigationItemActive } from './appNavigation';
import { AppNavProfileAvatar } from './appNavProfileAvatar';
import { LanguageFade } from '../../components/motion/LanguageMotion';
import { Icon } from '../../components/primitives';
import { useAuth } from '../../features/auth/AuthContext';
import { useI18n } from '../../i18n';

import type { IconName } from '../../components/primitives';
import type { DragEvent } from 'react';

const mobileTabClassName =
  'flex min-h-12 min-w-0 flex-1 basis-0 items-center justify-center text-ink-3 no-underline transition-colors hover:text-ink';
const mobileTabIconClassName = 'flex h-12 w-12 items-center justify-center';

interface AppMobileNavProps {
  isHidden?: boolean;
}

function preventLinkDrag(event: DragEvent<HTMLAnchorElement>) {
  event.preventDefault();
}

export function AppMobileNav({ isHidden = false }: AppMobileNavProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const location = useLocation();
  const userFallback = t('shell.userFallback');

  const renderNavIcon = (
    labelKey: string | undefined,
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
      <Icon
        className={
          isActive ? 'text-brick transition-colors' : 'transition-colors'
        }
        name={iconName}
        size={24}
      />
    );

  return (
    <>
      <div
        aria-hidden={isHidden || undefined}
        className={[
          'fixed inset-x-0 bottom-0 z-20 overflow-hidden transition-[height,opacity] duration-300 ease-in-out motion-reduce:transition-none lg:hidden',
          isHidden
            ? 'pointer-events-none h-0 opacity-0'
            : 'h-[calc(var(--app-mobile-nav-height)+env(safe-area-inset-bottom))] opacity-100',
        ].join(' ')}
      >
        <nav
          aria-label={t('shell.mobileNav')}
          className="flex h-[calc(var(--app-mobile-nav-height)+env(safe-area-inset-bottom))] items-stretch border-t border-rule bg-vellum pb-[env(safe-area-inset-bottom)]"
        >
          {appNavigation
            .filter((item) => item.showOnMobile !== false)
            .map((item) => {
              const to =
                typeof item.to === 'function' ? item.to(user) : item.to;
              const label = t(item.mobileLabelKey);
              const isActive = isAppNavigationItemActive(
                item,
                location.pathname,
                user,
              );

              return (
                <Link
                  key={`${item.mobileLabelKey}-${to}`}
                  to={to}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={label}
                  className={mobileTabClassName}
                  draggable={false}
                  onDragStart={preventLinkDrag}
                >
                  <LanguageFade className={mobileTabIconClassName}>
                    {renderNavIcon(item.sidebarLabelKey, item.icon, isActive)}
                  </LanguageFade>
                </Link>
              );
            })}
        </nav>
      </div>
    </>
  );
}
