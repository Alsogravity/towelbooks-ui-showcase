import { DateTimeRangeFields } from '../../../../components/datetime/DateTimeRangeFields';
import {
  FormRows,
  FormSection,
  FormSelectField,
  FormStack,
  FormTextareaField,
  FormTextField,
} from '../../../../components/primitives';
import { useI18n } from '../../../../i18n';

import type { MeetingDraft } from './useRoomMeetingsTabState';
import type { RoomMeetingLocationType, Reading } from '@towelbooks/schemas';

const LOCATION_TYPES: RoomMeetingLocationType[] = [
  'online',
  'in_person',
  'hybrid',
];

export function RoomMeetingFormFields({
  draft,
  onChange,
  readings,
  scheduleErrors,
}: {
  draft: MeetingDraft;
  onChange: (patch: Partial<MeetingDraft>) => void;
  readings: Reading[];
  scheduleErrors: {
    endsAt?: string;
    startsAt?: string;
  };
}) {
  const { t } = useI18n();
  const showUrl = draft.locationType !== 'in_person';
  const showLocationText = draft.locationType !== 'online';
  const titleLabel = t('rooms.detail.meetings.form.titleLabel');
  const readingLabel = t('rooms.detail.meetings.form.readingLabel');
  const descriptionLabel = t('rooms.detail.meetings.form.descriptionLabel');
  const locationTypeLabel = t('rooms.detail.meetings.form.locationTypeLabel');
  const meetingUrlLabel = t('rooms.detail.meetings.form.meetingUrlLabel');
  const locationTextLabel = t('rooms.detail.meetings.form.locationTextLabel');

  return (
    <FormStack>
      <FormSection
        icon="pencil-line"
        title={t('rooms.detail.meetings.form.sections.details')}
        withDivider
      >
        <FormRows>
          <FormTextField
            id="meeting-title"
            label={titleLabel}
            value={draft.title}
            onChange={(event) => onChange({ title: event.currentTarget.value })}
          />

          <FormSelectField
            id="meeting-reading"
            label={readingLabel}
            value={draft.readingId ?? ''}
            onChange={(event) =>
              onChange({
                readingId: event.currentTarget.value || null,
              })
            }
          >
            <option value="">
              {t('rooms.detail.meetings.form.readingNone')}
            </option>
            {readings.map((reading) => (
              <option key={reading.id} value={reading.id}>
                {reading.work.display.title}
              </option>
            ))}
          </FormSelectField>

          <FormTextareaField
            id="meeting-description"
            label={descriptionLabel}
            rows={3}
            value={draft.description}
            onChange={(event) =>
              onChange({ description: event.currentTarget.value })
            }
          />
        </FormRows>
      </FormSection>

      <FormSection
        icon="calendar-clock"
        title={t('rooms.detail.meetings.form.sections.schedule')}
        withDivider
      >
        <DateTimeRangeFields
          dateLabel={t('rooms.datetime.labels.date')}
          endDateLabel={t('rooms.detail.meetings.form.endDateLabel')}
          endTimeLabel={t('rooms.detail.meetings.form.endTimeLabel')}
          endsLabel={t('rooms.detail.meetings.form.endsAtLabel')}
          errors={scheduleErrors}
          floatingLabel
          hideGroupLabels
          idPrefix="meeting"
          onChange={(patch) => onChange(patch)}
          startDateLabel={t('rooms.detail.meetings.form.startDateLabel')}
          startTimeLabel={t('rooms.detail.meetings.form.startTimeLabel')}
          startsLabel={t('rooms.detail.meetings.form.startsAtLabel')}
          timeLabel={t('rooms.datetime.labels.time')}
          value={{
            startsDate: draft.startsDate,
            startsTime: draft.startsTime,
            endsDate: draft.endsDate,
            endsTime: draft.endsTime,
          }}
        />
      </FormSection>

      <FormSection
        icon="video"
        title={t('rooms.detail.meetings.form.sections.formatAccess')}
        withDivider
      >
        <FormRows>
          <FormSelectField
            id="meeting-location-type"
            label={locationTypeLabel}
            value={draft.locationType}
            onChange={(event) =>
              onChange({
                locationType: event.currentTarget
                  .value as RoomMeetingLocationType,
              })
            }
          >
            {LOCATION_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(`rooms.detail.meetings.locationType.${type}`)}
              </option>
            ))}
          </FormSelectField>

          {showUrl ? (
            <FormTextField
              id="meeting-url"
              label={meetingUrlLabel}
              type="url"
              value={draft.meetingUrl}
              onChange={(event) =>
                onChange({ meetingUrl: event.currentTarget.value })
              }
            />
          ) : null}

          {showLocationText ? (
            <FormTextField
              id="meeting-location-text"
              label={locationTextLabel}
              value={draft.locationText}
              onChange={(event) =>
                onChange({ locationText: event.currentTarget.value })
              }
            />
          ) : null}
        </FormRows>
      </FormSection>
    </FormStack>
  );
}
