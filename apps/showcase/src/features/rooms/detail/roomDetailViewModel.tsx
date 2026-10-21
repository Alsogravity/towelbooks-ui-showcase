import { Icon, type Tab } from '../../../components/primitives';

import { roomTabSectionIcons } from './roomTabSectionIcons';

import type {
  RoomOverview,
  PaginatedReadingsResponse,
  Reading,
} from '@towelbooks/schemas';

export type RoomDetailTabKey =
  'room' | 'readings' | 'meetings' | 'community' | 'announcements';

type RoomDetailViewModelInput = {
  activeTab: RoomDetailTabKey;
  room: RoomOverview | undefined;
  hasSecondaryError: boolean;
  now?: Date;
  readings: PaginatedReadingsResponse | undefined;
  t: (key: string) => string;
};

type RoomDetailViewModel = {
  activeReadings: Reading[];
  activeTab: RoomDetailTabKey;
  canManageRoomOperations: boolean;
  canManageMeetings: boolean;
  hasSecondaryError: boolean;
  historicalReadings: Reading[];
  readingsCount: number | undefined;
  tabs: Tab<RoomDetailTabKey>[];
};

export function resolveRoomDetailTab(tab: string | null): RoomDetailTabKey {
  if (
    tab === 'readings' ||
    tab === 'meetings' ||
    tab === 'community' ||
    tab === 'announcements'
  ) {
    return tab;
  }

  return 'room';
}

export function createRoomDetailViewModel({
  activeTab,
  room,
  hasSecondaryError,
  now = new Date(),
  readings,
  t,
}: RoomDetailViewModelInput): RoomDetailViewModel {
  const allReadings = readings?.items ?? [];
  const canManageRoomOperations =
    room?.viewer.role === 'owner' || room?.viewer.role === 'admin';
  const canManageMeetings =
    canManageRoomOperations || room?.viewer.role === 'moderator';
  const activeReadings = allReadings.filter(
    (reading) => !reading.endsAt || new Date(reading.endsAt) > now,
  );
  const historicalReadings = allReadings.filter(
    (reading) => reading.endsAt && new Date(reading.endsAt) <= now,
  );

  return {
    activeReadings,
    activeTab,
    canManageRoomOperations,
    canManageMeetings,
    hasSecondaryError,
    historicalReadings,
    readingsCount: room?.readingsCount,
    tabs:
      room?.viewer.role == null
        ? [
            {
              key: 'room',
              label: (
                <span className="inline-flex items-center justify-center gap-2">
                  <Icon
                    name={roomTabSectionIcons.room}
                    size={24}
                    strokeWidth={1.7}
                  />
                  <span className="hidden sm:inline">
                    {t('rooms.detail.hero.roomLabel')}
                  </span>
                </span>
              ),
            },
          ]
        : [
            {
              key: 'room',
              label: (
                <span className="inline-flex items-center justify-center gap-2">
                  <Icon
                    name={roomTabSectionIcons.room}
                    size={24}
                    strokeWidth={1.7}
                  />
                  <span className="hidden sm:inline">
                    {t('rooms.detail.hero.roomLabel')}
                  </span>
                </span>
              ),
            },
            {
              key: 'readings',
              label: (
                <span className="inline-flex items-center justify-center gap-2">
                  <Icon
                    name={roomTabSectionIcons.readings}
                    size={24}
                    strokeWidth={1.7}
                  />
                  <span className="hidden sm:inline">
                    {t('rooms.detail.hero.stats.readings')}
                  </span>
                </span>
              ),
            },
            {
              key: 'community',
              label: (
                <span className="inline-flex items-center justify-center gap-2">
                  <Icon
                    name={roomTabSectionIcons.community}
                    size={24}
                    strokeWidth={1.7}
                  />
                  <span className="hidden sm:inline">
                    {t('rooms.detail.hero.stats.community')}
                  </span>
                </span>
              ),
            },
            {
              key: 'meetings',
              label: (
                <span className="inline-flex items-center justify-center gap-2">
                  <Icon
                    name={roomTabSectionIcons.meetings}
                    size={24}
                    strokeWidth={1.7}
                  />
                  <span className="hidden sm:inline">
                    {t('rooms.detail.hero.stats.meetings')}
                  </span>
                </span>
              ),
            },
            {
              key: 'announcements',
              label: (
                <span className="inline-flex items-center justify-center gap-2">
                  <Icon
                    name={roomTabSectionIcons.announcements}
                    size={24}
                    strokeWidth={1.7}
                  />
                  <span className="hidden sm:inline">
                    {t('rooms.detail.hero.stats.announcements')}
                  </span>
                </span>
              ),
            },
          ],
  };
}
