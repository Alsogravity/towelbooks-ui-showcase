import {
  AppPropertyClickableValue,
  AppPropertyList,
  AppPropertyRow,
} from '../../../components/application';
import { Tag } from '../../../components/primitives';
import { useI18n } from '../../../i18n';

import {
  getRoomMemberEffectiveAccessDisplayLabelKey,
  getRoomMemberRoleLabelKey,
  resolveRoomMemberEffectiveAccessDisplayState,
  roomMemberEffectiveAccessStatusVariant,
  roomMemberRoleColor,
} from './roomMembersDisplay';

import type { RoomMemberManagementDetail } from '../types';

type RoomMemberParticipationSectionProps = {
  canEditRole: boolean;
  detail: RoomMemberManagementDetail;
  onViewManagementHistory?: () => void;
  openRoleChangeDialog: () => void;
};

export function RoomMemberParticipationSection({
  canEditRole,
  detail,
  onViewManagementHistory,
  openRoleChangeDialog,
}: RoomMemberParticipationSectionProps) {
  const { formatDate, t } = useI18n();
  const memberStatusVariant =
    detail.participation.status === 'suspended' ? 'paused' : 'reading';
  const effectiveAccessState =
    resolveRoomMemberEffectiveAccessDisplayState(detail);

  return (
    <>
      <AppPropertyList>
        <AppPropertyRow
          mobileLayout="inline"
          label={t('rooms.members.management.participation.status')}
          value={
            <Tag
              variant={memberStatusVariant}
              className="app-text-caption px-2 py-0.5"
            >
              {t(
                `rooms.members.management.memberStatus.${detail.participation.status}` as const,
              )}
            </Tag>
          }
        />
        <AppPropertyRow
          mobileLayout="inline"
          label={t('rooms.members.management.access.title')}
          value={
            <Tag
              variant={
                roomMemberEffectiveAccessStatusVariant[effectiveAccessState]
              }
              className="app-text-caption px-2 py-0.5"
            >
              {t(
                getRoomMemberEffectiveAccessDisplayLabelKey(
                  effectiveAccessState,
                ),
              )}
            </Tag>
          }
        />
        <AppPropertyRow
          mobileLayout="inline"
          label={t('rooms.members.management.participation.role')}
          value={
            canEditRole ? (
              <AppPropertyClickableValue
                ariaLabel={t('rooms.members.management.role.editLabel')}
                onClick={openRoleChangeDialog}
              >
                {t(getRoomMemberRoleLabelKey(detail.participation.role))}
              </AppPropertyClickableValue>
            ) : (
              <Tag
                variant={roomMemberRoleColor[detail.participation.role]}
                className="app-text-caption px-2 py-0.5"
              >
                {t(getRoomMemberRoleLabelKey(detail.participation.role))}
              </Tag>
            )
          }
        />
        {onViewManagementHistory ? (
          <AppPropertyRow
            mobileLayout="inline"
            label={t('rooms.members.management.history.title')}
            value={
              <AppPropertyClickableValue onClick={onViewManagementHistory}>
                {t('rooms.members.management.history.viewAction')}
              </AppPropertyClickableValue>
            }
          />
        ) : null}
        <AppPropertyRow
          mobileLayout="inline"
          label={t('rooms.members.management.participation.joinedAt')}
          value={formatDate(detail.participation.joinedAt)}
        />
        <AppPropertyRow
          mobileLayout="inline"
          label={t('rooms.members.management.participation.lastActivityAt')}
          value={
            detail.participation.lastActivityAt
              ? formatDate(detail.participation.lastActivityAt)
              : t('rooms.members.management.participation.lastActivityEmpty')
          }
        />
      </AppPropertyList>
    </>
  );
}
