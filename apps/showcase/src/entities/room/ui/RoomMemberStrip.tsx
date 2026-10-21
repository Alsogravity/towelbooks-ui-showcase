import { UserAvatar } from '../../user/ui';
import { useI18n } from '../../../i18n';

import type { RoomMember } from '../../../features/rooms/types';

interface RoomMemberStripProps {
  members?: RoomMember[];
}

export function RoomMemberStrip({ members = [] }: RoomMemberStripProps) {
  const { t } = useI18n();
  const visibleMembers = members.slice(0, 6);
  const remainingCount = Math.max(0, members.length - visibleMembers.length);

  if (members.length === 0) {
    return (
      <p className="surface-note text-ink-3">{t('rooms.members.empty')}</p>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2">
        {visibleMembers.map((member) => {
          const displayName =
            member.displayName ?? member.username ?? t('shell.userFallback');

          return (
            <UserAvatar
              key={member.id}
              avatar={member.avatar}
              className="ring-2 ring-vellum"
              decorative
              displayName={displayName}
              size="md"
            />
          );
        })}
        {remainingCount > 0 && (
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-pill border border-rule bg-paper-2 text-xs font-semibold text-ink-3 ring-2 ring-vellum">
            +{remainingCount}
          </span>
        )}
      </div>
      <span className="supporting-copy text-ink-3">
        {t(
          members.length === 1
            ? 'rooms.members.count.one'
            : 'rooms.members.count.other',
          { values: { count: members.length } },
        )}
      </span>
    </div>
  );
}
