import { useQuery } from '@tanstack/react-query';
import type { ContinueCatalogWork as ApiContinueCatalogWork } from '@towelbooks/schemas';

import { ErrorState, LoadingState } from '../components/feedback';
import { PageContainer, PageSection, PageShell } from '../components/layout';
import { Button } from '../components/primitives';
import type { RoomListItem } from '../features/rooms/types';
import { usePageTitle } from '../hooks/usePageTitle';
import { useI18n } from '../i18n';
import { sdk } from '../lib/sdk';
import { type ContinueCatalogWork, themeFromString } from './dashboard/content';
import { useContinueReading } from './dashboard/hooks/useContinueReading';
import { useDashboardCatalog } from './dashboard/hooks/useDashboardCatalog';
import { useMyInsights } from './dashboard/hooks/useMyInsights';
import { CatalogCarousel } from './dashboard/ui/CatalogCarousel';
import {
  ContinueReadingGrid,
  ContinueReadingSection,
  RoomReadingsGrid,
} from './dashboard/ui/ContinueReadingSection';
import { FromYourGroups } from './dashboard/ui/GroupSections';
import { WeekInsightsRow } from './dashboard/ui/WeekInsightsRow';
import { roomActivityQueryKeys } from '../features/room-activity/useRoomActivityFeed';

const DASHBOARD_STALE_TIME = 60_000;
/** Single page is enough for dashboard room readings (capped below). */
const DASHBOARD_ROOMS_PAGE_SIZE = 50;
const ROOM_READINGS_MAX_ITEMS = 2;

async function loadDashboardRooms(): Promise<{
  rooms: RoomListItem[];
  total: number;
}> {
  const response = await sdk.rooms.list({
    page: 1,
    pageSize: DASHBOARD_ROOMS_PAGE_SIZE,
  });

  return {
    rooms: response.items,
    total: response.total,
  };
}

