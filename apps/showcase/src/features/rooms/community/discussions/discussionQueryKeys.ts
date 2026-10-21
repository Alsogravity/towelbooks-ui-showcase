import { roomActivityQueryKeys } from '../../../room-activity/useRoomActivityFeed';

export function getDiscussionListKey(roomId: string) {
  return ['rooms', roomId, 'discussions', 'discussions'] as const;
}

export function getDiscussionKey(roomId: string, discussionId: string) {
  return ['rooms', roomId, 'discussions', 'discussion', discussionId] as const;
}

export function getRoomActivityEventsKey(roomId: string) {
  return roomActivityQueryKeys.room(roomId);
}

export function getViewerRoomActivityEventsKey() {
  return roomActivityQueryKeys.viewer();
}
