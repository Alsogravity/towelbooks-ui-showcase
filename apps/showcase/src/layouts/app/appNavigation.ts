import { getProfilePath } from '../../app/profileRoutes';

import type { IconName } from '../../components/primitives';
import type { AuthUser } from '../../features/auth/types';

export interface AppNavigationItem {
  end?: boolean;
  icon: IconName;
  mobileLabelKey: string;
  showOnMobile?: boolean;
  sidebarLabelKey?: string;
  sidebarRequiresUsername?: boolean;
  to: string | ((user: AuthUser | null) => string);
  isActive?: (pathname: string, user: AuthUser | null) => boolean;
}

function resolveNavigationItemTo(
  item: AppNavigationItem,
  user: AuthUser | null,
): string {
  return typeof item.to === 'function' ? item.to(user) : item.to;
}

export function isAppNavigationItemActive(
  item: AppNavigationItem,
  pathname: string,
  user: AuthUser | null,
): boolean {
  if (item.isActive) {
    return item.isActive(pathname, user);
  }
  const to = resolveNavigationItemTo(item, user);
  const normalizedPathname = pathname.toLowerCase();
  const normalizedTo = to.toLowerCase();
  if (normalizedPathname === normalizedTo) {
    return true;
  }
  if (item.end) {
    return false;
  }
  const endSlashPosition =
    normalizedTo !== '/' && normalizedTo.endsWith('/')
      ? normalizedTo.length - 1
      : normalizedTo.length;
  return (
    normalizedPathname.startsWith(normalizedTo) &&
    normalizedPathname.charAt(endSlashPosition) === '/'
  );
}

export const appNavigation: AppNavigationItem[] = [
  {
    end: true,
    icon: 'nav-home',
    mobileLabelKey: 'shell.mobile.home',
    sidebarLabelKey: 'shell.link.libraryHome',
    to: '/',
  },
  {
    icon: 'users-glyph',
    mobileLabelKey: 'shell.mobile.rooms',
    sidebarLabelKey: 'shell.link.allRooms',
    to: '/rooms',
  },
  {
    icon: 'library-glyph',
    mobileLabelKey: 'shell.mobile.libraries',
    sidebarLabelKey: 'shell.link.libraries',
    to: (user) =>
      user?.defaultLibraryId
        ? `/libraries/${user.defaultLibraryId}`
        : '/my-library',
    isActive: (pathname, user) => {
      if (pathname === '/my-library') {
        return true;
      }
      const defaultLibraryId = user?.defaultLibraryId;
      if (defaultLibraryId === null || defaultLibraryId === undefined) {
        return false;
      }
      const libraryPath = `/libraries/${defaultLibraryId}`;
      return pathname === libraryPath || pathname.startsWith(`${libraryPath}/`);
    },
  },
  {
    icon: 'bookmark',
    mobileLabelKey: 'shell.mobile.collections',
    showOnMobile: false,
    sidebarLabelKey: 'shell.link.collections',
    to: '/collections',
  },
  {
    icon: 'nav-books',
    mobileLabelKey: 'shell.mobile.catalog',
    sidebarLabelKey: 'shell.link.catalog',
    to: '/catalog',
  },
  {
    icon: 'user',
    mobileLabelKey: 'shell.mobile.you',
    sidebarLabelKey: 'shell.link.profile',
    sidebarRequiresUsername: true,
    to: getProfilePath,
  },
];
