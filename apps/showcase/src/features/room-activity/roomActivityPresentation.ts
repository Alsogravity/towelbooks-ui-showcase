import {
  buildLocalizedSegments,
  type AppLocale,
  type TranslationSegment,
  type useI18n,
} from '../../i18n';

import {
  buildAvatar,
  type ActivityActor,
  type ActivityEvent,
  type ActivityEventSource,
  type Avatar,
  type CoverGeometry,
} from '@towelbooks/schemas';

import type { IconName } from '../../components/primitives';

type Translate = ReturnType<typeof useI18n>['t'];

export type ActivityTitleSegment = TranslationSegment & {
  icon?: IconName;
};

export type RoomActivityPresentation = {
  body: string | null;
  catalogWorkPreview: ActivityCatalogWorkPreview | null;
  href: string | null;
  icon: IconName;
  title: string;
  titleSegments: readonly ActivityTitleSegment[];
};

export type RoomActivityPresentationOptions = {
  roomName?: string;
};

export type ActivityCatalogWorkPreview = {
  author: string | null;
  coverGeometry: CoverGeometry | null;
  coverThumbnailUrl: string | null;
  coverUrl: string | null;
  catalogWorkId: string | null;
  title: string;
};

export function getActivityActorName(
  actor: ActivityActor | null,
  t: Translate,
): string {
  if (!actor) {
    return t('rooms.detail.activity.actorFallback');
  }

  return actor.displayName ?? `@${actor.username}`;
}

export function resolveActivityActorAvatar(
  actor: ActivityActor | null,
  actorName: string,
): Avatar {
  if (actor?.avatar) {
    return actor.avatar;
  }

  return buildAvatar({
    avatarBackground: null,
    avatarImageUrl: null,
    displayName: actorName,
    username: actor?.username ?? null,
  });
}

