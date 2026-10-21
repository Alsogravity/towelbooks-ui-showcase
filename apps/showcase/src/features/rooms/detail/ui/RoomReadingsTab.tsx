import { type Reading } from '@towelbooks/schemas';
import { type MouseEvent } from 'react';

import { ActiveReadingCard } from './ActiveReadingCard';
import { ErrorState } from '../../../../components/feedback';
import { Button } from '../../../../components/primitives';
import { useIsBelowSmViewport } from '../../../../layouts/app/shellViewport';
import { type useI18n } from '../../../../i18n';
import { roomTabSectionIcons } from '../roomTabSectionIcons';
import { RoomTabSectionHeader } from './RoomTabSectionHeader';
import { type Room } from '../../types';

type RoomReadingsTabProps = {
  activeReadings: Reading[];
  canManageReadings: boolean;
  room: Room;
  historicalReadings: Reading[] | undefined;
  isLoadingReadings: boolean;
  onRetry: () => void;
  onOpenCreateReading: (event: MouseEvent<HTMLButtonElement>) => void;
  readingsError: unknown;
  formatDate: (value: string) => string;
  t: ReturnType<typeof useI18n>['t'];
};

export function RoomReadingsTab({
  activeReadings,
  canManageReadings,
  room,
  historicalReadings,
  isLoadingReadings,
  onRetry,
  onOpenCreateReading,
  readingsError,
  formatDate,
  t,
}: RoomReadingsTabProps) {
  const hasHistoricalReadings = (historicalReadings?.length ?? 0) > 0;
  const isBelowSm = useIsBelowSmViewport();

  function getEmptyStateKeys(): {
    titleKey: string;
    bodyKey: string;
  } {
    if (canManageReadings) {
      return hasHistoricalReadings
        ? {
            titleKey: 'rooms.detail.currentReading.empty.next.title',
            bodyKey: 'rooms.detail.currentReading.empty.next.body',
          }
        : {
            titleKey: 'rooms.detail.currentReading.empty.first.title',
            bodyKey: 'rooms.detail.currentReading.empty.first.body',
          };
    }

    return hasHistoricalReadings
      ? {
          titleKey: 'rooms.detail.currentReading.empty.memberNoActive.title',
          bodyKey: 'rooms.detail.currentReading.empty.memberNoActive.body',
        }
      : {
          titleKey: 'rooms.detail.currentReading.empty.memberNoReadings.title',
          bodyKey: 'rooms.detail.currentReading.empty.memberNoReadings.body',
        };
  }

  if (readingsError) {
    return (
      <ErrorState
        title={{
          key: 'rooms.detail.readings.error.title',
          fallback: 'Unable to load readings.',
        }}
        body={{
          key: 'rooms.detail.readings.error.body',
          fallback: 'Try again in a moment.',
        }}
        action={
          <Button variant="secondary" onClick={() => void onRetry()}>
            {t('errors.action.retry')}
          </Button>
        }
      />
    );
  }

  const emptyStateKeys = getEmptyStateKeys();

  return (
    <div className="flex flex-col space-y-8 py-4">
      <RoomTabSectionHeader
        icon={roomTabSectionIcons.readingsActive}
        title={t('rooms.detail.readings.activeTitle')}
        actions={
          canManageReadings ? (
            isBelowSm ? (
              <Button
                icon="plus"
                variant="icon"
                size="sm"
                className="shrink-0"
                aria-label={t('rooms.detail.currentReading.action.add')}
                onClick={onOpenCreateReading}
              />
            ) : (
              <Button
                onClick={onOpenCreateReading}
                prependIcon="plus"
                variant="secondary"
                size="md"
              >
                {t('rooms.detail.currentReading.action.add')}
              </Button>
            )
          ) : undefined
        }
      />

      <div className="flex flex-col gap-8 lg:gap-9">
        {isLoadingReadings ? (
          <div className="flex flex-col gap-4">
            <ActiveReadingCard
              reading={null}
              room={room}
              isLoadingReadings={true}
              formatDate={formatDate}
              t={t}
            />
          </div>
        ) : activeReadings.length > 0 ? (
          <div className="flex flex-col gap-4">
            {activeReadings.map((reading) => (
              <ActiveReadingCard
                key={reading.id}
                reading={reading}
                room={room}
                isLoadingReadings={isLoadingReadings}
                formatDate={formatDate}
                t={t}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-rule/40 bg-paper/30 px-5 py-6 sm:px-6">
            <div className="max-w-2xl space-y-2">
              <h3 className="app-text-section-title text-ink">
                {t(emptyStateKeys.titleKey)}
              </h3>
              <p className="app-text-supporting-copy text-ink-3">
                {t(emptyStateKeys.bodyKey)}
              </p>
            </div>
          </div>
        )}

        {historicalReadings && historicalReadings.length > 0 ? (
          <div className="flex flex-col gap-4">
            <RoomTabSectionHeader
              icon={roomTabSectionIcons.readingsHistory}
              title={t('rooms.detail.readings.historyTitle')}
            />
            {historicalReadings.map((reading) => (
              <ActiveReadingCard
                key={reading.id}
                reading={reading}
                room={room}
                isLoadingReadings={false}
                formatDate={formatDate}
                t={t}
                variant="historical"
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
