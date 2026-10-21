import { type RoomDiscoveryItem, type RoomListItem } from '@towelbooks/schemas';

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../../components/feedback';
import { Button, ButtonLink, Pagination } from '../../../components/primitives';
import { RoomCard, RoomCardSkeleton } from '../../../entities/room/ui';
import { useI18n } from '../../../i18n';
import { RoomsIllustration } from '../../dashboard/ui/illustrations';
import { RoomDiscoverEmptyStateLayout } from './RoomDiscoverEmptyStateLayout';
import { RoomDiscoverNoResultsEmptyState } from './RoomDiscoverNoResultsEmptyState';

const SKELETON_COUNT = 6;

type RoomListPageResultsProps = {
  rooms: Array<RoomListItem | RoomDiscoveryItem>;
  currentPage: number;
  error: unknown;
  isDiscovering: boolean;
  isLoading: boolean;
  onPageChange: (nextPage: number) => void;
  onRetry: () => void;
  total: number;
  totalPages: number;
};

function RoomsGridSkeleton({ label }: { label: string }) {
  return (
    <div
      aria-busy="true"
      aria-label={label}
      aria-live="polite"
      className="flex flex-col gap-6"
      role="status"
    >
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <RoomCardSkeleton key={index} variant="horizontal" />
      ))}
    </div>
  );
}

export function RoomListPageResults({
  rooms,
  currentPage,
  error,
  isDiscovering,
  isLoading,
  onPageChange,
  onRetry,
  total,
  totalPages,
}: RoomListPageResultsProps) {
  const { formatNumber, t } = useI18n();
  const loadingLabel = t('rooms.list.loading');
  const gridLabel = isDiscovering
    ? t('rooms.list.grid.discoverLabel')
    : t('rooms.list.grid.label');

  if (isLoading) {
    return (
      <>
        <LoadingState
          className="sr-only"
          label={{ key: 'rooms.list.loading' }}
        />
        <RoomsGridSkeleton label={loadingLabel} />
      </>
    );
  }

  if (error) {
    return (
      <ErrorState
        title={{ key: 'rooms.list.error.title' }}
        body={{ key: 'rooms.list.error.body' }}
        action={
          <Button variant="secondary" onClick={() => void onRetry()}>
            {t('rooms.list.error.action')}
          </Button>
        }
      />
    );
  }

  if (total === 0 && isDiscovering) {
    return (
      <RoomDiscoverEmptyStateLayout>
        <RoomDiscoverNoResultsEmptyState className="-translate-y-16" />
      </RoomDiscoverEmptyStateLayout>
    );
  }

  if (total === 0) {
    return (
      <RoomDiscoverEmptyStateLayout>
        <EmptyState
          className="-translate-y-16"
          ornament={
            <RoomsIllustration
              className="text-ink-3"
              width={184}
              height={184}
            />
          }
          title={{
            key: 'rooms.list.empty.title',
            fallback: 'No rooms yet',
          }}
          body={{
            key: 'rooms.list.empty.body',
            fallback: 'Search for a public room or create your own.',
          }}
          action={
            <ButtonLink
              className="min-w-[180px]"
              prependIcon="plus"
              to="/rooms/create"
            >
              {t('rooms.list.action.start')}
            </ButtonLink>
          }
        />
      </RoomDiscoverEmptyStateLayout>
    );
  }

  return (
    <>
      <ul
        aria-label={gridLabel}
        className="flex list-none flex-col gap-6 p-0"
        role="list"
      >
        {rooms.map((room) => (
          <li key={room.id}>
            <RoomCard
              room={room}
              memberCount={room.memberCount}
              readingsCount={
                'readingsCount' in room ? room.readingsCount : undefined
              }
              titleAs="h2"
              variant="horizontal"
            />
          </li>
        ))}
      </ul>

      {totalPages > 1 ? (
        <div className="mt-auto flex items-center justify-end gap-4 border-t border-rule pt-4">
          <Pagination
            currentPageLabel={(pageNumber) =>
              t('rooms.list.pagination.currentPage', {
                values: { page: formatNumber(pageNumber) },
              })
            }
            navLabel={t('rooms.list.pagination.nav')}
            nextLabel={t('rooms.list.pagination.next')}
            onPageChange={onPageChange}
            page={currentPage}
            pageLabel={(pageNumber) =>
              t('rooms.list.pagination.page', {
                values: { page: formatNumber(pageNumber) },
              })
            }
            previousLabel={t('rooms.list.pagination.previous')}
            totalPages={totalPages}
          />
        </div>
      ) : null}
    </>
  );
}
