import { Link } from 'react-router';

import { Icon, Tag, type IconName } from '../../../../components/primitives';
import { UserAvatar } from '../../../../entities/user/ui';
import { useI18n } from '../../../../i18n';
import {
  getRoomMemberRoleLabelKey,
  roomMemberRoleColor,
} from '../../members/roomMembersDisplay';

import type { RoomMember } from '../../types';

type RoomMembersListProps = {
  canManage: boolean;
  members: RoomMember[];
  onManageMember: (member: RoomMember) => void;
};

const memberRowClassName =
  'flex w-full items-center gap-3 rounded-[var(--radius-paper-4)] px-3 py-3 text-left transition-colors';

const memberRowActionClassName = [
  memberRowClassName,
  'cursor-pointer hover:bg-paper-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick/40',
].join(' ');

const roomMemberRoleIcon = {
  owner: 'star',
  admin: 'shield-check',
  moderator: 'shield',
} satisfies Record<'owner' | 'admin' | 'moderator', IconName>;

function RowContent({
  displayName,
  joinedMeta,
  member,
  showDisclosure,
}: {
  displayName: string;
  joinedMeta: string;
  member: RoomMember;
  showDisclosure: boolean;
}) {
  const { t } = useI18n();
  const roleBadge =
    member.role === 'member'
      ? null
      : {
          icon: roomMemberRoleIcon[member.role],
          label: t(getRoomMemberRoleLabelKey(member.role)),
          variant: roomMemberRoleColor[member.role],
        };

  return (
    <>
      <span
        aria-hidden="true"
        className="flex size-11 shrink-0 items-center justify-center text-ink-2"
      >
        <UserAvatar
          avatar={member.avatar}
          decorative
          displayName={displayName}
          size="lg"
        />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-ink">
          {displayName}
        </div>
        <div className="meta text-ink-3">{joinedMeta}</div>
      </div>
      {roleBadge ? (
        <Tag
          aria-label={roleBadge.label}
          title={roleBadge.label}
          variant={roleBadge.variant}
          className="app-text-caption shrink-0 px-2 py-0.5"
          withDot={false}
        >
          <Icon name={roleBadge.icon} size={16} />
          <span className="sr-only">{roleBadge.label}</span>
        </Tag>
      ) : null}
      {showDisclosure ? (
        <Icon
          name="chevron-right"
          size={20}
          className="ml-auto shrink-0 text-ink-2"
        />
      ) : null}
    </>
  );
}

export function RoomMembersList({
  canManage,
  members,
  onManageMember,
}: RoomMembersListProps) {
  const { formatDate, t } = useI18n();

  if (members.length === 0) {
    return (
      <p className="meta py-8 text-center text-ink-3">
        {t('rooms.members.empty')}
      </p>
    );
  }

  if (canManage) {
    return (
      <ul>
        {members.map((member) => {
          const displayName =
            member.displayName || member.username || t('shell.userFallback');
          const joinedMeta = t('rooms.members.joinedOn', {
            values: { date: formatDate(member.joinedAt) },
          });

          return (
            <li key={member.id}>
              <button
                aria-label={t('rooms.members.actions.manage', {
                  values: { name: displayName },
                })}
                className={memberRowActionClassName}
                type="button"
                onClick={() => onManageMember(member)}
              >
                <RowContent
                  displayName={displayName}
                  joinedMeta={joinedMeta}
                  member={member}
                  showDisclosure
                />
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul>
      {members.map((member) => {
        const displayName =
          member.displayName || member.username || t('shell.userFallback');
        const joinedMeta = t('rooms.members.joinedOn', {
          values: { date: formatDate(member.joinedAt) },
        });
        const hasUsername = Boolean(member.username);

        return (
          <li key={member.id}>
            {hasUsername ? (
              <Link
                to={`/${member.username}`}
                className={memberRowActionClassName}
              >
                <RowContent
                  displayName={displayName}
                  joinedMeta={joinedMeta}
                  member={member}
                  showDisclosure
                />
              </Link>
            ) : (
              <div className={memberRowClassName}>
                <RowContent
                  displayName={displayName}
                  joinedMeta={joinedMeta}
                  member={member}
                  showDisclosure={false}
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
