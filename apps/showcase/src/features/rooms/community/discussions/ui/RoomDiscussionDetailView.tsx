import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router';

import { getProfilePath } from '../../../../../app/profileRoutes';
import { ErrorState, LoadingState } from '../../../../../components/feedback';
import {
  Alert,
  Button,
  ButtonLink,
  LikeButton,
  Tag,
} from '../../../../../components/primitives';
import { CommentsSection } from '../../../../comments/comments-panel/CommentsSection';
import { useAuth } from '../../../../../features/auth/AuthContext';
import { handleApiProblem } from '../../../../../features/errors';
import { useI18n } from '../../../../../i18n';
import { sdk } from '../../../../../lib/sdk';

import type { Discussion } from '../../../types';
import type { DiscussionModerationAction } from '../discussionTypes';

type AsyncQuerySlice = {
  error: unknown;
  isLoading: boolean;
  refetch: () => Promise<unknown>;
};

type RoomDiscussionDetailViewProps = {
  discussionQuery: AsyncQuerySlice;
  onBackToList: () => void;
  onDeleteDiscussion: () => void;
  onEditDiscussion: () => void;
  onInteractionChange: () => Promise<unknown> | unknown;
  onModerate: (action: DiscussionModerationAction) => void;
  roomId: string;
  selectedDiscussion: Discussion | null;
};

type DiscussionRootReactionProps = {
  discussion: Discussion;
  onInteractionChange: () => Promise<unknown> | unknown;
};

