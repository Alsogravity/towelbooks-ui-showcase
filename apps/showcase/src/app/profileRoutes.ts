import { isReservedUsername } from '@towelbooks/schemas';

import type { AuthUser } from '../features/auth/types';

export function getProfilePath(
  user: Pick<AuthUser, 'username'> | null | undefined,
) {
  return user ? `/${user.username}` : '/';
}

export function getProfileReviewsPath(username: string) {
  return `/${encodeURIComponent(username)}/reviews`;
}

export function isProfilePath(pathname: string) {
  const pathSegments = pathname.split('/').filter(Boolean);

  return (
    pathSegments.length === 1 && !isReservedUsername(pathSegments[0] ?? '')
  );
}

export function isProfileReviewsPath(pathname: string) {
  const pathSegments = pathname.split('/').filter(Boolean);

  return (
    pathSegments.length === 2 &&
    pathSegments[1] === 'reviews' &&
    !isReservedUsername(pathSegments[0] ?? '')
  );
}
