import { type Avatar as AvatarShape } from '@towelbooks/schemas';

import { Avatar } from '../../../components/primitives';

type RoomAvatarProps = {
  avatar: AvatarShape;
  className?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
};

export function RoomAvatar({
  avatar,
  className,
  name,
  size = 'md',
}: RoomAvatarProps) {
  return (
    <span className={['relative inline-flex shrink-0', className].join(' ')}>
      <Avatar
        background={avatar.background}
        foreground={avatar.foreground}
        imageAlt={name}
        imageUrl={avatar.imageUrl}
        initial={avatar.initial}
        size={size}
      />
    </span>
  );
}
