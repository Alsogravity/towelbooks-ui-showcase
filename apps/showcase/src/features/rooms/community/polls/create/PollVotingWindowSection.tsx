import { DateTimeRangeFields } from '../../../../../components/datetime/DateTimeRangeFields';
import { FormSection } from '../../../../../components/primitives';
import { useI18n } from '../../../../../i18n';
import { Switch } from '@towelbooks/ui';

import type { DateSlotFieldErrors } from './DateSlotsField';
import type { LocalDateTimeRangeParts } from '../../../../../lib/datetime';

type PollVotingWindowSectionProps = {
  closesAutomatically: boolean;
  errors: DateSlotFieldErrors;
  onClosesAutomaticallyChange: (value: boolean) => void;
  onChange: (patch: Partial<LocalDateTimeRangeParts>) => void;
  value: LocalDateTimeRangeParts;
};

export function PollVotingWindowSection({
  closesAutomatically,
  errors,
  onClosesAutomaticallyChange,
  onChange,
  value,
}: PollVotingWindowSectionProps) {
  const { t } = useI18n();

  return (
    <FormSection
      contentClassName="space-y-2"
      icon="clock-3"
      title={t('rooms.detail.polls.createDialog.sections.schedule')}
      withDivider
    >
      <div className="flex flex-row items-center justify-between gap-3 py-2 text-sm text-ink-2 sm:gap-6">
        <span className="min-w-0 flex-1">
          {t('rooms.detail.polls.createDialog.closeAutomatically')}
        </span>
        <Switch
          aria-label={t('rooms.detail.polls.createDialog.closeAutomatically')}
          checked={closesAutomatically}
          onCheckedChange={onClosesAutomaticallyChange}
        />
      </div>

      <DateTimeRangeFields
        dateLabel={t('rooms.datetime.labels.date')}
        endDateLabel={t(
          'rooms.detail.polls.createDialog.schedule.endDateLabel',
        )}
        endTimeLabel={t(
          'rooms.detail.polls.createDialog.schedule.endTimeLabel',
        )}
        endsLabel={t('rooms.detail.polls.createDialog.endsAtLabel')}
        errors={errors}
        floatingLabel
        hideGroupLabels
        idPrefix="create-poll-window"
        onChange={onChange}
        showEndFields={closesAutomatically}
        startDateLabel={t(
          'rooms.detail.polls.createDialog.schedule.startDateLabel',
        )}
        startTimeLabel={t(
          'rooms.detail.polls.createDialog.schedule.startTimeLabel',
        )}
        startsLabel={t('rooms.detail.polls.createDialog.startsAtLabel')}
        timeLabel={t('rooms.datetime.labels.time')}
        value={value}
      />

      {!closesAutomatically ? (
        <p className="app-text-supporting-copy">
          {t('rooms.detail.polls.createDialog.manualCloseHelp')}
        </p>
      ) : null}
    </FormSection>
  );
}
