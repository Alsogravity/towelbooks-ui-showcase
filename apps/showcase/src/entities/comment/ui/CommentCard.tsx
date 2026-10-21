import { MENTION_PATTERN, type AppLocale } from '@towelbooks/schemas';
import { Link } from 'react-router';

import { getProfilePath } from '../../../app/profileRoutes';
import {
  ActionMenu,
  Avatar,
  Icon,
  LikeButton,
} from '../../../components/primitives';
import { useI18n } from '../../../i18n';

import type { Comment } from '@towelbooks/schemas';
import type { ReactNode } from 'react';

interface CommentCardProps {
  comment: Comment;
  editComposer?: ReactNode;
  isEditing?: boolean;
  isDeletePending?: boolean;
  isLikePending?: boolean;
  isRepliesExpanded?: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
  onLikeToggle?: () => void;
  onRepliesToggle?: () => void;
  onReport?: () => void;
  onReplyToggle?: () => void;
  replies?: ReactNode;
  replyComposer?: ReactNode;
}

const minuteInSeconds = 60;
const hourInSeconds = 60 * minuteInSeconds;
const dayInSeconds = 24 * hourInSeconds;
const weekInSeconds = 7 * dayInSeconds;
const monthInSeconds = 30 * dayInSeconds;
const yearInSeconds = 365 * dayInSeconds;

function formatRelativeCommentTime(
  createdAt: string,
  locale: AppLocale,
  justNowLabel: string,
) {
  const elapsedSeconds = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / 1000,
  );

  if (elapsedSeconds < minuteInSeconds) {
    return justNowLabel;
  }

  const formatter = new Intl.RelativeTimeFormat(locale, {
    numeric: 'always',
  });

  if (elapsedSeconds < hourInSeconds) {
    return formatter.format(
      -Math.floor(elapsedSeconds / minuteInSeconds),
      'minute',
    );
  }

  if (elapsedSeconds < dayInSeconds) {
    return formatter.format(
      -Math.floor(elapsedSeconds / hourInSeconds),
      'hour',
    );
  }

  if (elapsedSeconds < weekInSeconds) {
    return formatter.format(-Math.floor(elapsedSeconds / dayInSeconds), 'day');
  }

  if (elapsedSeconds < monthInSeconds) {
    return formatter.format(
      -Math.floor(elapsedSeconds / weekInSeconds),
      'week',
    );
  }

  if (elapsedSeconds < yearInSeconds) {
    return formatter.format(
      -Math.floor(elapsedSeconds / monthInSeconds),
      'month',
    );
  }

  return formatter.format(-Math.floor(elapsedSeconds / yearInSeconds), 'year');
}

/**
 * Renders the comment body, turning `@username` tokens into links to the
 * mentioned reader's profile while leaving the surrounding text untouched.
 */
function renderCommentBody(body: string): ReactNode[] {
  const segments: ReactNode[] = [];
  let lastIndex = 0;
  let mentionKey = 0;

  for (const match of body.matchAll(MENTION_PATTERN)) {
    const matchStart = match.index ?? 0;
    const boundary = match[1] ?? '';
    const username = match[2] ?? '';
    const mentionStart = matchStart + boundary.length;

    if (mentionStart > lastIndex) {
      segments.push(body.slice(lastIndex, mentionStart));
    }

    segments.push(
      <Link
        key={`mention-${mentionKey}`}
        to={getProfilePath({ username })}
        className="font-semibold text-accent no-underline hover:underline"
      >
        @{username}
      </Link>,
    );

    mentionKey += 1;
    lastIndex = mentionStart + username.length + 1;
  }

  if (lastIndex < body.length) {
    segments.push(body.slice(lastIndex));
  }

  return segments;
}

