import type { AuthUser } from '../../features/auth/types';

function getFirstName(displayName: string | null | undefined): string | null {
  const trimmedDisplayName = displayName?.trim();

  if (!trimmedDisplayName) {
    return null;
  }

  return trimmedDisplayName.split(/\s+/u)[0] ?? null;
}

function getEmailHandle(email: string | undefined): string | null {
  const trimmedEmail = email?.trim();

  if (!trimmedEmail) {
    return null;
  }

  return trimmedEmail.split('@')[0] ?? trimmedEmail;
}

export function getSidebarUserPrimaryLabel(
  user: AuthUser | null,
  userFallback: string,
) {
  return (
    getFirstName(user?.displayName) ||
    user?.username ||
    getEmailHandle(user?.email) ||
    userFallback
  );
}
