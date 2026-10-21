import { type IncomingFollowRequestItem } from '@towelbooks/schemas';
import { Link, useNavigate } from 'react-router';
import { useState } from 'react';

import { NotificationRichMessage } from '../notifications/NotificationRichMessage';
import { useNotificationsPanel } from '../notifications/NotificationsPanelContext';
import { Avatar, Button } from '../../components/primitives';
import {
  formatNotificationTimestamp,
  useI18n,
  type TranslationSegment,
} from '../../i18n';
import { useFollowRequestActions } from './useFollowRequestActions';

type FollowRequestRowVariant = 'feed' | 'detail';

type FollowRequestRowProps = {
  isUnreadHighlighted?: boolean;
  request: IncomingFollowRequestItem;
  variant?: FollowRequestRowVariant;
};

const rowClassName =
  'flex w-full min-w-0 items-center gap-3 rounded-[var(--radius-paper-4)] px-3 py-3';

const profileActionClassName =
  'flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-[var(--radius-paper-4)] text-left transition-colors hover:bg-paper-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick/40';

export function FollowRequestRow({
  isUnreadHighlighted: _isUnreadHighlighted = false,
  request,
  variant = 'detail',
}: FollowRequestRowProps) {
  const { formatDateTime, locale, t } = useI18n();
  const navigate = useNavigate();
  const { close } = useNotificationsPanel();
  const followRequestActions = useFollowRequestActions();
  const [pendingAction, setPendingAction] = useState<
    'accept' | 'decline' | null
  >(null);
  const displayName =
    request.requester.displayName?.trim() || request.requester.username;
  const timestamp =
    formatNotificationTimestamp(request.createdAt, locale) ??
    formatDateTime(request.createdAt);
  const isPending = pendingAction !== null;
  const feedSegments: readonly TranslationSegment[] = [
    {
      emphasis: true,
      key: 'requesterUsername',
      text: request.requester.username,
    },
    {
      emphasis: false,
      key: 'feedAction',
      text: t('notifications.followRequests.feedAction'),
    },
  ];
  const profilePath = `/${request.requester.username}`;
  const profileButtonLabel = t(
    'notifications.followRequests.profileLinkLabel',
    {
      values: { username: request.requester.username },
    },
  );

  const handleAction = (action: 'accept' | 'decline') => {
    setPendingAction(action);
    followRequestActions.mutate(
      {
        action,
        requestId: request.id,
        requesterUsername: request.requester.username,
      },
      {
        onSettled: () => {
          setPendingAction(null);
        },
      },
    );
  };

  const openProfile = () => {
    close();
    navigate(profilePath);
  };

  const actionButtons = (
    <div className="relative z-10 flex shrink-0 items-center gap-2">
      <Button
        disabled={isPending}
        isLoading={pendingAction === 'accept'}
        loadingLabel={t('notifications.followRequests.accepting')}
        onClick={() => handleAction('accept')}
        size="sm"
        type="button"
        variant="primary"
      >
        {t('notifications.followRequests.accept')}
      </Button>
      <Button
        disabled={isPending}
        isLoading={pendingAction === 'decline'}
        loadingLabel={t('notifications.followRequests.declining')}
        onClick={() => handleAction('decline')}
        size="sm"
        type="button"
        variant="secondary"
      >
        {t('notifications.followRequests.decline')}
      </Button>
    </div>
  );

  if (variant === 'detail') {
    return (
      <article className={rowClassName}>
        <button
          aria-label={profileButtonLabel}
          className={profileActionClassName}
          onClick={openProfile}
          type="button"
        >
          <span className="flex size-11 shrink-0 items-center justify-center">
            <Avatar
              background={request.requester.avatar.background}
              foreground={request.requester.avatar.foreground}
              imageAlt={displayName}
              imageUrl={request.requester.avatar.imageUrl}
              initial={request.requester.avatar.initial}
              size="lg"
            />
          </span>

          <span className="min-w-0">
            <span className="app-text-row-title block truncate text-ink">
              {displayName}
            </span>
            <span className="mt-0.5 block truncate text-xs text-ink-3">
              {t('profile.handle', {
                values: { handle: request.requester.username },
              })}
            </span>
            {request.requester.bio ? (
              <span className="mt-1 line-clamp-2 block text-xs text-ink-3">
                {request.requester.bio}
              </span>
            ) : null}
          </span>
        </button>

        {actionButtons}
      </article>
    );
  }

  return (
    <article className={rowClassName}>
      <Link
        aria-label={profileButtonLabel}
        className="shrink-0 rounded-full transition-colors hover:bg-paper-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick/40"
        to={profilePath}
      >
        <Avatar
          background={request.requester.avatar.background}
          foreground={request.requester.avatar.foreground}
          imageAlt={displayName}
          imageUrl={request.requester.avatar.imageUrl}
          initial={request.requester.avatar.initial}
          size="lg"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <NotificationRichMessage
          className="app-text-body-sm"
          createdAt={request.createdAt}
          segments={feedSegments}
          timestamp={timestamp}
        />
      </div>

      {actionButtons}
    </article>
  );
}