function DiscussionRootReaction({
  discussion,
  onInteractionChange,
}: DiscussionRootReactionProps) {
  const { isAuthenticated } = useAuth();
  const { t } = useI18n();
  const [reactionState, setReactionState] = useState<{
    base: Discussion['reactions'];
    discussionId: string;
    summary: Discussion['reactions'];
  } | null>(null);
  const [likeError, setLikeError] = useState<string | null>(null);

  const reactionSummary =
    reactionState?.discussionId === discussion.id &&
    reactionState.base.counts.like === discussion.reactions.counts.like &&
    reactionState.base.viewerReaction === discussion.reactions.viewerReaction
      ? reactionState.summary
      : discussion.reactions;

  const likeMutation = useMutation({
    mutationFn: () => {
      if (reactionSummary.viewerReaction === 'like') {
        return sdk.reactions.delete({
          targetId: discussion.id,
          targetType: 'discussion',
        });
      }

      return sdk.reactions.create({
        reactionType: 'like',
        targetId: discussion.id,
        targetType: 'discussion',
      });
    },
    onError: (error) => {
      setLikeError(
        handleApiProblem(error, {
          fallback: "Unable to update this discussion's like right now.",
          fallbackKey: 'rooms.detail.discussions.actions.likeError',
          t,
        }).message,
      );
    },
    onSuccess: async (summary) => {
      setLikeError(null);
      setReactionState({
        base: discussion.reactions,
        discussionId: discussion.id,
        summary: {
          counts: summary.counts,
          viewerReaction: summary.viewerReaction,
        },
      });
      await onInteractionChange();
    },
  });

  const isLiked = reactionSummary.viewerReaction === 'like';

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-rule/50 pt-2">
        <LikeButton
          aria-label={t(
            isLiked
              ? 'rooms.detail.discussions.actions.unlike'
              : 'rooms.detail.discussions.actions.like',
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
      </div>
      {likeError ? (
        <p className="text-sm text-brick" role="alert">
          {likeError}
        </p>
      ) : null}
    </>
  );
}

export function RoomDiscussionDetailView({
  discussionQuery,
  onBackToList,
  onDeleteDiscussion,
  onEditDiscussion,
  onInteractionChange,
  onModerate,
  roomId,
  selectedDiscussion,
}: RoomDiscussionDetailViewProps) {
  const { formatDate, t } = useI18n();

  if (discussionQuery.isLoading) {
    return (
      <div className="rounded-2xl border border-rule/80 bg-paper p-12 shadow-sm">
        <LoadingState
          label={{
            key: 'rooms.detail.discussions.discussionLoading',
            fallback: 'Opening discussion...',
          }}
        />
      </div>
    );
  }

  if (discussionQuery.error) {
    return (
      <div className="rounded-2xl border border-rule/80 bg-paper p-12 shadow-sm">
        <ErrorState
          title={{ key: 'rooms.detail.discussions.error.discussionTitle' }}
          body={{ key: 'rooms.detail.discussions.error.discussionBody' }}
          action={
            <Button
              variant="secondary"
              onClick={() => {
                void discussionQuery.refetch();
              }}
            >
              {t('errors.action.retry')}
            </Button>
          }
        />
      </div>
    );
  }

  if (!selectedDiscussion) {
    return (
      <div className="rounded-2xl border border-rule/80 bg-paper p-12 shadow-sm">
        <ErrorState
          title={{ key: 'rooms.detail.discussions.error.discussionTitle' }}
          body={{ key: 'rooms.detail.discussions.error.discussionBody' }}
          action={
            <ButtonLink
              to={`/rooms/${roomId}?tab=community&view=discussions`}
              variant="secondary"
            >
              {t('rooms.detail.discussions.backToList')}
            </ButtonLink>
          }
        />
      </div>
    );
  }

  const usernameSentinel = '__DISCUSSION_AUTHOR_USERNAME__';
  const bylineTemplate = t('rooms.detail.discussions.startedBy', {
    values: { username: usernameSentinel },
  });
  const [bylinePrefix, bylineSuffix = ''] =
    bylineTemplate.split(usernameSentinel);
  const authorUsername = selectedDiscussion.author.username;

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          prependIcon="chevron-left"
          size="sm"
          onClick={onBackToList}
        >
          {t('rooms.detail.discussions.backToList')}
        </Button>
      </div>

      <section className="rounded-2xl border border-rule/80 bg-paper p-5 shadow-sm sm:p-8">
        <div className="space-y-8">
          <div className="border-b border-rule pb-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {selectedDiscussion.pinnedAt ? (
                    <Tag variant="role">
                      {t('rooms.detail.discussions.pinned')}
                    </Tag>
                  ) : null}
                  {selectedDiscussion.lockedAt ? (
                    <Tag variant="role">
                      {t('rooms.detail.discussions.locked')}
                    </Tag>
                  ) : null}
                </div>
                <h3 className="app-text-page-title break-words text-ink">
                  {selectedDiscussion.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-sm text-ink-3">
                  <span>
                    {bylinePrefix}
                    <Link
                      to={getProfilePath({ username: authorUsername })}
                      className="text-brick hover:text-brick-2 hover:underline"
                    >
                      @{authorUsername}
                    </Link>
                    {bylineSuffix}
                  </span>
                  <span>{formatDate(selectedDiscussion.createdAt)}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {selectedDiscussion.viewerCanEdit ? (
                  <Button
                    aria-label={t(
                      'rooms.detail.discussions.actions.editDiscussion',
                    )}
                    icon="pencil-line"
                    iconSize={20}
                    size="sm"
                    variant="icon"
                    onClick={onEditDiscussion}
                  />
                ) : null}
                {selectedDiscussion.viewerCanModerate ? (
                  <>
                    <Button
                      aria-label={t(
                        selectedDiscussion.pinnedAt
                          ? 'rooms.detail.discussions.actions.unpin'
                          : 'rooms.detail.discussions.actions.pin',
                      )}
                      aria-pressed={Boolean(selectedDiscussion.pinnedAt)}
                      icon={selectedDiscussion.pinnedAt ? 'pin-off' : 'pin'}
                      iconSize={20}
                      size="sm"
                      variant="icon"
                      onClick={() =>
                        onModerate(
                          selectedDiscussion.pinnedAt ? 'unpin' : 'pin',
                        )
                      }
                    />
                    <Button
                      aria-label={t(
                        selectedDiscussion.lockedAt
                          ? 'rooms.detail.discussions.actions.unlock'
                          : 'rooms.detail.discussions.actions.lock',
                      )}
                      aria-pressed={Boolean(selectedDiscussion.lockedAt)}
                      icon={selectedDiscussion.lockedAt ? 'lock-open' : 'lock'}
                      iconSize={20}
                      size="sm"
                      variant="icon"
                      onClick={() =>
                        onModerate(
                          selectedDiscussion.lockedAt ? 'unlock' : 'lock',
                        )
                      }
                    />
                  </>
                ) : null}
                {selectedDiscussion.viewerCanDelete ? (
                  <Button
                    aria-label={t(
                      'rooms.detail.discussions.actions.deleteDiscussion',
                    )}
                    icon="trash-2"
                    iconSize={20}
                    size="sm"
                    variant="icon"
                    onClick={onDeleteDiscussion}
                  />
                ) : null}
              </div>
            </div>
          </div>

          <p className="whitespace-pre-wrap break-words text-ink app-text-body">
            {selectedDiscussion.body}
          </p>

          <DiscussionRootReaction
            discussion={selectedDiscussion}
            onInteractionChange={onInteractionChange}
          />

          <CommentsSection
            canCreateComment={selectedDiscussion.viewerCanReply}
            copy={{
              composerBodyLabel: {
                key: 'rooms.detail.discussions.commentBodyLabel',
              },
              composerPlaceholder: {
                key: 'rooms.detail.discussions.commentPlaceholder',
              },
              composerSubmit: {
                key: 'rooms.detail.discussions.commentSubmit',
              },
              composerSubmitting: {
                key: 'rooms.detail.discussions.commentSubmitting',
              },
              emptyBody: {
                key: 'rooms.detail.discussions.commentsEmptyBody',
              },
              emptyTitle: {
                key: 'rooms.detail.discussions.commentsEmptyTitle',
              },
              title: {
                key: 'rooms.detail.discussions.commentsTitle',
                values: { count: selectedDiscussion.commentCount },
              },
            }}
            headingId={`discussion-comments-title-${selectedDiscussion.id}`}
            onInteractionChange={onInteractionChange}
            queryKeyPrefix={[
              'rooms',
              roomId,
              'discussions',
              selectedDiscussion.id,
              'comments',
            ]}
            targetId={selectedDiscussion.id}
            targetType="discussion"
          />

          {selectedDiscussion.lockedAt ? (
            <Alert variant="warning">
              {t('rooms.detail.discussions.lockedCommentNotice')}
            </Alert>
          ) : null}
        </div>
      </section>
    </div>
  );
}
