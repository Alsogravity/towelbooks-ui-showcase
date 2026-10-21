import { type RoomAnnouncement } from '@towelbooks/schemas';

import { getDiscussionAuthorName } from '../../community/discussions/getDiscussionAuthorName';
import { useI18n } from '../../../../i18n';

export function RoomAnnouncementsList({
  announcements,
  onSelect,
}: {
  announcements: RoomAnnouncement[];
  onSelect: (announcement: RoomAnnouncement) => void;
}) {
  const { formatDate, t } = useI18n();

  return (
    <div className="overflow-hidden rounded-2xl border border-rule/80 bg-paper shadow-sm">
      <ul className="divide-y divide-rule">
        {announcements.map((announcement) => (
          <li key={announcement.id}>
            <button
              type="button"
              onClick={() => onSelect(announcement)}
              className="flex w-full flex-col gap-2 px-5 py-5 text-left transition-colors hover:bg-rule/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="app-text-row-title text-ink">
                    {announcement.title ??
                      t('rooms.detail.announcements.untitled')}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-ink-3">
                    {announcement.body}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 text-xs text-ink-4">
                <span>
                  {t('rooms.detail.announcements.byline', {
                    values: {
                      authorName: getDiscussionAuthorName(announcement.author),
                    },
                  })}
                </span>
                <span>{formatDate(announcement.createdAt)}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
