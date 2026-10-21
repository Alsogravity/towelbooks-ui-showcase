import { type MouseEvent, useState } from 'react';

import { ExpandableMultilineText } from '../../../../components/text/ExpandableMultilineText';
import { Icon } from '../../../../components/primitives';
import {
  InlineSummaryStats,
  type InlineSummaryStatItem,
} from '../../../../components/stats/InlineSummaryStats';
import { UserAvatar } from '../../../../entities/user/ui';
import { ExternalLinksSummary } from '../../../external-links';
import { type useI18n } from '../../../../i18n';
import { getRoomVisibilityIcon, getRoomVisibilityLabel } from '../../roomCopy';
import { type Room, type RoomOverviewMember } from '../../types';
import { ReadingsStatIcon } from './ReadingsStatIcon';
import { RoomVisibilityChangeDialog } from './RoomVisibilityChangeDialog';

type RoomDetailHeroSummaryProps = {
  room: Room;
  formatNumber: ReturnType<typeof useI18n>['formatNumber'];
  members: RoomOverviewMember[] | undefined;
  membersTotal: number | undefined;
  readingsCount: number | undefined;
  canManageRoomOperations?: boolean;
  hasMemberRoomAccess?: boolean;
  roomId: string;
  t: ReturnType<typeof useI18n>['t'];
  onMembersClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  onReadingsClick?: () => void;
};

export function RoomDetailHeroSummary({
  room,
  formatNumber,
  members,
  membersTotal,
  readingsCount,
  canManageRoomOperations = false,
  hasMemberRoomAccess,
  roomId,
  t,
  onMembersClick,
  onReadingsClick,
}: RoomDetailHeroSummaryProps) {
  const [isVisibilityDialogOpen, setIsVisibilityDialogOpen] = useState(false);

  const visibleMembers = (members ?? []).slice(0, 3);
  const hasMembersSummary = typeof membersTotal === 'number';
  const hasReadingsSummary = typeof readingsCount === 'number';

  const visibilityIcon = getRoomVisibilityIcon(room.visibility);
  const visibilityLabel = getRoomVisibilityLabel(t, room.visibility);
  const visibilityIconColor =
    room.visibility === 'private' ? 'text-tangerine' : 'text-sky-500';

  const items: InlineSummaryStatItem[] = [
    {
      key: 'visibility',
      leading: (
        <Icon
          name={visibilityIcon}
          size={16}
          className={visibilityIconColor}
          aria-hidden="true"
        />
      ),
      label: visibilityLabel,
      ...(canManageRoomOperations
        ? {
            onClick: () => setIsVisibilityDialogOpen(true),
            actionLabel: t('rooms.detail.hero.visibility.actionLabel', {
              fallback: 'Alterar visibilidade',
            }),
          }
        : {}),
    },
    {
      key: 'members',
      leading:
        hasMembersSummary && membersTotal > 0 ? (
          hasMemberRoomAccess !== false ? (
            <div className="flex items-center -space-x-2">
              {visibleMembers.map((member) => (
                <UserAvatar
                  key={member.id}
                  avatar={member.avatar}
                  className="ring-2 ring-paper"
                  decorative
                  displayName={member.displayName || t('shell.userFallback')}
                  size="xs"
                />
              ))}
            </div>
          ) : (
            <Icon
              name="users-glyph"
              size={16}
              className="text-forest"
              aria-hidden="true"
            />
          )
        ) : undefined,
      value: hasMembersSummary ? formatNumber(membersTotal) : undefined,
      label: t(
        hasMembersSummary && membersTotal === 1
          ? 'rooms.detail.hero.stats.members.one'
          : 'rooms.detail.hero.stats.members',
      ),
      ...(onMembersClick
        ? {
            onClick: onMembersClick as () => void,
            actionLabel: t('rooms.detail.members.open'),
          }
        : {}),
    },
    {
      key: 'readings',
      leading: <ReadingsStatIcon size={16} />,
      value: hasReadingsSummary ? formatNumber(readingsCount) : undefined,
      label: t(
        hasReadingsSummary && readingsCount === 1
          ? 'rooms.detail.hero.stats.readings.one'
          : 'rooms.detail.hero.stats.readings',
      ),
      ...(onReadingsClick
        ? {
            onClick: onReadingsClick,
            actionLabel: t('rooms.detail.readings.open'),
          }
        : {}),
    },
  ];

  return (
    <section className="flex flex-col gap-3 mt-2">
      {room.description ? (
        <ExpandableMultilineText
          className="profile-header__bio"
          text={room.description}
          textClassName="app-text-body text-ink-2"
        />
      ) : null}

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2">
        <InlineSummaryStats className="order-2 sm:order-1" items={items} />
        {(room.links?.length ?? 0) > 0 ? (
          <div className="order-1 sm:order-2">
            <ExternalLinksSummary links={room.links ?? []} variant="plain" />
          </div>
        ) : null}
      </div>

      {canManageRoomOperations && isVisibilityDialogOpen ? (
        <RoomVisibilityChangeDialog
          roomId={roomId}
          currentVisibility={room.visibility}
          onClose={() => setIsVisibilityDialogOpen(false)}
        />
      ) : null}
    </section>
  );
}
