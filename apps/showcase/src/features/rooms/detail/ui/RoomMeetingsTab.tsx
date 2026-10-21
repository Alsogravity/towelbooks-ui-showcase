import { useRef, type MouseEvent } from 'react';

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../../../components/feedback';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  Icon,
  Tag,
} from '../../../../components/primitives';
import { handleApiProblem } from '../../../../features/errors';
import { useI18n } from '../../../../i18n';
import { useIsBelowSmViewport } from '../../../../layouts/app/shellViewport';
import { roomTabSectionIcons } from '../roomTabSectionIcons';
import { RoomMeetingPanel } from './RoomMeetingPanel';
import { RoomTabSectionHeader } from './RoomTabSectionHeader';
import { useRoomMeetingsTabState } from './useRoomMeetingsTabState';

import type { RoomMeeting } from '@towelbooks/schemas';

type RoomMeetingsTabProps = {
  roomId: string;
  canManage: boolean;
};

export function RoomMeetingsTab({ canManage, roomId }: RoomMeetingsTabProps) {
  const { t, formatDateTime } = useI18n();
  const isBelowSm = useIsBelowSmViewport();
  const panelTriggerRef = useRef<HTMLButtonElement | null>(null);
  const {
    cancelMutation,
    cancelTarget,
    createMutation,
    draft,
    editingMeeting,
    isCreateOpen,
    isDraftValid,
    isLoading,
    mutationError,
    openCreate,
    openEdit,
    pastMeetings,
    queryError,
    readings,
    refetch,
    scheduleErrors,
    setCancelTarget,
    setEditingMeeting,
    setIsCreateOpen,
    updateDraft,
    updateMutation,
    upcomingMeetings,
  } = useRoomMeetingsTabState(roomId);

  const handleOpenCreate = (event: MouseEvent<HTMLButtonElement>) => {
    panelTriggerRef.current = event.currentTarget;
    openCreate();
  };

  const handleOpenEdit = (
    event: MouseEvent<HTMLButtonElement>,
    meeting: RoomMeeting,
  ) => {
    panelTriggerRef.current = event.currentTarget;
    openEdit(meeting);
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-rule/80 bg-paper p-6 shadow-sm">
        <LoadingState
          label={{
            key: 'rooms.detail.meetings.loading',
            fallback: 'Loading meetings...',
          }}
        />
      </div>
    );
  }

  if (queryError) {
    return (
      <ErrorState
        title={{ key: 'rooms.detail.meetings.error.title' }}
        body={{ key: 'rooms.detail.meetings.error.body' }}
        action={
          <Button variant="secondary" onClick={refetch}>
            {t('errors.action.retry')}
          </Button>
        }
      />
    );
  }

  const hasMeetings = upcomingMeetings.length > 0 || pastMeetings.length > 0;

  const renderMeetingCard = (meeting: RoomMeeting) => {
    const isCancelled = meeting.status === 'cancelled';

    return (
      <li
        key={meeting.id}
        data-testid="meeting-card"
        className="space-y-3 rounded-2xl border border-rule/80 bg-paper p-5 shadow-sm"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h4
              className={`heading-5 text-ink ${
                isCancelled ? 'line-through text-ink-3' : ''
              }`}
            >
              {meeting.title}
            </h4>
            <p className="inline-flex items-center gap-2 text-sm text-ink-3">
              <Icon name="calendar-clock" size={16} />
              {formatDateTime(meeting.startsAt, {
                dateStyle: 'medium',
                timeStyle: 'short',
                timeZone: meeting.timezone,
              })}
            </p>
            <p className="text-xs text-ink-4">
              {t('rooms.detail.meetings.timezoneLabel', {
                values: { timezone: meeting.timezone },
              })}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Tag variant={isCancelled ? 'paused' : 'default'}>
              {isCancelled
                ? t('rooms.detail.meetings.cancelledBadge')
                : t(
                    `rooms.detail.meetings.locationType.${meeting.locationType}`,
                  )}
            </Tag>
          </div>
        </div>

        {meeting.reading ? (
          <p className="inline-flex items-center gap-2 text-sm text-ink-3">
            <Icon name="book" size={16} />
            {t('rooms.detail.meetings.readingLabel', {
              values: { title: meeting.reading.title },
            })}
          </p>
        ) : null}

        {meeting.locationText ? (
          <p className="inline-flex items-center gap-2 text-sm text-ink-3">
            <Icon name="map-pin" size={16} />
            {meeting.locationText}
          </p>
        ) : null}

        {meeting.meetingUrl ? (
          <a
            href={meeting.meetingUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
          >
            <Icon name="video" size={16} />
            {t('rooms.detail.meetings.joinLink')}
          </a>
        ) : null}

        {meeting.description ? (
          <p className="text-sm leading-6 text-ink-3">{meeting.description}</p>
        ) : null}

        {canManage && !isCancelled ? (
          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              variant="secondary"
              prependIcon="pencil-line"
              onClick={(event) => handleOpenEdit(event, meeting)}
            >
              {t('rooms.detail.meetings.actions.edit')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              prependIcon="calendar-x"
              onClick={() => setCancelTarget(meeting)}
            >
              {t('rooms.detail.meetings.actions.cancel')}
            </Button>
          </div>
        ) : null}
      </li>
    );
  };

  return (
    <section aria-label={t('rooms.detail.meetings.title')} className="py-4">
      <RoomTabSectionHeader
        icon={roomTabSectionIcons.meetings}
        title={t('rooms.detail.meetings.title')}
        actions={
          canManage ? (
            isBelowSm ? (
              <Button
                icon="plus"
                variant="icon"
                size="sm"
                className="shrink-0"
                aria-label={t('rooms.detail.meetings.create')}
                onClick={handleOpenCreate}
              />
            ) : (
              <Button
                prependIcon="plus"
                variant="secondary"
                size="md"
                onClick={handleOpenCreate}
              >
                {t('rooms.detail.meetings.create')}
              </Button>
            )
          ) : undefined
        }
      />

      {mutationError ? (
        <Alert variant="error">
          {
            handleApiProblem(mutationError, {
              fallbackKey: 'rooms.detail.meetings.error.submit',
              t,
            }).message
          }
        </Alert>
      ) : null}

      {hasMeetings ? (
        <div className="space-y-8">
          {upcomingMeetings.length > 0 ? (
            <div data-testid="meetings-upcoming" className="space-y-3">
              <h3 className="heading-6 uppercase tracking-wide text-ink-4">
                {t('rooms.detail.meetings.upcomingTitle')}
              </h3>
              <ul className="space-y-4">
                {upcomingMeetings.map(renderMeetingCard)}
              </ul>
            </div>
          ) : null}

          {pastMeetings.length > 0 ? (
            <div data-testid="meetings-past" className="space-y-3">
              <h3 className="heading-6 uppercase tracking-wide text-ink-4">
                {t('rooms.detail.meetings.pastTitle')}
              </h3>
              <ul className="space-y-4">
                {pastMeetings.map(renderMeetingCard)}
              </ul>
            </div>
          ) : null}
        </div>
      ) : (
        <EmptyState
          className="mt-16"
          icon="calendar"
          title={{ key: 'rooms.detail.meetings.empty.title' }}
          body={{
            key: canManage
              ? 'rooms.detail.meetings.empty.body.canManage'
              : 'rooms.detail.meetings.empty.body.readOnly',
          }}
        />
      )}

      {isCreateOpen ? (
        <RoomMeetingPanel
          draft={draft}
          getReturnFocusElement={() => panelTriggerRef.current}
          isDraftValid={isDraftValid}
          isPending={createMutation.isPending}
          mode="create"
          onChange={updateDraft}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={() => createMutation.mutate()}
          readings={readings}
          scheduleErrors={scheduleErrors}
        />
      ) : null}

      {editingMeeting ? (
        <RoomMeetingPanel
          draft={draft}
          getReturnFocusElement={() => panelTriggerRef.current}
          isDraftValid={isDraftValid}
          isPending={updateMutation.isPending}
          mode="edit"
          onChange={updateDraft}
          onClose={() => setEditingMeeting(null)}
          onSubmit={() => updateMutation.mutate()}
          readings={readings}
          scheduleErrors={scheduleErrors}
        />
      ) : null}

      {cancelTarget ? (
        <Dialog
          title={t('rooms.detail.meetings.cancelDialog.title')}
          onClose={() => setCancelTarget(null)}
          size="sm"
        >
          {({ close }) => (
            <>
              <DialogBody>
                <p className="text-sm leading-6 text-ink-3">
                  {t('rooms.detail.meetings.cancelDialog.body')}
                </p>
              </DialogBody>
              <DialogActions>
                <Button variant="ghost" onClick={() => close()}>
                  {t('common.cancel')}
                </Button>
                <Button
                  isLoading={cancelMutation.isPending}
                  loadingLabel={t('rooms.detail.meetings.cancelling')}
                  onClick={() => cancelMutation.mutate()}
                >
                  {t('rooms.detail.meetings.cancelDialog.confirm')}
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      ) : null}
    </section>
  );
}
