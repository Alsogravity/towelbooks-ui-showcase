import { DateTimeFields } from '../../../../../components/datetime/DateTimeFields';
import { Button } from '../../../../../components/primitives';
import { useI18n } from '../../../../../i18n';

export type DateSlotDraft = {
  endsDate: string;
  endsTime: string;
  startsDate: string;
  startsTime: string;
};

export type DateSlotFieldErrors = {
  endsAt?: string;
  startsAt?: string;
};

export function createEmptyDateSlot(): DateSlotDraft {
  return {
    endsDate: '',
    endsTime: '',
    startsDate: '',
    startsTime: '',
  };
}

type DateSlotsFieldProps = {
  errors?: DateSlotFieldErrors[];
  slots: DateSlotDraft[];
  onChange: (slots: DateSlotDraft[]) => void;
};

export function DateSlotsField({
  errors,
  slots,
  onChange,
}: DateSlotsFieldProps) {
  const { t } = useI18n();

  const updateSlot = (index: number, patch: Partial<DateSlotDraft>) => {
    onChange(
      slots.map((slot, slotIndex) =>
        slotIndex === index ? { ...slot, ...patch } : slot,
      ),
    );
  };

  const removeSlot = (index: number) => {
    onChange(slots.filter((_, slotIndex) => slotIndex !== index));
  };

  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {slots.map((slot, index) => (
          <li
            key={index}
            className="border-b border-rule/60 pb-4 last:border-b-0 last:pb-0"
          >
            <div className="space-y-4">
              <DateTimeFields
                dateLabel={t('rooms.datetime.labels.date')}
                error={errors?.[index]?.startsAt}
                floatingLabel
                groupLabel={t(
                  'rooms.detail.polls.createDialog.date.startLabel',
                )}
                idPrefix={`poll-slot-${index}-starts`}
                onChange={(patch) =>
                  updateSlot(index, {
                    ...(patch.date !== undefined
                      ? { startsDate: patch.date }
                      : {}),
                    ...(patch.time !== undefined
                      ? { startsTime: patch.time }
                      : {}),
                  })
                }
                timeLabel={t('rooms.datetime.labels.time')}
                value={{
                  date: slot.startsDate,
                  time: slot.startsTime,
                }}
              />

              <DateTimeFields
                dateLabel={t('rooms.datetime.labels.date')}
                error={errors?.[index]?.endsAt}
                floatingLabel
                groupLabel={t('rooms.detail.polls.createDialog.date.endLabel')}
                idPrefix={`poll-slot-${index}-ends`}
                onChange={(patch) =>
                  updateSlot(index, {
                    ...(patch.date !== undefined
                      ? { endsDate: patch.date }
                      : {}),
                    ...(patch.time !== undefined
                      ? { endsTime: patch.time }
                      : {}),
                  })
                }
                timeLabel={t('rooms.datetime.labels.time')}
                value={{
                  date: slot.endsDate,
                  time: slot.endsTime,
                }}
              />

              {slots.length > 2 ? (
                <Button
                  size="sm"
                  type="button"
                  variant="ghost"
                  onClick={() => removeSlot(index)}
                >
                  {t('rooms.detail.polls.createDialog.date.removeSlot')}
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <Button
        prependIcon="plus"
        size="sm"
        type="button"
        variant="ghost"
        onClick={() => onChange([...slots, createEmptyDateSlot()])}
      >
        {t('rooms.detail.polls.createDialog.date.addSlot')}
      </Button>
    </div>
  );
}
