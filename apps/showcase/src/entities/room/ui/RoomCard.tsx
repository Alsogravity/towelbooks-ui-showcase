import { type RoomDiscoveryItem, type RoomListItem } from '@towelbooks/schemas';
import { Link } from 'react-router';

import { Avatar, Card, Icon, Tag } from '../../../components/primitives';
import { BannerAmbient } from '../../../features/banner-presets';
import {
  getRoomVisibilityIcon,
  getRoomVisibilityLabel,
} from '../../../features/rooms/roomCopy';
import { buildLocalizedSegments, useI18n } from '../../../i18n';
import { RoomAvatar } from './RoomAvatar';

import type { Room } from '../../../features/rooms/types';

type RoomCardRoom = Room | RoomListItem | RoomDiscoveryItem;

interface RoomCardProps {
  room: RoomCardRoom;
  memberCount?: number;
  readingsCount?: number;
  isPaused?: boolean;
  variant?: 'horizontal' | 'vertical';
  titleAs?: 'h2' | 'h3';
}

export function RoomCard({
  room,
  memberCount,
  readingsCount,
  isPaused = false,
  variant = 'horizontal',
  titleAs: TitleTag = 'h3',
}: RoomCardProps) {
  const { formatNumber, locale, t } = useI18n();
  const resolvedMemberCount =
    memberCount ?? ('memberCount' in room ? room.memberCount : undefined) ?? 0;
  const resolvedReadingsCount =
    readingsCount ?? ('readingsCount' in room ? room.readingsCount : undefined);
  const description = room.description?.trim() ?? '';
  const currentReading =
    'currentReading' in room ? room.currentReading : undefined;
  const isVertical = variant === 'vertical';
  const memberSummary = t(
    resolvedMemberCount === 1
      ? 'rooms.members.count.one'
      : 'rooms.members.count.other',
    {
      values: {
        count: formatNumber(resolvedMemberCount),
      },
    },
  );
  const readingsSummary =
    typeof resolvedReadingsCount === 'number'
      ? t(
          resolvedReadingsCount === 1
            ? 'rooms.card.readings.count.one'
            : 'rooms.card.readings.count.other',
          {
            values: {
              count: formatNumber(resolvedReadingsCount),
            },
          },
        )
      : null;

  const tags = isPaused ? (
    <div className="flex flex-wrap items-center gap-1.5">
      <Tag
        variant="paused"
        className="app-text-caption px-2 py-0.5 tracking-[0.06em]"
      >
        {t('rooms.card.status.paused')}
      </Tag>
    </div>
  ) : null;

  const visibilityIcon = getRoomVisibilityIcon(room.visibility);
  const visibilityLabel = getRoomVisibilityLabel(t, room.visibility);
  const visibilityIconColor =
    room.visibility === 'private' ? 'text-tangerine' : 'text-sky-500';

  const renderOwnerByline = () => {
    if (!room.owner) {
      return null;
    }

    return (
      <div className="app-text-metadata flex min-w-0 items-center gap-1.5 text-ink-3">
        <span className="shrink-0 text-ink-3">
          {t('rooms.card.owner.managedByPrefix')}
        </span>
        <Avatar
          size="xs"
          background={room.owner.avatar.background}
          foreground={room.owner.avatar.foreground}
          imageUrl={room.owner.avatar.imageUrl}
          initial={room.owner.avatar.initial}
          imageAlt={room.owner.displayName ?? 'Owner'}
        />
        <span className="app-text-row-title truncate text-ink">
          {room.owner.displayName}
        </span>
      </div>
    );
  };

  const footerStats = (
    <div className="flex items-center gap-4">
      <span
        className="app-text-metadata flex min-w-0 items-center gap-1.5 text-ink-3"
        aria-label={memberSummary}
      >
        <Icon
          name="users-round"
          size={20}
          className="shrink-0 text-ink-3"
          aria-hidden
        />
        <span>{formatNumber(resolvedMemberCount)}</span>
      </span>
      {typeof resolvedReadingsCount === 'number' ? (
        <span
          className="app-text-metadata flex min-w-0 items-center gap-1.5 text-ink-3"
          aria-label={readingsSummary ?? undefined}
        >
          <Icon
            name="book-open"
            size={20}
            className="shrink-0 text-ink-3"
            aria-hidden
          />
          <span>{formatNumber(resolvedReadingsCount)}</span>
        </span>
      ) : null}
      <span
        className={classNames(
          'flex shrink-0 items-center',
          visibilityIconColor,
        )}
        aria-label={visibilityLabel}
      >
        <Icon
          name={visibilityIcon}
          size={20}
          className={classNames('shrink-0', visibilityIconColor)}
          aria-hidden
        />
      </span>
    </div>
  );

  const footer = (
    <div
      className={classNames(
        'mt-auto flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-t border-rule/30',
        variant !== 'horizontal' && 'pt-4',
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {renderOwnerByline()}
      </div>
      <div className="ml-auto">{footerStats}</div>
    </div>
  );

  const renderCurrentReadingWidget = () => {
    if (!currentReading) {
      return null;
    }

    const author =
      currentReading.work.contributors[0]?.trim() ||
      t('readings.author.unknown');
    const summaryValues = {
      title: currentReading.work.display.title,
      author,
    };
    const summary = t('rooms.card.currentReading.summary', {
      values: summaryValues,
    });
    const summarySegments = buildLocalizedSegments(
      locale,
      'rooms.card.currentReading.summary',
      summaryValues,
      ['title', 'author'],
    );

    return (
      <div className="flex min-w-0 items-center gap-1.5" title={summary}>
        <Icon
          name="nav-books"
          size={20}
          className="shrink-0 text-forest"
          aria-hidden
        />
        <p className="app-text-metadata min-w-0 truncate text-ink-3">
          {summarySegments.map((segment, index) => (
            <span
              key={`${segment.key ?? 'text'}-${index}`}
              className={segment.emphasis ? 'font-medium' : undefined}
            >
              {segment.text}
            </span>
          ))}
        </p>
      </div>
    );
  };

  const horizontalFooter = (
    <div className="mt-auto flex w-full items-center gap-x-5">
      {/* Mobile: owner stays left. Desktop: reading moves here. */}
      <div className="min-w-0 flex-1 md:hidden">{renderOwnerByline()}</div>
      <div className="hidden min-w-0 flex-1 md:block">
        {renderCurrentReadingWidget()}
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <div className="hidden min-w-0 md:block">{renderOwnerByline()}</div>
        {footerStats}
      </div>
    </div>
  );

  return (
    <Link
      to={`/rooms/${room.id}`}
      aria-label={t('rooms.card.openRoom', { values: { name: room.name } })}
      className="group no-underline"
    >
      <Card
        interactive
        variant={isVertical ? 'bookplate' : 'base'}
        className={classNames(
          'relative isolate overflow-hidden h-full items-stretch shadow-2 transition-all hover:border-rule/40',
          variant === 'horizontal'
            ? 'flex flex-col gap-4 p-[18px]'
            : 'flex flex-col gap-4 p-6',
        )}
      >
        {/* Soft banner-tinted backlight behind the card content. */}
        <BannerAmbient
          bannerPresetId={room.bannerPresetId}
          imageUrl={room.bannerImage?.imageUrl ?? null}
          imageUrls={room.bannerImage?.imageUrls ?? null}
          positionClassName="inset-0"
          intensity={{ light: 0.2, dark: 0.2 }}
          surfaceTestId="room-card-ambient"
        />

        {isVertical ? (
          <div className="flex min-w-0 flex-1 flex-col gap-3 text-left">
            <div className="flex min-w-0 flex-col gap-1.5">
              <RoomAvatar avatar={room.avatar} name={room.name} size="lg" />
              <TitleTag
                title={room.name}
                className="app-text-card-title line-clamp-2 pr-6 text-ink"
              >
                {room.name}
              </TitleTag>
            </div>

            {currentReading ? (
              <div className="flex flex-col gap-3">
                {description ? (
                  <p
                    title={description}
                    className="app-text-supporting-copy line-clamp-2 text-ink-3"
                  >
                    {description}
                  </p>
                ) : null}

                {tags}

                {renderCurrentReadingWidget()}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {description ? (
                  <p
                    title={description}
                    className="app-text-supporting-copy line-clamp-3 text-ink-3"
                  >
                    {description}
                  </p>
                ) : null}
                {tags}
              </div>
            )}

            {footer}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 w-full min-w-0">
              <div className="shrink-0">
                <RoomAvatar avatar={room.avatar} name={room.name} size="md" />
              </div>
              <TitleTag
                title={room.name}
                className="app-text-card-title line-clamp-2 min-w-0 flex-1 text-ink"
              >
                {room.name}
              </TitleTag>
            </div>

            <div className="flex w-full flex-col gap-4">
              <div className="flex min-w-0 flex-col gap-2 w-full">
                {description ? (
                  <p
                    title={description}
                    className="app-text-supporting-copy line-clamp-2 w-full text-ink-3"
                  >
                    {description}
                  </p>
                ) : null}
                {tags}
              </div>

              {/* Mobile keeps the reading block in the body; desktop moves it to the footer. */}
              <div className="md:hidden">{renderCurrentReadingWidget()}</div>
            </div>

            {horizontalFooter}
          </>
        )}
      </Card>
    </Link>
  );
}

export function RoomCardSkeleton({
  variant = 'vertical',
}: {
  variant?: 'horizontal' | 'vertical';
}) {
  const isVertical = variant === 'vertical';

  return (
    <div
      aria-hidden="true"
      className={classNames(
        'rounded-[var(--radius-paper-3)] border border-rule/40 bg-vellum/40 shadow-2',
        variant === 'horizontal'
          ? 'flex flex-col gap-4 p-[18px]'
          : 'flex flex-col gap-4 p-6',
      )}
    >
      {!isVertical && (
        <div className="flex items-center gap-3 w-full">
          <div className="h-8 w-8 rounded-full app-shimmer shrink-0" />
          <div className="h-6 w-1/2 app-shimmer rounded-sm" />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 text-left">
        {isVertical && <div className="h-6 w-3/4 app-shimmer rounded-sm" />}
        <div className="h-4 w-full app-shimmer rounded-sm" />
        <div className="h-4 w-5/6 app-shimmer rounded-sm" />
        <div
          className={classNames(
            'mt-auto flex items-center gap-5',
            variant !== 'horizontal' && 'border-t border-rule/30',
            variant !== 'horizontal' && 'pt-4',
          )}
        >
          <div className="h-4 w-24 app-shimmer rounded-sm" />
          <div className="h-4 w-20 app-shimmer rounded-sm" />
        </div>
      </div>
    </div>
  );
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}
