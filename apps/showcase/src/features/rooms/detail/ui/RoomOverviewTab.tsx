import { type RoomOverview } from '@towelbooks/schemas';

import { Alert } from '../../../../components/primitives';
import { RoomActivityFeed } from '../../../room-activity/RoomActivityFeed';
import { useI18n } from '../../../../i18n';

type RoomOverviewTabProps = {
  roomId: string;
  room: Pick<RoomOverview, 'viewer'>;
};

export function RoomOverviewTab({ roomId, room }: RoomOverviewTabProps) {
  const { t } = useI18n();

  if (room.viewer.accessState !== 'active') {
    if (room.viewer.entry.blockedReason != null) {
      return null;
    }

    if (room.viewer.membershipStatus === 'active') {
      return null;
    }

    return (
      <div className="flex flex-col gap-8 py-4">
        <Alert variant="info">
          <div className="space-y-1">
            <p className="font-semibold text-ink">
              {t('rooms.detail.publicPreview.title')}
            </p>
            <p>{t('rooms.detail.publicPreview.body')}</p>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-4">
      <RoomActivityFeed roomId={roomId} />
    </div>
  );
}
