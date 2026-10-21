import { useQuery } from '@tanstack/react-query';

import { ProfileTabsLoadingState } from '../../ProfileTabsLoadingState';
import { EmptyPanel } from './EmptyPanel';
import { ProfilePreviewNotice } from './ProfilePreviewNotice';
import { shouldShowProfilePreviewNotice } from '../profileStatPreview';
import { RoomCard } from '../../../../entities/room/ui';
import { useI18n } from '../../../../i18n';
import { sdk } from '../../../../lib/sdk';

export interface RoomsPanelProps {
  emptyCompact?: boolean;
  totalCount?: number;
  username: string;
}

export function RoomsPanel({
  emptyCompact = false,
  totalCount,
  username,
}: RoomsPanelProps) {
  const { locale, t } = useI18n();
  const { data, isLoading } = useQuery({
    queryKey: ['profiles', username, 'rooms', locale],
    queryFn: () => sdk.users.listProfileRooms(username),
  });

  if (isLoading) {
    return (
      <ProfileTabsLoadingState
        icon="users"
        label={t('profile.rooms.loading')}
      />
    );
  }

  const items = data?.items ?? [];

  if (items.length === 0) {
    return (
      <EmptyPanel
        compact={emptyCompact}
        icon="users"
        message={t('profile.empty.rooms')}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="space-y-3">
        {items.map((room) => (
          <li key={room.id}>
            <RoomCard room={room} />
          </li>
        ))}
      </ul>
      {shouldShowProfilePreviewNotice(totalCount, items.length) ? (
        <ProfilePreviewNotice
          shownCount={items.length}
          totalCount={totalCount!}
        />
      ) : null}
    </div>
  );
}
