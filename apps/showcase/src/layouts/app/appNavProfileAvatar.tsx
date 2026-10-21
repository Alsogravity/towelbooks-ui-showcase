import { getSidebarUserPrimaryLabel } from './sidebarUserLabel';
import { Avatar } from '../../components/primitives';

import type { AuthUser } from '../../features/auth/types';

const profileNavAvatarStyle = { height: '1.5rem', width: '1.5rem' } as const;

function getProfileNavAvatarHighlightClassName(isActive: boolean) {
  return isActive
    ? 'rounded-full ring-2 ring-brick ring-offset-1 ring-offset-paper'
    : '';
}

interface AppNavProfileAvatarProps {
  isActive: boolean;
  user: AuthUser | null;
  userFallback: string;
}

export function AppNavProfileAvatar({
  isActive,
  user,
  userFallback,
}: AppNavProfileAvatarProps) {
  return (
    <span
      className={[
        'inline-flex shrink-0',
        getProfileNavAvatarHighlightClassName(isActive),
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Avatar
        initial={
          user?.avatar?.initial ??
          getSidebarUserPrimaryLabel(user, userFallback)
        }
        background={user?.avatar?.background}
        foreground={user?.avatar?.foreground}
        imageUrl={user?.avatar?.imageUrl}
        size="xs"
        className="app-text-caption shrink-0"
        style={profileNavAvatarStyle}
        aria-hidden="true"
      />
    </span>
  );
}