export function CommentCard({
  comment,
  editComposer,
  isEditing = false,
  isDeletePending = false,
  isLikePending = false,
  isRepliesExpanded = false,
  onDelete,
  onEdit,
  onLikeToggle,
  onRepliesToggle,
  onReport,
  onReplyToggle,
  replies,
  replyComposer,
}: CommentCardProps) {
  const { locale, t } = useI18n();
  const authorName = comment.author.displayName ?? comment.author.username;
  const userHandle = `@${comment.author.username}`;
  const createdAt = formatRelativeCommentTime(
    comment.createdAt,
    locale,
    t('common.relativeTime.justNow'),
  );
  const likesCount = comment.reactions.counts.like;
  const hasReplies = comment.replyCount > 0;
  // The vertical connector rail under the avatar is only shown while the reply
  // thread below is rendered, so it visually links into the curved connectors.
  const showConnectorRail = Boolean(replies);
  const isDeleted = comment.author.username === 'deleted';
  const isTombstone = comment.deletedAt !== null;
  const isLiked = comment.reactions.viewerReaction === 'like';
  const profilePath = getProfilePath({ username: comment.author.username });
  const menuLabel = t('notes.card.action.menu');
  const menuItems = [
    ...(onReport
      ? [
          {
            id: 'report-comment',
            kind: 'action' as const,
            icon: 'flag' as const,
            label: t('reports.action.report'),
            onSelect: onReport,
          },
        ]
      : []),
    ...(onEdit && !isTombstone
      ? [
          {
            id: 'edit-comment',
            kind: 'action' as const,
            disabled: isEditing,
            icon: 'pencil-line' as const,
            label: t('notes.card.action.edit'),
            onSelect: onEdit,
          },
        ]
      : []),
    ...(comment.viewerCanDelete && onDelete && !isTombstone
      ? [
          {
            id: 'delete-comment',
            kind: 'action' as const,
            disabled: isDeletePending,
            icon: 'trash-2' as const,
            label: t('notes.card.action.remove'),
            onSelect: () => {
              onDelete();
            },
            tone: 'danger' as const,
          },
        ]
      : []),
  ];

  return (
    <div>
      <article className="grid grid-cols-[2.25rem_1fr] gap-x-4">
        <div className="flex flex-col items-center">
          <div className="pt-1.5">
            {isDeleted ? (
              <Avatar
                initial={comment.author.avatar.initial}
                background={comment.author.avatar.background}
                foreground={comment.author.avatar.foreground}
                imageUrl={comment.author.avatar.imageUrl}
                imageAlt={authorName}
                size="md"
              />
            ) : (
              <Link to={profilePath}>
                <Avatar
                  initial={comment.author.avatar.initial}
                  background={comment.author.avatar.background}
                  foreground={comment.author.avatar.foreground}
                  imageUrl={comment.author.avatar.imageUrl}
                  imageAlt={authorName}
                  size="md"
                />
              </Link>
            )}
          </div>
          {showConnectorRail && <div className="mt-1 w-px flex-1 bg-rule/30" />}
        </div>

        <div className="relative min-w-0 space-y-1 pb-4">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 pr-10">
            {isDeleted ? (
              <p className="app-text-row-title text-ink">{userHandle}</p>
            ) : (
              <Link
                to={profilePath}
                className="app-text-row-title text-ink no-underline"
              >
                {userHandle}
              </Link>
            )}
            <p className="app-text-metadata text-ink-3">{createdAt}</p>
          </div>
          <div className="absolute right-0 top-0">
            <ActionMenu
              ariaLabel={menuLabel}
              contentClassName="w-48"
              placement="bottom-end"
              sections={[
                {
                  id: `comment-actions-${comment.id}`,
                  items: menuItems,
                },
              ]}
              activator={({ activatorProps, ref }) => (
                <button
                  ref={ref}
                  type="button"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-0 bg-transparent text-ink-4 transition-colors hover:bg-paper-2 hover:text-ink"
                  aria-label={menuLabel}
                  {...activatorProps}
                >
                  <Icon name="ellipsis-vertical" size={16} strokeWidth={2.5} />
                </button>
              )}
            />
          </div>

          {!isTombstone && comment.citation ? (
            <p className="app-text-metadata text-ink-4">{comment.citation}</p>
          ) : null}

          {!isEditing ? (
            <p
              className={`app-text-body ${isTombstone ? 'italic text-ink-3' : 'text-ink'}`}
            >
              {comment.body
                ? renderCommentBody(comment.body)
                : t('notes.card.deletedBody')}
            </p>
          ) : (
            editComposer
          )}

          <div className="flex items-center gap-4 pt-0.5">
            <LikeButton
              aria-label={t(
                isLiked ? 'notes.card.action.unlike' : 'notes.card.action.like',
              )}
              buttonClassName="!h-5 !w-5 !p-0 text-ink-4 hover:!bg-transparent hover:!text-ink"
              count={likesCount}
              countClassName="app-text-caption text-ink-3"
              disabled={
                isLikePending || isTombstone || onLikeToggle === undefined
              }
              iconSize={16}
              isLiked={isLiked}
              isLoading={isLikePending}
              onClick={onLikeToggle}
            />

            {onReplyToggle ? (
              <button
                type="button"
                className="app-text-caption font-bold text-ink-4 transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isTombstone}
                onClick={onReplyToggle}
              >
                {t('notes.card.action.reply')}
              </button>
            ) : null}
          </div>

          {replyComposer}

          {hasReplies && (
            <div className="pt-1">
              <button
                type="button"
                className="group flex items-center gap-2 rounded-full py-1.5 pl-3 pr-2 transition-colors hover:bg-rule/10"
                aria-controls={
                  isRepliesExpanded ? `${comment.id}-replies` : undefined
                }
                aria-expanded={isRepliesExpanded}
                onClick={onRepliesToggle}
              >
                <span className="app-text-label text-accent group-hover:text-accent">
                  {t(
                    comment.replyCount === 1
                      ? 'notes.card.replies_one'
                      : 'notes.card.replies_other',
                    { values: { count: comment.replyCount } },
                  )}
                </span>
                <div
                  className={`flex h-6 w-6 items-center justify-center text-accent transition-transform ${isRepliesExpanded ? 'rotate-180' : ''}`}
                >
                  <Icon name="chevron-down" size={18} />
                </div>
              </button>
            </div>
          )}
        </div>
      </article>

      {replies}
    </div>
  );
}
