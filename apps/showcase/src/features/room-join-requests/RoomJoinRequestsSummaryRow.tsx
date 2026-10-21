import { type RoomJoinRequestsSummaryPreview } from '@towelbooks/schemas';
import { Link } from 'react-router';

import { Icon } from '../../components/primitives';
import { useI18n } from '../../i18n';

type RoomJoinRequestsSummaryRowProps = {
  onOpen: () => void;
  pendingCount: number;
  preview: RoomJoinRequestsSummaryPreview[];
};

export function RoomJoinRequestsSummaryRow({
  onOpen,
  pendingCount,
  preview,
}: RoomJoinRequestsSummaryRowProps) {
  const { t } = useI18n();
  const firstRoom = preview[0];
  const remainingCount = Math.max(pendingCount - 1, 0);
  const subtitle =
    pendingCount === 1 && firstRoom
      ? t('notifications.roomJoinRequests.summary.subtitle.one', {
          values: { roomName: firstRoom.roomName },
        })
      : firstRoom
        ? t('notifications.roomJoinRequests.summary.subtitle.many', {
            values: { count: remainingCount, roomName: firstRoom.roomName },
          })
        : t('notifications.roomJoinRequests.summary.subtitle.fallback');

  return (
    <button
      aria-label={t('notifications.roomJoinRequests.summary.openLabel')}
      className="flex min-h-16 w-full items-center gap-3 rounded-[var(--radius-paper-4)] border border-rule bg-paper px-4 py-3 text-left transition-colors hover:border-brick/30 hover:bg-vellum/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick/40"
      onClick={onOpen}
      type="button"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-paper-2 text-ink-3">
        <Icon name="users-round" size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="app-text-row-title block text-ink">
          {t('notifications.roomJoinRequests.summary.title')}
        </span>
        <span className="mt-0.5 block truncate text-sm text-ink-3">
          {subtitle}
        </span>
      </span>
      <Icon name="chevron-right" size={20} className="shrink-0 text-ink-3" />
    </button>
  );
}

type RoomJoinRequestsListProps = {
  preview: RoomJoinRequestsSummaryPreview[];
};

export function RoomJoinRequestsList({ preview }: RoomJoinRequestsListProps) {
  const { t } = useI18n();

  if (preview.length === 0) {
    return (
      <p className="rounded-[var(--radius-paper-4)] bg-paper-2 px-4 py-5 body-sm text-ink-3">
        {t('notifications.roomJoinRequests.empty')}
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {preview.map((item) => (
        <li key={item.roomId}>
          <Link
            className="flex min-h-14 items-center justify-between gap-3 rounded-[var(--radius-paper-4)] border border-rule bg-paper px-4 py-3 transition-colors hover:border-brick/30 hover:bg-vellum/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick/40"
            to={`/rooms/${item.roomId}#members/join-requests`}
          >
            <span className="min-w-0">
              <span className="app-text-row-title block truncate text-ink">
                {item.roomName}
              </span>
              <span className="mt-0.5 block text-sm text-ink-3">
                {item.pendingCount === 1
                  ? t('notifications.roomJoinRequests.list.pending.one')
                  : t('notifications.roomJoinRequests.list.pending.other', {
                      values: { count: item.pendingCount },
                    })}
              </span>
            </span>
            <Icon
              name="chevron-right"
              size={20}
              className="shrink-0 text-ink-3"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
