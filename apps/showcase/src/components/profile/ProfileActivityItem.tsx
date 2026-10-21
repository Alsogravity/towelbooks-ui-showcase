import { Link } from 'react-router';

import { ActivityEventSocial } from '../../features/profile/ActivityEventSocial';
import { ActivityTitleText } from '../../features/room-activity/ActivityTitleText';
import {
  getActivityActorName,
  presentProfileActivityEvent,
  resolveActivityActorAvatar,
} from './profileActivityPresentation';
import { CatalogWorkCandidateRow } from '../../entities/reading/ui';
import { UserAvatar } from '../../entities/user/ui';
import { Icon } from '../../components/primitives';
import { formatLocalizedRelativeTime, useI18n } from '../../i18n';

import type { ActivityEvent } from '@towelbooks/schemas';

type ProfileActivityItemProps = {
  event: ActivityEvent;
  username: string;
};

export function ProfileActivityItem({
  event,
  username,
}: ProfileActivityItemProps) {
  const { formatDateTime, locale, t } = useI18n();
  const presentation = presentProfileActivityEvent(event, t, locale);
  const actorName = getActivityActorName(event.actor, t);
  const actorAvatar = resolveActivityActorAvatar(event.actor, actorName);
  const relativeTime =
    formatLocalizedRelativeTime({
      locale,
      timestamp: event.occurredAt,
      justNowLabel: t('common.relativeTime.justNow'),
    }) ?? formatDateTime(event.occurredAt);
  const absoluteTime = formatDateTime(event.occurredAt);
  const catalogWorkPreview = presentation.catalogWorkPreview;
  const detail = presentation.detail;
  const body = presentation.body;

  const content = (
    <>
      <div className="flex items-center gap-4">
        {event.actor ? (
          <UserAvatar
            avatar={actorAvatar}
            decorative
            displayName={actorName}
            size="lg"
          />
        ) : (
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink/5">
            <Icon name={presentation.icon} size={20} strokeWidth={1.75} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <ActivityTitleText
              className="text-base leading-6 text-ink"
              iconSize={18}
              segments={presentation.titleSegments}
            />
            <span aria-hidden="true" className="text-sm text-ink-4">
              ·
            </span>
            <time
              className="text-sm text-ink-3"
              dateTime={event.occurredAt}
              title={absoluteTime}
            >
              {relativeTime}
            </time>
          </div>
          {detail ? (
            <p className="mt-1 text-sm leading-5 text-ink-3">{detail.label}</p>
          ) : null}
        </div>
      </div>
      {catalogWorkPreview ? (
        <CatalogWorkCandidateRow
          author={
            catalogWorkPreview.author?.trim() ||
            t('myLibrary.common.noContributor')
          }
          className="w-full"
          coverDelivery={{ loading: 'lazy', preferredVariant: 'detail' }}
          coverGeometry={catalogWorkPreview.coverGeometry}
          coverThumbnailUrl={catalogWorkPreview.coverThumbnailUrl}
          coverUrl={catalogWorkPreview.coverUrl}
          themeSeed={
            catalogWorkPreview.catalogWorkId ?? catalogWorkPreview.title
          }
          title={catalogWorkPreview.title}
        />
      ) : null}
      {body ? (
        <blockquote className="app-text-body whitespace-pre-wrap text-ink">
          {body}
        </blockquote>
      ) : null}
    </>
  );

  const activityContent = presentation.href ? (
    <Link
      aria-label={presentation.title}
      className="group flex w-full flex-col gap-2 rounded-2xl px-2 py-3 transition-colors hover:bg-paper-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brick"
      to={presentation.href}
    >
      {content}
    </Link>
  ) : (
    <div className="flex flex-col gap-2 px-2 py-3">{content}</div>
  );

  return (
    <div className="space-y-1">
      {activityContent}
      <ActivityEventSocial event={event} username={username} />
    </div>
  );
}
