import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useRef, useState, type FocusEvent } from 'react';

import { CommentWithReplies } from './CommentWithReplies';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../../components/feedback';
import { Button } from '../../../components/primitives';
import { CommentComposer } from '../../../entities/comment/ui';
import { useAuth } from '../../../features/auth/AuthContext';
import { useAuthenticatedAction } from '../../../features/auth/useAuthenticatedAction';
import { handleApiProblem } from '../../../features/errors';
import {
  resolveLocalizedText,
  type LocalizedText,
  useI18n,
} from '../../../i18n';
import { sdk } from '../../../lib/sdk';

import type { Comment } from '@towelbooks/schemas';

export type CommentsSectionCopy = {
  composerBodyLabel?: LocalizedText;
  composerPlaceholder?: LocalizedText;
  composerSubmit?: LocalizedText;
  composerSubmitting?: LocalizedText;
  emptyBody?: LocalizedText;
  emptyTitle?: LocalizedText;
  loginAction?: LocalizedText;
  loginBody?: LocalizedText;
  title?: LocalizedText;
};

interface CommentsSectionProps {
  canCreateComment?: boolean;
  className?: string;
  copy?: CommentsSectionCopy;
  headingId: string;
  onInteractionChange?: () => Promise<unknown> | unknown;
  queryKeyPrefix: readonly unknown[];
  targetId: string;
  targetType: Comment['targetType'];
}