export function presentRoomActivityEvent(
  event: ActivityEvent,
  t: Translate,
  locale: AppLocale,
  options: RoomActivityPresentationOptions = {},
): RoomActivityPresentation {
  const metadata = event.metadata;
  const source = event.source;
  const actorName = getActivityActorName(event.actor, t);
  const href = readString(metadata, 'href');

  switch (event.type) {
    case 'room.announcement_created': {
      const announcementTitle = resolveAnnouncementTitle(source, metadata);

      return finalizePresentation({
        body: resolveAnnouncementBody(source, metadata),
        href,
        icon: 'info',
        titleSegments: announcementTitle
          ? buildLocalizedSegments(
              locale,
              'rooms.detail.activity.event.announcementCreated.withTitle',
              { actorName, title: announcementTitle },
              ['actorName', 'title'],
            )
          : buildLocalizedSegments(
              locale,
              'rooms.detail.activity.event.announcementCreated',
              { actorName },
              ['actorName'],
            ),
      });
    }
    case 'room.meeting_created':
    case 'room.meeting_updated':
    case 'room.meeting_cancelled': {
      const meetingTitle = resolveMeetingTitle(metadata, t);
      const isCancelled = event.type === 'room.meeting_cancelled';
      const eventKey =
        event.type === 'room.meeting_cancelled'
          ? 'rooms.detail.activity.event.meetingCancelled'
          : event.type === 'room.meeting_updated'
            ? 'rooms.detail.activity.event.meetingUpdated'
            : 'rooms.detail.activity.event.meetingCreated';

      return finalizePresentation({
        body: null,
        href,
        icon: isCancelled ? 'calendar-x' : 'calendar',
        titleSegments: buildLocalizedSegments(
          locale,
          eventKey,
          { actorName, meetingTitle },
          ['actorName', 'meetingTitle'],
        ),
      });
    }
    case 'room.member_joined':
      return finalizePresentation({
        body: null,
        href,
        icon: 'users-glyph',
        titleSegments: options.roomName
          ? buildLocalizedSegments(
              locale,
              'rooms.detail.activity.event.memberJoined.withRoom',
              { memberName: actorName, roomName: options.roomName },
              ['memberName', 'roomName'],
            )
          : buildLocalizedSegments(
              locale,
              'rooms.detail.activity.event.memberJoined',
              { memberName: actorName },
              ['memberName'],
            ),
      });
    case 'room.note_created': {
      const noteReadingTitle = tryResolveReadingTitle(source, metadata);

      return finalizePresentation({
        body: resolveNotePreview(source, metadata),
        href,
        icon: 'message-square-quote',
        titleSegments: noteReadingTitle
          ? buildLocalizedSegments(
              locale,
              'rooms.detail.activity.event.noteCreated.withReading',
              {
                actorName,
                readingTitle: noteReadingTitle,
              },
              ['actorName', 'readingTitle'],
            )
          : buildLocalizedSegments(
              locale,
              'rooms.detail.activity.event.noteCreated',
              { actorName },
              ['actorName'],
            ),
      });
    }
    case 'room.discussion_created': {
      const discussionTitle = resolveDiscussionTitle(source, metadata, t);

      return finalizePresentation({
        body:
          readString(metadata, 'excerpt') ??
          readString(metadata, 'body') ??
          null,
        href,
        icon: 'message-circle',
        titleSegments: buildLocalizedSegments(
          locale,
          'rooms.detail.activity.event.discussionCreated',
          { actorName, discussionTitle },
          ['actorName', 'discussionTitle'],
        ),
      });
    }
    case 'room.poll_created': {
      const pollTitle = resolvePollTitle(source, metadata, t);

      return finalizePresentation({
        body: null,
        href,
        icon: 'poll-glyph',
        titleSegments: buildLocalizedSegments(
          locale,
          'rooms.detail.activity.event.pollCreated',
          { actorName, pollTitle },
          ['actorName', 'pollTitle'],
        ),
      });
    }
    case 'room.poll_closed': {
      const pollTitle = resolvePollTitle(source, metadata, t);
      const topResult = source.poll?.topResultsPreview?.[0];
      const topResultLabel = topResult?.label ?? null;

      return finalizePresentation({
        body:
          topResultLabel && topResult
            ? t('rooms.detail.activity.event.pollClosed.body', {
                values: {
                  label: topResultLabel,
                  percentage: topResult.percentage,
                },
              })
            : null,
        href,
        icon: 'poll-glyph',
        titleSegments: buildLocalizedSegments(
          locale,
          'rooms.detail.activity.event.pollClosed',
          { pollTitle },
          ['pollTitle'],
        ),
      });
    }
    case 'room.reading_created':
    case 'room.reading_finished': {
      const readingTitle =
        tryResolveReadingTitle(source, metadata) ??
        t('rooms.detail.activity.readingFallback');
      const eventKey =
        event.type === 'room.reading_finished'
          ? 'rooms.detail.activity.event.readingFinished'
          : 'rooms.detail.activity.event.readingCreated';

      return finalizePresentation({
        body:
          readString(metadata, 'description') ??
          readString(metadata, 'readingDescription') ??
          null,
        catalogWorkPreview:
          event.type === 'room.reading_created'
            ? resolveReadingCatalogWorkPreview(source, readingTitle)
            : null,
        href,
        icon: 'book',
        titleSegments: buildLocalizedSegments(
          locale,
          eventKey,
          { actorName, readingTitle },
          ['actorName', 'readingTitle'],
        ),
      });
    }
    default:
      return finalizePresentation({
        body: readString(metadata, 'body') ?? null,
        href,
        icon: 'info',
        titleSegments: buildLocalizedSegments(
          locale,
          'rooms.detail.activity.event.announcementCreated',
          { actorName },
          ['actorName'],
        ),
      });
  }
}

