export const ROOM_CATALOG_QUERY_PARAM = 'catalogQuery';
export const ROOM_CREATE_READING_HASH = '#readings/create';

export function buildRoomCreateReadingHash(): string {
  return ROOM_CREATE_READING_HASH;
}

export function isRoomCreateReadingHashOpen(hash: string): boolean {
  return hash === ROOM_CREATE_READING_HASH;
}

export function buildRoomCreateReadingPath(
  roomId: string,
  query?: string,
): string {
  const searchParams = new URLSearchParams({ tab: 'readings' });
  const normalizedQuery = query?.trim() ?? '';

  if (normalizedQuery.length > 0) {
    searchParams.set(ROOM_CATALOG_QUERY_PARAM, normalizedQuery);
  }

  return `/rooms/${encodeURIComponent(roomId)}?${searchParams.toString()}${buildRoomCreateReadingHash()}`;
}
