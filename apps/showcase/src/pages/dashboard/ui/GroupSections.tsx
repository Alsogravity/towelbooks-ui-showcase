import { Link } from 'react-router';

import { BrowseSection } from '../../../components/layout';
import {
  Alert,
  Button,
  ButtonLink,
  Card,
  Icon,
  type IconName,
} from '../../../components/primitives';
import { UserAvatar } from '../../../entities/user/ui';
import type { CatalogWorkCoverFields } from '../../../entities/reading/ui';
import { ActivityTitleText } from '../../../features/room-activity/ActivityTitleText';
import {
  getActivityActorName,
  presentRoomActivityEvent,
  resolveActivityActorAvatar,
  type ActivityTitleSegment,
} from '../../../features/room-activity/roomActivityPresentation';
import type { RoomListItem } from '../../../features/rooms/types';
import { formatLocalizedRelativeTime, useI18n } from '../../../i18n';

import type { ViewerRoomActivityEvent } from '@towelbooks/schemas';

export function FromYourGroups({
  title,
  allLabel,
  activityEmptyBody,
  activityErrorBody,
  activityEvents,
  activityLoadingLabel,
  rooms,
  isActivityError,
  isActivityLoading,
  metaLabel,
  emptyBody,
  emptyFindLabel,
  emptyStartLabel,
  onActivityRetry,
}: {
  activityEmptyBody: string;
  activityErrorBody: string;
  activityEvents: ViewerRoomActivityEvent[];
  activityLoadingLabel: string;
  allLabel: string;
  rooms: RoomListItem[];
  emptyBody: string;
  emptyFindLabel: string;
  emptyStartLabel: string;
  isActivityError: boolean;
  isActivityLoading: boolean;
  metaLabel: string;
  onActivityRetry: () => void;
  title: string;
}) {
  const { locale, t } = useI18n();
  const isEmpty = rooms.length === 0;

  return (
    <BrowseSection
      title={title}
      titleAction={!isEmpty ? { ariaLabel: allLabel, to: '/rooms' } : undefined}
    >
      {isEmpty ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <p className="app-text-supporting-copy text-ink-2">{emptyBody}</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <ButtonLink
              to="/rooms"
              variant="secondary"
              prependIcon="search"
              className="w-full sm:w-auto"
            >
              {emptyFindLabel}
            </ButtonLink>
            <ButtonLink
              to="/rooms/create"
              prependIcon="plus"
              className="w-full sm:w-auto"
            >
              {emptyStartLabel}
            </ButtonLink>
          </div>
        </div>
      ) : isActivityLoading ? (
        <div
          aria-label={activityLoadingLabel}
          className="flex flex-col gap-2.5"
          role="status"
        >
          {[0, 1, 2, 3].map((item) => (
            <Card
              className="flex items-center gap-3 p-3"
              key={item}
              padding={false}
            >
              <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-vellum" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3.5 w-3/4 animate-pulse rounded bg-vellum" />
                <div className="h-3 w-40 animate-pulse rounded bg-vellum/80" />
              </div>
            </Card>
          ))}
        </div>
      ) : isActivityError ? (
        <Alert variant="warning">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{activityErrorBody}</span>
            <Button onClick={onActivityRetry} size="sm" variant="secondary">
              {t('errors.action.retry')}
            </Button>
          </div>
        </Alert>
      ) : activityEvents.length === 0 ? (
        <p className="app-text-supporting-copy text-ink-2">
          {activityEmptyBody}
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {activityEvents.map((event) => {
            const presentation = presentRoomActivityEvent(event, t, locale, {
              roomName: event.room.name,
            });
            const actorName = getActivityActorName(event.actor, t);
            const readingCover = resolveActivityReadingCover(event, rooms);
            const relativeTime = formatLocalizedRelativeTime({
              locale,
              timestamp: event.createdAt,
              justNowLabel: t('common.relativeTime.justNow'),
            });
            const meta =
              relativeTime === null
                ? metaLabel
                : t('dashboard.groups.activity.metaRelative', {
                    values: {
                      time: relativeTime,
                    },
                  });

            return (
              <GroupActivityRow
                key={event.id}
                actorAvatar={resolveActivityActorAvatar(event.actor, actorName)}
                actorName={actorName}
                roomName={event.room.name}
                href={presentation.href ?? `/rooms/${event.room.id}`}
                meta={meta}
                icon={presentation.icon}
                readingCover={readingCover}
                titleSegments={presentation.titleSegments}
              />
            );
          })}
        </div>
      )}
    </BrowseSection>
  );
}

function GroupActivityRow({
  actorAvatar,
  actorName,
  roomName,
  href,
  meta,
  icon,
  readingCover,
  titleSegments,
}: {
  actorAvatar: ReturnType<typeof resolveActivityActorAvatar>;
  actorName: string;
  roomName: string;
  href: string;
  icon: IconName;
  meta: string;
  readingCover: CatalogWorkCoverFields | null;
  titleSegments: readonly ActivityTitleSegment[];
}) {
  return (
    <Link
      className="block rounded-[var(--radius-paper-4)] no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brick"
      to={href}
    >
      <Card
        interactive
        padding={false}
        className="transition-colors hover:bg-paper-2"
      >
        <div className="flex items-center gap-3 p-3">
          <UserAvatar
            avatar={actorAvatar}
            decorative
            displayName={actorName}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <ActivityTitleText
              className="app-text-row-title text-ink"
              iconSize={12}
              nonEmphasisClassName="font-normal"
              readingCover={readingCover}
              segments={titleSegments}
            />
            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
              <Icon name={icon} size={11} className="text-ink-3" />
              <span className="app-text-metadata truncate font-medium text-ink-3">
                {roomName}
              </span>
              <span aria-hidden="true" className="app-text-metadata text-ink-4">
                ·
              </span>
              <span className="app-text-metadata text-ink-3">{meta}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function resolveActivityReadingCover(
  event: ViewerRoomActivityEvent,
  rooms: RoomListItem[],
): CatalogWorkCoverFields | null {
  const currentReading = rooms.find(
    (room) => room.id === event.room.id,
  )?.currentReading;

  if (!currentReading) {
    return null;
  }

  const href = event.metadata.href;
  const currentReadingHref = `/rooms/${event.room.id}/readings/${currentReading.id}`;

  if (typeof href !== 'string' || href !== currentReadingHref) {
    return null;
  }

  return currentReading.work.display;
}
