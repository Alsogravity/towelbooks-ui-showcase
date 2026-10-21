import type { IconName } from '@towelbooks/ui';

export const roomTabSectionIcons = {
  members: 'users-glyph',
  announcements: 'megaphone-glyph',
  meetings: 'calendar',
  readings: 'library-glyph',
  readingsActive: 'book-open-text',
  readingsHistory: 'book',
  community: 'community-glyph',
  room: 'profile-activity',
} as const satisfies Record<string, IconName>;
