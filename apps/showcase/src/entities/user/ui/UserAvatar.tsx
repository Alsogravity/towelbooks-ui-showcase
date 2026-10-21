import { type Avatar as AvatarShape } from '@towelbooks/schemas';

import { Avatar } from '../../../components/primitives';
import type { AvatarSize } from '@towelbooks/ui';

type UserAvatarProps = {
  avatar: AvatarShape;
  className?: string;
  decorative?: boolean;
  displayName?: string | null;
  size?: AvatarSize;
};

export function UserAvatar({
  avatar,
  className,
  decorative = false,
  displayName,
  size = 'md',
}: UserAvatarProps) {
  return (
    <Avatar
      aria-hidden={decorative ? true : undefined}
      background={avatar.background}
      className={className}
      foreground={avatar.foreground}
      imageAlt={decorative ? '' : (displayName ?? avatar.initial)}
      imageUrl={avatar.imageUrl}
      imageUrls={avatar.imageUrls}
      initial={avatar.initial}
      size={size}
    />
  );
}
