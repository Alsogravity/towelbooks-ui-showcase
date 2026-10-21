import { Link } from 'react-router';

import { EmptyState } from '../../../../../components/feedback';
import { Alert, Button, Tag } from '../../../../../components/primitives';
import { handleApiProblem } from '../../../../../features/errors';
import { useI18n } from '../../../../../i18n';

import type { CommunitySettings, Discussion } from '../../../types';

type RoomDiscussionListViewProps = {
  roomId: string;
  combinedMutationError: unknown;
  communitySettings: CommunitySettings;
  discussions: Discussion[];
  onOpenCreateDialog: () => void;
};

export function RoomDiscussionListView({
  roomId,
  combinedMutationError,
  communitySettings,
  discussions,
  onOpenCreateDialog,
}: RoomDiscussionListViewProps) {
  const { formatDate, t } = useI18n();

  return (
    <div className="space-y-6">
      {combinedMutationError ? (
        <Alert variant="error">
          {
            handleApiProblem(combinedMutationError, {
              fallbackKey: 'rooms.detail.discussions.error.submit',
              t,
            }).message
          }
        </Alert>
      ) : null}

      {discussions.length === 0 ? (
        <div className="rounded-2xl border border-rule/80 bg-paper p-8 shadow-sm">
          <EmptyState
            icon="discussion-glyph"
            title={{ key: 'rooms.detail.discussions.empty.title' }}
            body={{
              key: communitySettings.viewerCanCreateDiscussions
                ? 'rooms.detail.discussions.empty.body.canCreate'
                : 'rooms.detail.discussions.empty.body.readOnly',
            }}
            action={
              communitySettings.viewerCanCreateDiscussions ? (
                <Button
                  onClick={onOpenCreateDialog}
                  prependIcon="plus"
                  size="md"
                  variant="secondary"
                >
                  {t('rooms.detail.discussions.create')}
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-rule/80 bg-paper shadow-sm overflow-hidden">
          <ul className="divide-y divide-rule">
            {discussions.map((discussion) => (
              <li key={discussion.id}>
                <Link
                  to={`/rooms/${roomId}?tab=community&view=discussions&discussion=${discussion.id}`}
                  className="flex w-full flex-col gap-2 px-5 py-5 text-left transition-colors hover:bg-rule/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div
                        className="app-text-row-title truncate text-ink"
                        title={discussion.title}
                      >
                        {discussion.title}
                      </div>
                      {discussion.excerpt ? (
                        <p className="mt-1 break-words line-clamp-2 text-sm text-ink-3">
                          {discussion.excerpt}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-2 pt-1">
                      {discussion.pinnedAt ? (
                        <Tag variant="role">
                          {t('rooms.detail.discussions.pinned')}
                        </Tag>
                      ) : null}
                      {discussion.lockedAt ? (
                        <Tag variant="role">
                          {t('rooms.detail.discussions.locked')}
                        </Tag>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-xs text-ink-4">
                    <span>
                      {t('rooms.detail.discussions.discussionCount', {
                        values: { count: discussion.commentCount },
                      })}
                    </span>
                    <span>{formatDate(discussion.createdAt)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
