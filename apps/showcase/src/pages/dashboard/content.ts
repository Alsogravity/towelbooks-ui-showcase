import type { RoomListItem } from '../../features/rooms/types';
import type { CoverGeometry } from '@towelbooks/schemas';

export interface ContinueCatalogWork {
  author?: string | null;
  chapterLabel?: string;
  roomName?: string;
  coverThumbnailUrl?: string | null;
  coverUrl?: string | null;
  coverGeometry?: CoverGeometry | null;
  href: string;
  progress?: number;
  theme: number;
  title: string;
}

export interface InsightStat {
  accent: 'brick' | 'forest' | 'gold';
  icon: 'flame' | 'book-open' | 'bookmark';
  label: string;
  unit: string;
  value: number;
}

export type RoomCurrentReading = NonNullable<RoomListItem['currentReading']>;

export function themeFromString(value: string): number {
  let hash = 0;

  for (const character of value) {
    hash = (hash + character.charCodeAt(0)) % 7;
  }

  return hash;
}
