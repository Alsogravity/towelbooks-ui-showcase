import { DateTimeFields } from './DateTimeFields';
import { FormRows } from '../primitives';

import type { LocalDateTimeRangeParts } from '../../lib/datetime';
import type { ReactNode } from 'react';

type DateTimeRangeFieldsProps = {
  dateLabel: string;
  endDateLabel?: string;
  endTimeLabel?: string;
  endsLabel: string;
  errors?: {
    endsAt?: string;
    startsAt?: string;
  };
  floatingLabel?: boolean;
  helperText?: ReactNode;
  hideGroupLabels?: boolean;
  idPrefix: string;
  onChange: (patch: Partial<LocalDateTimeRangeParts>) => void;
  showEndFields?: boolean;
  startDateLabel?: string;
  startTimeLabel?: string;
  startsLabel: string;
  timeLabel: string;
  value: LocalDateTimeRangeParts;
};

export function DateTimeRangeFields({
  dateLabel,
  endDateLabel,
  endTimeLabel,
  endsLabel,
  errors,
  floatingLabel = false,
  helperText,
  hideGroupLabels = false,
  idPrefix,
  onChange,
  showEndFields = true,
  startDateLabel,
  startTimeLabel,
  startsLabel,
  timeLabel,
  value,
}: DateTimeRangeFieldsProps) {
  return (
    <FormRows>
      <DateTimeFields
        dateLabel={startDateLabel ?? dateLabel}
        error={errors?.startsAt}
        floatingLabel={floatingLabel}
        groupLabel={startsLabel}
        hideGroupLabel={hideGroupLabels}
        idPrefix={`${idPrefix}-starts`}
        onChange={(patch) =>
          onChange({
            ...(patch.date !== undefined ? { startsDate: patch.date } : {}),
            ...(patch.time !== undefined ? { startsTime: patch.time } : {}),
          })
        }
        timeLabel={startTimeLabel ?? timeLabel}
        value={{
          date: value.startsDate,
          time: value.startsTime,
        }}
      />

      {showEndFields ? (
        <DateTimeFields
          dateLabel={endDateLabel ?? dateLabel}
          error={errors?.endsAt}
          floatingLabel={floatingLabel}
          groupLabel={endsLabel}
          hideGroupLabel={hideGroupLabels}
          idPrefix={`${idPrefix}-ends`}
          onChange={(patch) =>
            onChange({
              ...(patch.date !== undefined ? { endsDate: patch.date } : {}),
              ...(patch.time !== undefined ? { endsTime: patch.time } : {}),
            })
          }
          timeLabel={endTimeLabel ?? timeLabel}
          value={{
            date: value.endsDate,
            time: value.endsTime,
          }}
        />
      ) : null}

      {helperText ? <div>{helperText}</div> : null}
    </FormRows>
  );
}
