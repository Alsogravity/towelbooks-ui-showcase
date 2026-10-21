import { Link } from 'react-router';

import { ActivityTitleText } from './ActivityTitleText';
import {
  getActivityActorName,
  presentRoomActivityEvent,
  resolveActivityActorAvatar,
} from './roomActivityPresentation';
import { CatalogWorkCandidateRow } from '../../entities/reading/ui';
import { UserAvatar } from '../../entities/user/ui';
import { Icon } from '../../components/primitives';
import { formatLocalizedRelativeTime, useI18n } from '../../i18n';

import type { ActivityEvent } from '@towelbooks/schemas';

type RoomActivityItemProps = {
  event: ActivityEvent;
};

export function RoomActivityItem({ event }: RoomActivityItemProps) {
  const { formatDateTime, locale, t } = useI18n();
  const presentation = presentRoomActivityEvent(event, t, locale);
  const actorName = getActivityActorName(event.actor, t);
  const actorAvatar = resolveActivityActorAvatar(event.actor, actorName);
  const relativeTime =
    formatLocalizedRelativeTime({
      locale,
      timestamp: event.createdAt,
      justNowLabel: t('common.relativeTime.justNow'),
    }) ?? formatDateTime(event.createdAt);
  const absoluteTime = formatDateTime(event.createdAt);
  const catalogWorkPreview = presentation.catalogWorkPreview;
  const bookAuthor =
    catalogWorkPreview?.author?.trim() || t('myLibrary.common.noContributor');

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
              dateTime={event.createdAt}
              title={absoluteTime}
            >
              {relativeTime}
            </time>
          </div>
        </div>
      </div>
      {catalogWorkPreview ? (
        <CatalogWorkCandidateRow
          author={bookAuthor}
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
      {presentation.body ? (
        <p
          aria-hidden={presentation.href ? true : undefined}
          className="w-full rounded-xl border-l-4 border-brick/25 bg-ink/5 p-4 text-sm leading-6 text-ink-2"
        >
          {presentation.body}
        </p>
      ) : null}
    </>
  );

  if (presentation.href) {
    return (
      <Link
        aria-label={presentation.title}
        className="group flex w-full flex-col gap-2 rounded-2xl px-2 py-3 transition-colors hover:bg-paper-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brick"
        to={presentation.href}
      >
        {content}
      </Link>
    );
  }

  return <div className="flex flex-col gap-2 px-2 py-3">{content}</div>;
}