export function CommentsSection({
  canCreateComment = true,
  className,
  copy,
  headingId,
  onInteractionChange,
  queryKeyPrefix,
  targetId,
  targetType,
}: CommentsSectionProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const runAuthenticatedAction = useAuthenticatedAction();
  const queryClient = useQueryClient();
  const [draftBody, setDraftBody] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isComposerFocused, setIsComposerFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const commentsQueryKeyPrefix = [
    'comments',
    ...queryKeyPrefix,
    user?.id ?? 'guest',
  ] as const;
  const commentsQueryKey = [
    ...commentsQueryKeyPrefix,
    { parentCommentId: null, targetId, targetType },
  ] as const;
  const commentFieldId = `comment-body-${targetType}-${targetId}`;
  const commentErrorId = `${commentFieldId}-error`;

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchNextPageError,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: commentsQueryKey,
    queryFn: ({ pageParam }) =>
      sdk.comments.list({
        ...(pageParam ? { cursor: pageParam } : {}),
        targetId,
        targetType,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.pageInfo.nextCursor ?? undefined,
    enabled: Boolean(targetId),
  });

  const comments = data?.pages.flatMap((page) => page.items) ?? [];

  const createMutation = useMutation({
    mutationFn: () =>
      sdk.comments.create({
        body: draftBody.trim(),
        targetId,
        targetType,
      }),
    onError: (error) => {
      setFormError(
        handleApiProblem(error, {
          fallback: 'Unable to add a note right now.',
          fallbackKey: 'notes.panel.form.error',
          t,
        }).message,
      );
    },
    onSuccess: async () => {
      setDraftBody('');
      setFormError(null);
      setIsComposerFocused(false);
      await queryClient.invalidateQueries({ queryKey: commentsQueryKey });
      await onInteractionChange?.();
    },
  });

  const isComposerActive =
    isComposerFocused ||
    draftBody.trim().length > 0 ||
    createMutation.isPending;
  const commentsCount = comments.length;
  const commentsTitle = copy?.title
    ? resolveLocalizedText(copy.title, t)
    : hasNextPage
      ? t('notes.panel.title')
      : t(commentsCount === 1 ? 'notes.count.one' : 'notes.count.other', {
          values: { count: commentsCount },
        });
  const shouldRenderComments =
    isLoading ||
    Boolean(error) ||
    comments.length > 0 ||
    Boolean(copy?.emptyTitle);

  const handleComposerBlur = (event: FocusEvent<HTMLFormElement>) => {
    const nextTarget = event.relatedTarget;

    if (
      nextTarget instanceof Node &&
      event.currentTarget.contains(nextTarget)
    ) {
      return;
    }

    if (draftBody.trim().length === 0 && !createMutation.isPending) {
      setIsComposerFocused(false);
    }
  };

  const handleCancel = () => {
    setDraftBody('');
    setFormError(null);
    setIsComposerFocused(false);
    textareaRef.current?.blur();
  };

  const handleSubmit = () => {
    if (draftBody.trim().length === 0) {
      setFormError(t('notes.panel.form.validation.bodyRequired'));
      return;
    }

    setFormError(null);
    createMutation.mutate();
  };

  return (
    <section aria-labelledby={headingId} className={className ?? 'space-y-5'}>
      <h2 id={headingId} className="app-text-section-title text-ink">
        {commentsTitle}
      </h2>

      {!user && canCreateComment ? (
        <div className="space-y-2 border-y border-rule/60 py-4">
          <p className="app-text-body text-ink-2">
            {resolveLocalizedText(
              copy?.loginBody ?? {
                key: 'comments.panel.login.body',
                fallback: 'Sign in to join the conversation.',
              },
              t,
            )}
          </p>
          <Button
            variant="secondary"
            onClick={() => runAuthenticatedAction(() => undefined)}
          >
            {resolveLocalizedText(
              copy?.loginAction ?? {
                key: 'comments.panel.login.action',
                fallback: 'Sign in to comment',
              },
              t,
            )}
          </Button>
        </div>
      ) : user && canCreateComment ? (
        <CommentComposer
          bodyLabel={resolveLocalizedText(
            copy?.composerBodyLabel ?? {
              key: 'notes.panel.form.bodyLabel',
              fallback: 'Your note',
            },
            t,
          )}
          cancelLabel={t('notes.panel.form.cancel')}
          disabled={createMutation.isPending}
          error={formError}
          errorId={commentErrorId}
          fieldId={commentFieldId}
          isActive={isComposerActive}
          isSubmitting={createMutation.isPending}
          onBlurCapture={handleComposerBlur}
          onCancel={handleCancel}
          onChange={(value) => {
            setDraftBody(value);
            setFormError(null);
          }}
          onFocusCapture={() => {
            setIsComposerFocused(true);
          }}
          onSubmit={handleSubmit}
          placeholder={resolveLocalizedText(
            copy?.composerPlaceholder ?? {
              key: 'notes.panel.placeholder',
              fallback: 'Add a note to this passage...',
            },
            t,
          )}
          rows={1}
          submitDisabled={draftBody.trim().length === 0}
          submitLabel={resolveLocalizedText(
            copy?.composerSubmit ?? {
              key: 'notes.panel.form.submit',
              fallback: 'Publish note',
            },
            t,
          )}
          submittingLabel={resolveLocalizedText(
            copy?.composerSubmitting ?? {
              key: 'notes.panel.form.submitting',
              fallback: 'Publishing note...',
            },
            t,
          )}
          textareaRef={textareaRef}
          value={draftBody}
        />
      ) : null}

      {shouldRenderComments ? (
        isLoading ? (
          <LoadingState
            label={{ key: 'notes.list.loading', fallback: 'Loading notes...' }}
          />
        ) : error && !isFetchNextPageError ? (
          <ErrorState
            title={{
              key: 'notes.list.error.title',
              fallback: 'Unable to load notes',
            }}
            body={{
              key: 'notes.list.error.body',
              fallback:
                'The room is still available, but the notes discussion could not be opened.',
            }}
            action={
              <Button variant="secondary" onClick={() => void refetch()}>
                {t('errors.action.retry')}
              </Button>
            }
          />
        ) : comments.length ? (
          <div className="space-y-2">
            {comments.map((comment) => (
              <CommentWithReplies
                canCreateReply={canCreateComment}
                key={comment.id}
                comment={comment}
                onInteractionChange={onInteractionChange}
                queryKeyPrefix={commentsQueryKeyPrefix}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title={
              copy?.emptyTitle ?? {
                key: 'notes.panel.emptyTitle',
                fallback: 'No notes yet',
              }
            }
            body={
              copy?.emptyBody ?? {
                key: 'notes.panel.emptyBody.default',
                fallback:
                  'Comments will appear here once the conversation begins.',
              }
            }
          />
        )
      ) : null}

      {hasNextPage ? (
        <div className="space-y-2 pt-1">
          <Button
            disabled={isFetchingNextPage}
            isLoading={isFetchingNextPage}
            loadingLabel={t('notes.panel.loadingMore')}
            size="sm"
            variant="secondary"
            onClick={() => void fetchNextPage()}
          >
            {t('notes.panel.loadMore')}
          </Button>
          {isFetchNextPageError ? (
            <p className="text-sm text-brick" role="alert">
              {t('notes.panel.loadMoreError')}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
