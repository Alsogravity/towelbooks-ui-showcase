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
  type Avatar,
  type CoverGeometry,
} from '@towelbooks/schemas';

import type { IconName } from '../../components/primitives';

type Translate = ReturnType<typeof useI18n>['t'];

export type ActivityTitleSegment = TranslationSegment & {
  icon?: IconName;
};

export type ProfileActivityPresentation = {
  body: string | null;
  catalogWorkPreview: ActivityCatalogWorkPreview | null;
  detail: ProfileActivityItemDetail | null;
  href: string | null;
  icon: IconName;
  title: string;
  titleSegments: readonly ActivityTitleSegment[];
};

export type ActivityCatalogWorkPreview = {
  author: string | null;
  coverGeometry: CoverGeometry | null;
  coverThumbnailUrl: string | null;
  coverUrl: string | null;
  catalogWorkId: string | null;
  title: string;
};

export type ProfileActivityItemDetail = {
  label: string;
};

export function getActivityActorName(
  actor: ActivityActor | null,
  t: Translate,
): string {
  if (!actor) {
    return t('profile.feed.actorFallback');
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

export function presentProfileActivityEvent(
  event: ActivityEvent,
  t: Translate,
  locale: AppLocale,
): ProfileActivityPresentation {
  const source = event.source;
  const actorName = getActivityActorName(event.actor, t);
  const href = readHref(event.metadata);

  switch (event.type) {
    case 'user.reading_finished': {
      const readingSource = source.reading;
      const readingTitle = readingSource?.title ?? '';

      return finalizePresentation({
        body: null,
        catalogWorkPreview: readingSource
          ? {
              author: readingSource.author,
              coverGeometry: readingSource.coverGeometry ?? null,
              coverThumbnailUrl: readingSource.coverThumbnailUrl,
              coverUrl: readingSource.coverUrl,
              catalogWorkId: readingSource.catalogWorkId,
              title: readingTitle,
            }
          : null,
        detail: null,
        href,
        icon: 'book-check',
        titleSegments: buildLocalizedSegments(
          locale,
          'profile.feed.event.readingFinished',
          { actorName, readingTitle },
          ['actorName', 'readingTitle'],
        ),
      });
    }

    case 'user.rating_created': {
      const reviewSource = source.rating;
      const catalogWorkTitle = reviewSource?.catalogWorkTitle ?? '';
      const rating = reviewSource?.rating;

      return finalizePresentation({
        body: null,
        catalogWorkPreview: null,
        detail: rating
          ? {
              label: t('profile.feed.event.ratingDetail', {
                values: { rating },
              }),
            }
          : null,
        href,
        icon: 'star',
        titleSegments: buildLocalizedSegments(
          locale,
          'profile.feed.event.ratingCreated',
          { actorName, catalogWorkTitle },
          ['actorName', 'catalogWorkTitle'],
        ),
      });
    }

    // eslint-disable-next-line no-secrets/no-secrets -- stable activity event name, not a secret
    case 'user.catalog_review_published': {
      const reviewSource = source.catalogReview;
      const catalogWorkTitle = reviewSource?.catalogWorkTitle ?? '';

      return finalizePresentation({
        body: null,
        catalogWorkPreview: null,
        detail: null,
        href,
        icon: 'feather',
        titleSegments: buildLocalizedSegments(
          locale,
          'profile.feed.event.catalogReviewPublished',
          { actorName, catalogWorkTitle },
          ['actorName', 'catalogWorkTitle'],
        ),
      });
    }

    case 'user.reading_note_created': {
      const noteSource = source.readingNote;
      const readingTitle = noteSource?.title ?? '';

      return finalizePresentation({
        body: noteSource?.content ?? null,
        catalogWorkPreview: noteSource
          ? {
              author: noteSource.author,
              coverGeometry: noteSource.coverGeometry ?? null,
              coverThumbnailUrl: noteSource.coverThumbnailUrl,
              coverUrl: noteSource.coverUrl,
              catalogWorkId: noteSource.catalogWorkId,
              title: readingTitle,
            }
          : null,
        detail: formatPageDetail(noteSource, t),
        href: noteSource?.catalogWorkId
          ? `/catalog/${encodeURIComponent(noteSource.catalogWorkId)}`
          : null,
        icon: 'feather',
        titleSegments: buildLocalizedSegments(
          locale,
          'profile.feed.event.readingNoteCreated',
          { actorName, readingTitle },
          ['actorName', 'readingTitle'],
        ),
      });
    }

    default:
      return finalizePresentation({
        body: null,
        detail: null,
        href,
        icon: 'info',
        titleSegments: buildLocalizedSegments(
          locale,
          'profile.feed.event.readingFinished',
          { actorName, readingTitle: '' },
          ['actorName', 'readingTitle'],
        ),
      });
  }
}

function formatPageDetail(
  source: ActivityEvent['source']['readingNote'],
  t: Translate,
): ProfileActivityItemDetail | null {
  if (!source?.pageStart && !source?.pageEnd) {
    return null;
  }

  const pageLabel =
    source.pageStart && source.pageEnd && source.pageEnd >= source.pageStart
      ? `${source.pageStart}–${source.pageEnd}`
      : `${source.pageStart ?? source.pageEnd}`;

  return {
    label: t('profile.feed.event.readingNotePages', {
      values: { pages: pageLabel },
    }),
  };
}

function scopeIconForKey(key: string | undefined): IconName | undefined {
  switch (key) {
    case 'readingTitle':
      return 'book';
    case 'catalogWorkTitle':
      return 'book';
    default:
      return undefined;
  }
}

function finalizePresentation(
  presentation: Omit<
    ProfileActivityPresentation,
    'title' | 'catalogWorkPreview'
  > & {
    catalogWorkPreview?: ActivityCatalogWorkPreview | null;
  },
): ProfileActivityPresentation {
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

function readHref(metadata: ActivityEvent['metadata']): string | null {
  const href = metadata['href'];

  if (typeof href !== 'string') {
    return null;
  }

  return href.length > 0 ? href : null;
}
