import { Button } from '../../../../components/primitives';
import { MobilePanelShell } from '../../../../components/overlay';
import { useI18n } from '../../../../i18n';
import { RoomMeetingFormFields } from './RoomMeetingFormFields';

import type { MeetingDraft } from './useRoomMeetingsTabState';
import type {
  LocalDateTimeRangeErrorCode,
  LocalDateTimeRangeErrorCodes,
} from '../../../../lib/datetime';
import type { Reading } from '@towelbooks/schemas';

type RoomMeetingPanelProps = {
  draft: MeetingDraft;
  getReturnFocusElement: () => HTMLElement | null;
  isDraftValid: boolean;
  isPending: boolean;
  mode: 'create' | 'edit';
  onChange: (patch: Partial<MeetingDraft>) => void;
  onClose: () => void;
  onSubmit: () => void;
  readings: Reading[];
  scheduleErrors: LocalDateTimeRangeErrorCodes;
};

function getDateTimeErrorMessage(
  code: LocalDateTimeRangeErrorCode,
  t: ReturnType<typeof useI18n>['t'],
): string {
  switch (code) {
    case 'incomplete':
      return t('rooms.datetime.validation.incomplete');
    case 'invalid':
      return t('rooms.datetime.validation.invalid');
    case 'order':
      return t('rooms.datetime.validation.order');
  }
}

export function RoomMeetingPanel({
  draft,
  getReturnFocusElement,
  isDraftValid,
  isPending,
  mode,
  onChange,
  onClose,
  onSubmit,
  readings,
  scheduleErrors,
}: RoomMeetingPanelProps) {
  const { t } = useI18n();
  const translatedScheduleErrors = {
    startsAt: scheduleErrors.startsAt
      ? getDateTimeErrorMessage(scheduleErrors.startsAt, t)
      : undefined,
    endsAt: scheduleErrors.endsAt
      ? getDateTimeErrorMessage(scheduleErrors.endsAt, t)
      : undefined,
  };

  return (
    <MobilePanelShell
      closeLabel={t('common.close')}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            disabled={!isDraftValid}
            isLoading={isPending}
            loadingLabel={
              mode === 'create'
                ? t('rooms.detail.meetings.creating')
                : t('rooms.detail.meetings.saving')
            }
            onClick={onSubmit}
          >
            {mode === 'create'
              ? t('rooms.detail.meetings.createDialog.confirm')
              : t('rooms.detail.meetings.actions.save')}
          </Button>
        </>
      }
      getReturnFocusElement={getReturnFocusElement}
      onClose={onClose}
      panelClassName="max-w-2xl"
      title={
        mode === 'create'
          ? t('rooms.detail.meetings.createDialog.title')
          : t('rooms.detail.meetings.editDialog.title')
      }
      titleId="room-meeting-panel-title"
    >
      <RoomMeetingFormFields
        draft={draft}
        onChange={onChange}
        readings={readings}
        scheduleErrors={translatedScheduleErrors}
      />
    </MobilePanelShell>
  );
}
