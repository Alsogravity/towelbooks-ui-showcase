import type { UIMatch } from 'react-router';

export type AuthShellVariant = 'split' | 'full';

export type AuthShellHandle = {
  authShell?: AuthShellVariant;
};

export const GUEST_AUTH_PATHS = [
  '/login',
  '/register',
  '/register/google',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/oauth/account-exists',
  '/oauth/error',
] as const;

export type GuestAuthPath = (typeof GUEST_AUTH_PATHS)[number];

export function isGuestAuthPath(pathname: string): pathname is GuestAuthPath {
  return (GUEST_AUTH_PATHS as readonly string[]).includes(pathname);
}

export function resolveAuthShellVariant(
  matches: UIMatch[],
  pathname: string,
): AuthShellVariant {
  for (let index = matches.length - 1; index >= 0; index -= 1) {
    const handle = matches[index]?.handle as AuthShellHandle | undefined;

    if (handle?.authShell) {
      return handle.authShell;
    }
  }

  return pathname === '/login' ? 'split' : 'full';
}

export function isFullWidthAuthShell(variant: AuthShellVariant): boolean {
  return variant === 'full';
}
