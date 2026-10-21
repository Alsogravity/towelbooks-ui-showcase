import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { CommentsSection } from '../comments/comments-panel/CommentsSection';
import { handleApiProblem } from '../errors';
import { useAuth } from '../auth/AuthContext';
import { Button, LikeButton } from '../../components/primitives';
import { useI18n } from '../../i18n';
import { sdk } from '../../lib/sdk';
import { profileActivityFeedQueryKey } from '../../components/profile/useProfileActivityFeed';

import type { ActivityEvent } from '@towelbooks/schemas';

type ActivityEventSocialProps = {
  event: ActivityEvent;
  username: string;
};

export function ActivityEventSocial({
  event,
  username,
}: ActivityEventSocialProps) {
  const { isAuthenticated } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [reactionState, setReactionState] = useState({
    base: event.reactions,
    eventId: event.id,
    summary: event.reactions,
  });
  const [likeError, setLikeError] = useState<string | null>(null);

  const reactionSummary =
    reactionState.eventId === event.id &&
    reactionState.base.counts.like === event.reactions.counts.like &&
    reactionState.base.viewerReaction === event.reactions.viewerReaction
      ? reactionState.summary
      : event.reactions;

  const likeMutation = useMutation({
    mutationFn: () => {
      if (reactionSummary.viewerReaction === 'like') {
        return sdk.reactions.delete({
          targetId: event.id,
          targetType: 'activity_event',
        });
      }

      return sdk.reactions.create({
        reactionType: 'like',
        targetId: event.id,
        targetType: 'activity_event',
      });
    },
    onError: (error) => {
      setLikeError(
        handleApiProblem(error, {
          fallback: "Unable to update this activity's like right now.",
          fallbackKey: 'profile.feed.action.likeError',
          t,
        }).message,
      );
    },
    onSuccess: async (summary) => {
      setLikeError(null);
      setReactionState({
        base: event.reactions,
        eventId: event.id,
        summary,
      });
      await queryClient.invalidateQueries({
        queryKey: profileActivityFeedQueryKey(username),
      });
    },
  });

  const isLiked = reactionSummary.viewerReaction === 'like';
  const commentsHeadingId = `activity-event-comments-${event.id}`;
  const commentsRegionId = `${commentsHeadingId}-region`;

  return (
    <div className="space-y-3 px-2">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-rule/50 pt-2">
        <LikeButton
          aria-label={t(
            isLiked ? 'profile.feed.action.unlike' : 'profile.feed.action.like',
          )}
          buttonClassName="!h-7 !w-7 !p-0 text-ink-4 hover:!bg-transparent hover:!text-brick"
          count={reactionSummary.counts.like}
          countClassName="app-text-caption text-ink-3"
          disabled={!isAuthenticated || likeMutation.isPending}
          iconSize={18}
          isLiked={isLiked}
          isLoading={likeMutation.isPending}
          onClick={() => likeMutation.mutate()}
        />
        <Button
          aria-controls={commentsRegionId}
          aria-expanded={isCommentsOpen}
          aria-label={t('profile.feed.action.comments', {
            values: { count: event.commentCount },
          })}
          className="!h-7 gap-1.5 !px-1.5 text-ink-3 hover:!bg-transparent hover:!text-ink"
          prependIcon="message-circle"
          iconSize={18}
          onClick={() => setIsCommentsOpen((current) => !current)}
          variant="ghost"
        >
          <span aria-hidden="true">{event.commentCount}</span>
        </Button>
      </div>
      {likeError ? (
        <p className="text-sm text-brick" role="alert">
          {likeError}
        </p>
      ) : null}
      {isCommentsOpen ? (
        <div id={commentsRegionId}>
          <CommentsSection
            copy={{
              emptyBody: {
                key: 'profile.feed.comments.emptyBody',
                fallback:
                  'Comments will appear here when the conversation begins.',
              },
              emptyTitle: {
                key: 'profile.feed.comments.emptyTitle',
                fallback: 'No comments yet',
              },
              title: {
                key: 'profile.feed.comments.title',
                fallback: 'Comments',
              },
            }}
            headingId={commentsHeadingId}
            onInteractionChange={() =>
              queryClient.invalidateQueries({
                queryKey: profileActivityFeedQueryKey(username),
              })
            }
            queryKeyPrefix={[
              ...profileActivityFeedQueryKey(username),
              event.id,
              'comments',
            ]}
            targetId={event.id}
            targetType="activity_event"
          />
        </div>
      ) : null}
    </div>
  );
}
