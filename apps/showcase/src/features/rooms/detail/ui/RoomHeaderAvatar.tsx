import { type Avatar as AvatarShape } from '@towelbooks/schemas';

import { Avatar } from '../../../../components/primitives';

type RoomHeaderAvatarProps = {
  avatar: AvatarShape;
  name: string;
  className?: string;
};

export function RoomHeaderAvatar({
  avatar,
  name,
  className,
}: RoomHeaderAvatarProps) {
  const rootClassName = ['relative shrink-0 w-fit h-fit', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClassName}>
      <Avatar
        background={avatar.background}
        foreground={avatar.foreground}
        imageAlt={name}
        imageUrl={avatar.imageUrl}
        initial={avatar.initial}
        className="profile-header__avatar border-4 border-paper"
      />
    </div>
  );
}
