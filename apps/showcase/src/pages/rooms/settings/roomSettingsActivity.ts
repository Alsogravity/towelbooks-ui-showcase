import {
  DEFAULT_ROOM_ACTIVITY_FEED_VISIBILITY,
  type RoomActivityEventType,
} from '@towelbooks/schemas';

export type ConfigurableActivityType = RoomActivityEventType;

export const roomActivityRows = [
  'room.discussion_created',
  'room.poll_created',
  'room.poll_closed',
  'room.reading_created',
  'room.reading_finished',
  'room.note_created',
  'room.member_joined',
  'room.announcement_created',
] as const satisfies readonly RoomActivityEventType[];

export const defaultActivityVisibility = DEFAULT_ROOM_ACTIVITY_FEED_VISIBILITY;
