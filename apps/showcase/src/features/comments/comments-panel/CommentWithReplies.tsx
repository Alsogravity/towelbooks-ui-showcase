import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { COMMENT_MAX_DEPTH } from '@towelbooks/schemas';
import { useState } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
} from '../../../components/primitives';
import { CommentCard, CommentComposer } from '../../../entities/comment/ui';
import { handleApiProblem } from '../../../features/errors';
import { useAuth } from '../../../features/auth/AuthContext';
import { useAuthenticatedAction } from '../../../features/auth/useAuthenticatedAction';
import { useReportOverlay } from '../../../features/reports/ReportOverlayContext';
import { useI18n } from '../../../i18n';
import { sdk } from '../../../lib/sdk';

import type { Comment } from '@towelbooks/schemas';

interface CommentWithRepliesProps {
  canCreateReply?: boolean;
  comment: Comment;
  onInteractionChange?: () => Promise<unknown> | unknown;
  queryKeyPrefix: readonly unknown[];
}

export function CommentWithReplies({
  canCreateReply = true,
  comment,
  onInteractionChange,
  queryKeyPrefix,
}: CommentWithRepliesProps) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const { user } = useAuth();
  const runAuthenticatedAction = useAuthenticatedAction();
  const { openReport } = useReportOverlay();
  const [isRepliesExpanded, setIsRepliesExpanded] = useState(false);
  const [isReplyComposerOpen, setIsReplyComposerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditComposerOpen, setIsEditComposerOpen] = useState(false);
  const [replyDraft, setReplyDraft] = useState('');
  const [editDraft, setEditDraft] = useState(comment.body ?? '');
  const [replyError, setReplyError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [likeError, setLikeError] = useState<string | null>(null);

  // A comment can only be replied to while it stays within the nesting limit.
  const canReply = canCreateReply && comment.depth < COMMENT_MAX_DEPTH - 1;
  const canInteract = Boolean(user);
  const canEdit =
    canInteract && user?.id === comment.authorUserId && !comment.deletedAt;
  const canReport = user?.id !== undefined && user.id !== comment.authorUserId;

  const repliesQuery = useInfiniteQuery({
    enabled: isRepliesExpanded && comment.replyCount > 0,
    queryKey: [...queryKeyPrefix, 'replies', comment.id],
    queryFn: ({ pageParam }) =>
      sdk.comments.list({
        ...(pageParam ? { cursor: pageParam } : {}),
        parentCommentId: comment.id,
        targetId: comment.targetId,
        targetType: comment.targetType,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.pageInfo.nextCursor ?? undefined,
  });

  const replyItems =
    repliesQuery.data?.pages.flatMap((page) => page.items) ?? [];

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (comment.reactions.viewerReaction === 'like') {
        return sdk.reactions.delete({
          targetId: comment.id,
          targetType: 'comment',
        });
      }

      return sdk.reactions.create({
        reactionType: 'like',
        targetId: comment.id,
        targetType: 'comment',
      });
    },
    onError: (error) => {
      setLikeError(
        handleApiProblem(error, {
          fallback: 'Unable to update the like right now.',
          fallbackKey: 'notes.card.likeError',
          t,
        }).message,
      );
    },
    onSuccess: async () => {
      setLikeError(null);
      await queryClient.invalidateQueries({ queryKey: queryKeyPrefix });
      await onInteractionChange?.();
    },
  });

  const replyMutation = useMutation({
    mutationFn: () =>
      sdk.comments.create({
        body: replyDraft.trim(),
        parentCommentId: comment.id,
        targetId: comment.targetId,
        targetType: comment.targetType,
      }),
    onError: (error) => {
      setReplyError(
        handleApiProblem(error, {
          fallback: 'Unable to publish the reply right now.',
          fallbackKey: 'notes.card.replyError',
          t,
        }).message,
      );
    },
    onSuccess: async () => {
      setReplyDraft('');
      setReplyError(null);
      setIsRepliesExpanded(true);
      setIsReplyComposerOpen(false);
      await queryClient.invalidateQueries({ queryKey: queryKeyPrefix });
      await onInteractionChange?.();
    },
  });

  const editMutation = useMutation({
    mutationFn: () =>
      sdk.comments.update(comment.id, {
        body: editDraft.trim(),
      }),
    onError: (error) => {
      setEditError(
        handleApiProblem(error, {
          fallback: 'Unable to update the comment right now.',
          fallbackKey: 'notes.card.editError',
          t,
        }).message,
      );
    },
    onSuccess: async () => {
      setEditError(null);
      setIsEditComposerOpen(false);
      await queryClient.invalidateQueries({ queryKey: queryKeyPrefix });
      await onInteractionChange?.();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => sdk.comments.delete(comment.id),
    onError: (error) => {
      setDeleteError(
        handleApiProblem(error, {
          fallback: 'Unable to remove the note right now.',
          fallbackKey: 'notes.card.deleteError',
          t,
        }).message,
      );
    },
    onSuccess: async () => {
      setDeleteError(null);
      setIsDeleteDialogOpen(false);
      await queryClient.invalidateQueries({ queryKey: queryKeyPrefix });
      await onInteractionChange?.();
    },
  });

  const handleReplyToggle = () => {
    setReplyError(null);

    if (isReplyComposerOpen) {
      setIsReplyComposerOpen(false);
      return;
    }

    // Replying to a nested comment prefixes the parent author as a mention so
    // it is clear which reply in the thread is being answered.
    if (comment.depth >= 1 && replyDraft.trim().length === 0) {
      setReplyDraft(`@${comment.author.username} `);
    }

    setIsReplyComposerOpen(true);
  };

  const handleEditToggle = () => {
    setEditError(null);
    setEditDraft(comment.body ?? '');
    setIsEditComposerOpen(true);
  };

  const replyComposer = canInteract &&
    canReply &&
    isReplyComposerOpen &&
    !comment.deletedAt && (
      <CommentComposer
        bodyLabel={t('notes.card.replyBodyLabel')}
        cancelLabel={t('notes.panel.form.cancel')}
        className="space-y-2 pt-2"
        disabled={replyMutation.isPending}
        error={replyError}
        errorId={`${comment.id}-reply-error`}
        isSubmitting={replyMutation.isPending}
        onCancel={() => {
          setReplyDraft('');
          setReplyError(null);
          setIsReplyComposerOpen(false);
        }}
        onChange={(value) => {
          setReplyDraft(value);
          setReplyError(null);
        }}
        onSubmit={() => {
          if (replyDraft.trim().length === 0) {
            setReplyError(t('notes.panel.form.validation.bodyRequired'));
            return;
          }

          setReplyError(null);
          replyMutation.mutate();
        }}
        placeholder={t('notes.card.replyPlaceholder')}
        rows={1}
        submitDisabled={replyDraft.trim().length === 0}
        submitLabel={t('notes.card.replySubmit')}
        submittingLabel={t('notes.card.replySubmitting')}
        value={replyDraft}
      />
    );

  const editComposer =
    canEdit && isEditComposerOpen ? (
      <CommentComposer
        bodyLabel={t('notes.card.editBodyLabel')}
        cancelLabel={t('notes.panel.form.cancel')}
        className="space-y-2 pt-2"
        disabled={editMutation.isPending}
        error={editError}
        errorId={`${comment.id}-edit-error`}
        isSubmitting={editMutation.isPending}
        onCancel={() => {
          setEditDraft(comment.body ?? '');
          setEditError(null);
          setIsEditComposerOpen(false);
        }}
        onChange={(value) => {
          setEditDraft(value);
          setEditError(null);
        }}
        onSubmit={() => {
          if (editDraft.trim().length === 0) {
            setEditError(t('notes.panel.form.validation.bodyRequired'));
            return;
          }

          setEditError(null);
          editMutation.mutate();
        }}
        placeholder={t('notes.card.editPlaceholder')}
        rows={2}
        submitDisabled={editDraft.trim().length === 0}
        submitLabel={t('notes.card.editSubmit')}
        submittingLabel={t('notes.card.editSubmitting')}
        value={editDraft}
      />
    ) : null;

  let replies = null;

  if (isRepliesExpanded) {
    if (repliesQuery.isLoading) {
      replies = (
        <p className="pl-9 pt-2 text-sm text-ink-3">
          {t('notes.card.repliesLoading')}
        </p>
      );
    } else if (repliesQuery.error && !repliesQuery.isFetchNextPageError) {
      replies = (
        <p className="pl-9 pt-2 text-sm text-brick">
          {t('notes.card.repliesError')}
        </p>
      );
    } else if (replyItems.length > 0) {
      const items = replyItems;

      replies = (
        <div id={`${comment.id}-replies`}>
          {items.map((reply, index) => (
            <div key={reply.id} className="relative pl-9">
              {/* Curved connector linking the spine into this reply's avatar. */}
              <span
                aria-hidden
                className="absolute left-[18px] top-0 h-6 w-[18px] rounded-bl-[12px] border-b border-l border-rule/30"
              />
              {/* Spine continuation down to the next sibling reply. */}
              {index < items.length - 1 && (
                <span
                  aria-hidden
                  className="absolute bottom-0 left-[18px] top-6 w-px bg-rule/30"
                />
              )}
              <CommentWithReplies
                canCreateReply={canCreateReply}
                comment={reply}
                onInteractionChange={onInteractionChange}
                queryKeyPrefix={queryKeyPrefix}
              />
            </div>
          ))}
          {repliesQuery.hasNextPage ? (
            <div className="pl-9 pt-1">
              <Button
                disabled={repliesQuery.isFetchingNextPage}
                isLoading={repliesQuery.isFetchingNextPage}
                loadingLabel={t('notes.card.repliesLoadingMore')}
                size="sm"
                variant="text"
                onClick={() => void repliesQuery.fetchNextPage()}
              >
                {t('notes.card.repliesLoadMore')}
              </Button>
              {repliesQuery.isFetchNextPageError ? (
                <p className="pt-1 text-sm text-brick" role="alert">
                  {t('notes.card.repliesLoadMoreError')}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      );
    }
  }

  return (
    <div className="space-y-2">
      <CommentCard
        comment={comment}
        editComposer={editComposer}
        isEditing={isEditComposerOpen}
        isDeletePending={deleteMutation.isPending}
        isLikePending={likeMutation.isPending}
        isRepliesExpanded={isRepliesExpanded}
        onDelete={
          canInteract && comment.viewerCanDelete && !comment.deletedAt
            ? () => {
                setDeleteError(null);
                setIsDeleteDialogOpen(true);
              }
            : undefined
        }
        onEdit={canEdit ? handleEditToggle : undefined}
        onLikeToggle={
          comment.deletedAt
            ? undefined
            : () =>
                runAuthenticatedAction(() => {
                  likeMutation.mutate();
                })
        }
        onReport={
          canReport
            ? () =>
                openReport({
                  targetId: comment.id,
                  targetType: 'comment',
                })
            : undefined
        }
        onRepliesToggle={
          comment.replyCount > 0
            ? () => setIsRepliesExpanded((current) => !current)
            : undefined
        }
        onReplyToggle={
          canReply && !comment.deletedAt
            ? () => runAuthenticatedAction(handleReplyToggle)
            : undefined
        }
        replies={replies}
        replyComposer={replyComposer}
      />
      {isDeleteDialogOpen ? (
        <Dialog
          title={t('notes.card.deleteDialog.title')}
          onClose={() => {
            if (!deleteMutation.isPending) {
              setIsDeleteDialogOpen(false);
            }
          }}
        >
          {({ close }) => (
            <>
              <DialogBody className="space-y-4">
                <p className="text-sm leading-6 text-ink-2">
                  {t('notes.card.deleteDialog.body')}
                </p>
                {deleteError ? (
                  <p className="text-sm text-brick" role="alert">
                    {deleteError}
                  </p>
                ) : null}
              </DialogBody>
              <DialogActions>
                <Button
                  disabled={deleteMutation.isPending}
                  variant="secondary"
                  onClick={() => close()}
                >
                  {t('notes.card.deleteDialog.cancel')}
                </Button>
                <Button
                  isLoading={deleteMutation.isPending}
                  loadingLabel={t('notes.card.deleteDialog.confirm')}
                  variant="danger"
                  onClick={() => {
                    setDeleteError(null);
                    deleteMutation.mutate();
                  }}
                >
                  {t('notes.card.deleteDialog.confirm')}
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      ) : null}
      {likeError ? <p className="text-sm text-brick">{likeError}</p> : null}
    </div>
  );
}