function tryResolveReadingTitle(
  source: ActivityEventSource,
  metadata: ActivityEvent['metadata'],
): string | null {
  return (
    source.reading?.title ??
    source.note?.readingTitle ??
    readString(metadata, 'readingTitle') ??
    readString(metadata, 'title')
  );
}

function resolveDiscussionTitle(
  source: ActivityEventSource,
  metadata: ActivityEvent['metadata'],
  t: Translate,
): string {
  return (
    source.discussion?.title ??
    readString(metadata, 'discussionTitle') ??
    readString(metadata, 'title') ??
    t('rooms.detail.discussions.discussionFallback')
  );
}

function resolvePollTitle(
  source: ActivityEventSource,
  metadata: ActivityEvent['metadata'],
  t: Translate,
): string {
  return (
    source.poll?.title ??
    readString(metadata, 'pollTitle') ??
    readString(metadata, 'title') ??
    t('rooms.detail.community.polls.pollFallback')
  );
}

function resolveMeetingTitle(
  metadata: ActivityEvent['metadata'],
  t: Translate,
): string {
  return (
    readString(metadata, 'meetingTitle') ??
    readString(metadata, 'title') ??
    t('rooms.detail.meetings.meetingFallback')
  );
}

function resolveAnnouncementTitle(
  source: ActivityEventSource,
  metadata: ActivityEvent['metadata'],
): string | null {
  const title = source.announcement?.title ?? readString(metadata, 'title');

  return title;
}

function resolveAnnouncementBody(
  source: ActivityEventSource,
  metadata: ActivityEvent['metadata'],
): string | null {
  return (
    source.announcement?.body ??
    readString(metadata, 'body') ??
    readString(metadata, 'announcementBody') ??
    null
  );
}

function resolveNotePreview(
  source: ActivityEventSource,
  metadata: ActivityEvent['metadata'],
): string | null {
  return (
    source.note?.preview ??
    readString(metadata, 'excerpt') ??
    readString(metadata, 'noteExcerpt') ??
    readString(metadata, 'commentPreview') ??
    null
  );
}

function resolveReadingCatalogWorkPreview(
  source: ActivityEventSource,
  fallbackTitle: string,
): ActivityCatalogWorkPreview {
  const reading = source.reading;

  if (!reading) {
    return {
      author: null,
      coverGeometry: null,
      coverThumbnailUrl: null,
      coverUrl: null,
      catalogWorkId: null,
      title: fallbackTitle,
    };
  }

  return {
    author: reading.author,
    coverGeometry: reading.coverGeometry ?? null,
    coverThumbnailUrl: reading.coverThumbnailUrl,
    coverUrl: reading.coverUrl,
    catalogWorkId: reading.catalogWorkId,
    title: reading.title,
  };
}

function scopeIconForKey(key: string | undefined): IconName | undefined {
  switch (key) {
    case 'readingTitle':
      return 'book';
    case 'discussionTitle':
    case 'pollTitle':
      return 'discussion-glyph';
    case 'meetingTitle':
      return 'calendar';
    case 'roomName':
      return 'users-glyph';
    case 'title':
      return 'megaphone-glyph';
    default:
      return undefined;
  }
}

function finalizePresentation(
  presentation: Omit<
    RoomActivityPresentation,
    'title' | 'catalogWorkPreview'
  > & {
    catalogWorkPreview?: ActivityCatalogWorkPreview | null;
  },
): RoomActivityPresentation {
  const titleSegments = presentation.titleSegments.map(
    (segment): ActivityTitleSegment => {
      const icon = scopeIconForKey(segment.key);

      return icon ? { ...segment, icon } : segment;
    },
  );

  return {
    ...presentation,
    catalogWorkPreview: presentation.catalogWorkPreview ?? null,
    title: titleSegments.map((segment) => segment.text).join(''),
    titleSegments,
  };
}

function readString(
  metadata: ActivityEvent['metadata'],
  key: string,
): string | null {
  const value = metadata[key];

  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}
