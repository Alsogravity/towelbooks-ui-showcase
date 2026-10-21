import {
  FieldLegend,
  FieldSet,
  FormGrid,
  FormRows,
  FormTextField,
} from '../primitives';

import type { LocalDateTimeParts } from '../../lib/datetime';

type DateTimeFieldsProps = {
  dateLabel: string;
  error?: string;
  floatingLabel?: boolean;
  groupLabel: string;
  hideGroupLabel?: boolean;
  idPrefix: string;
  onChange: (patch: Partial<LocalDateTimeParts>) => void;
  timeLabel: string;
  value: LocalDateTimeParts;
};

export function DateTimeFields({
  dateLabel,
  error,
  floatingLabel = false,
  groupLabel,
  hideGroupLabel = false,
  idPrefix,
  onChange,
  timeLabel,
  value,
}: DateTimeFieldsProps) {
  const groupId = `${idPrefix}-group`;
  const dateId = `${idPrefix}-date`;
  const timeId = `${idPrefix}-time`;

  return (
    <FieldSet
      aria-describedby={error ? `${groupId}-error` : undefined}
      aria-labelledby={groupId}
    >
      <FieldLegend className={hideGroupLabel ? 'sr-only' : ''} id={groupId}>
        {groupLabel}
      </FieldLegend>

      <FormRows>
        <FormGrid columns="responsive-2">
          <FormTextField
            floatingLabel={floatingLabel}
            id={dateId}
            label={dateLabel}
            type="date"
            value={value.date}
            onChange={(event) => onChange({ date: event.target.value })}
          />

          <FormTextField
            floatingLabel={floatingLabel}
            id={timeId}
            label={timeLabel}
            type="time"
            value={value.time}
            onChange={(event) => onChange({ time: event.target.value })}
          />
        </FormGrid>

        {error ? (
          <p className="vui-form-field__error" id={`${groupId}-error`}>
            {error}
          </p>
        ) : null}
      </FormRows>
    </FieldSet>
  );
}