export function DashboardPage() {
  usePageTitle({ key: 'page.dashboard.title', fallback: 'Home' });
  const { locale, t } = useI18n();

  const roomsQuery = useQuery({
    queryKey: [
      'rooms',
      'dashboard',
      { pageSize: DASHBOARD_ROOMS_PAGE_SIZE },
      locale,
    ],
    queryFn: loadDashboardRooms,
    staleTime: DASHBOARD_STALE_TIME,
  });

  const continueReading = useContinueReading();
  const insights = useMyInsights();
  const dashboardCatalog = useDashboardCatalog();

  const rooms = roomsQuery.data?.rooms ?? [];
  const roomsTotal = roomsQuery.data?.total ?? rooms.length;
  const roomActivitiesQuery = useQuery({
    queryKey: roomActivityQueryKeys.viewer(4),
    queryFn: () => sdk.activityEvents.listForViewer({ limit: 4 }),
    staleTime: DASHBOARD_STALE_TIME,
  });
  const activeReadings: ContinueCatalogWork[] = (
    continueReading.data?.items ?? []
  ).map(mapContinueCatalogWork);

  const roomReadings: ContinueCatalogWork[] = rooms
    .filter(
      (
        room,
      ): room is RoomListItem & {
        currentReading: NonNullable<RoomListItem['currentReading']>;
      } => room.currentReading !== null,
    )
    .sort(
      (a, b) =>
        new Date(b.currentReading.updatedAt).getTime() -
        new Date(a.currentReading.updatedAt).getTime(),
    )
    .slice(0, ROOM_READINGS_MAX_ITEMS)
    .map(mapRoomCatalogWork);

  const groupsSectionTitle = t('dashboard.groups.title');

  return (
    <PageShell background="paper" minHeight>
      <PageContainer size="default" className="flex flex-col gap-6">
        {activeReadings.length > 0 ? (
          <ContinueReadingSection
            title={t('dashboard.greeting.continueReading')}
            seeAllLabel={t('dashboard.continueReading.seeAll')}
            seeAllTo="/my-library"
          >
            <ContinueReadingGrid items={activeReadings} />
          </ContinueReadingSection>
        ) : null}

        <WeekInsightsRow
          insights={insights.data}
          isError={insights.isError}
          isLoading={insights.isLoading}
        />

        {roomsQuery.isLoading ? (
          <PageSection title={groupsSectionTitle}>
            <LoadingState
              className="rounded-3xl border border-ink/10 bg-paper/70 px-6 py-12"
              label={{
                key: 'dashboard.loading',
                fallback: 'Opening your library...',
              }}
            />
          </PageSection>
        ) : roomsQuery.isError ? (
          <PageSection title={groupsSectionTitle}>
            <ErrorState
              title={{ key: 'dashboard.error.title' }}
              body={{
                key: 'dashboard.error.body',
                fallback: 'Try again in a moment.',
              }}
              action={
                <Button
                  variant="secondary"
                  onClick={() => void roomsQuery.refetch()}
                >
                  {t('dashboard.error.action')}
                </Button>
              }
            />
          </PageSection>
        ) : (
          <FromYourGroups
            title={groupsSectionTitle}
            allLabel={t('dashboard.groups.allAction', {
              values: { count: roomsTotal },
            })}
            activityEmptyBody={t('dashboard.groups.activity.empty')}
            activityErrorBody={t('dashboard.groups.activity.error')}
            activityEvents={roomActivitiesQuery.data?.items ?? []}
            activityLoadingLabel={t('dashboard.groups.activity.loading')}
            rooms={rooms}
            isActivityError={roomActivitiesQuery.isError}
            isActivityLoading={
              roomActivitiesQuery.isLoading || roomActivitiesQuery.isPending
            }
            metaLabel={t('dashboard.groups.activity.meta')}
            emptyBody={t('dashboard.groups.empty')}
            emptyFindLabel={t('dashboard.groupsCta.actions.find')}
            emptyStartLabel={t('dashboard.groupsCta.actions.start')}
            onActivityRetry={() => void roomActivitiesQuery.refetch()}
          />
        )}

        <CatalogCarousel
          isError={dashboardCatalog.forYou.isError}
          items={dashboardCatalog.forYou.items}
          isLoading={dashboardCatalog.forYou.isLoading}
          onRetry={dashboardCatalog.forYou.onRetry}
          seeAllLabel={t('dashboard.forYou.seeAll')}
          seeAllTo="/catalog"
          title={t('dashboard.forYou.title')}
        />

        <CatalogCarousel
          isError={dashboardCatalog.discover.isError}
          items={dashboardCatalog.discover.items}
          isLoading={dashboardCatalog.discover.isLoading}
          onRetry={dashboardCatalog.discover.onRetry}
          seeAllLabel={t('dashboard.discoverBooks.seeAll')}
          seeAllTo="/catalog"
          title={t('dashboard.discoverBooks.title')}
        />

        {roomReadings.length > 0 ? (
          <ContinueReadingSection
            title={t('dashboard.roomReadings.title')}
            seeAllLabel={t('dashboard.roomReadings.seeAll')}
            seeAllTo="/rooms"
          >
            <RoomReadingsGrid items={roomReadings} />
          </ContinueReadingSection>
        ) : null}
      </PageContainer>
    </PageShell>
  );
}

function mapContinueCatalogWork(
  item: ApiContinueCatalogWork,
): ContinueCatalogWork {
  return {
    author: item.author,
    coverGeometry: item.coverGeometry ?? null,
    coverThumbnailUrl: item.coverThumbnailUrl,
    coverUrl: item.coverUrl,
    href: `/libraries/${item.source.libraryId}/items/${item.source.libraryItemId}`,
    ...(item.progress?.percent !== undefined && item.progress?.percent !== null
      ? { progress: item.progress.percent / 100 }
      : {}),
    theme: themeFromString(item.catalogWorkId),
    title: item.title,
  };
}

function mapRoomCatalogWork(
  room: RoomListItem & {
    currentReading: NonNullable<RoomListItem['currentReading']>;
  },
): ContinueCatalogWork {
  const { currentReading } = room;

  return {
    author: currentReading.work.contributors[0] ?? null,
    coverGeometry: currentReading.work.display.coverGeometry,
    roomName: room.name,
    coverThumbnailUrl: currentReading.work.display.coverThumbnailUrl,
    coverUrl: currentReading.work.display.coverUrl,
    href: `/rooms/${room.id}/readings/${currentReading.id}`,
    theme: themeFromString(currentReading.catalogWorkId),
    title: currentReading.work.display.title,
  };
}
