import { type Avatar as AvatarShape } from '@towelbooks/schemas';

import { Avatar } from '../primitives';

import type { ReactNode } from 'react';

export interface ProfileHeaderAvatarProps {
  avatar: AvatarShape;
  displayName: string;
  children?: ReactNode;
  className?: string;
}

export function ProfileHeaderAvatar({
  avatar,
  displayName,
  children,
  className,
}: ProfileHeaderAvatarProps) {
  const rootClassName = ['relative shrink-0 w-fit h-fit', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClassName}>
      <Avatar
        background={avatar.background}
        foreground={avatar.foreground}
        initial={avatar.initial}
        imageUrl={avatar.imageUrl}
        imageAlt={displayName}
        className="profile-header__avatar border-4 border-paper"
      />
      {children}
    </div>
  );
}
