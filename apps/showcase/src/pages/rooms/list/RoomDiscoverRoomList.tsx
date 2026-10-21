import { type RoomDiscoveryItem } from '@towelbooks/schemas';

import { RoomCard } from '../../../entities/room/ui';

type RoomDiscoverRoomListProps = {
  ariaLabel: string;
  rooms: RoomDiscoveryItem[];
};

export function RoomDiscoverRoomList({
  ariaLabel,
  rooms,
}: RoomDiscoverRoomListProps) {
  return (
    <ul
      aria-label={ariaLabel}
      className="flex list-none flex-col gap-4 p-0"
      role="list"
    >
      {rooms.map((room) => (
        <li key={room.id}>
          <RoomCard
            room={room}
            memberCount={room.memberCount}
            readingsCount={room.readingsCount}
            titleAs="h3"
            variant="horizontal"
          />
        </li>
      ))}
    </ul>
  );
}
