import { FormSection } from '../../../../../components/primitives';
import { useI18n } from '../../../../../i18n';
import { Switch } from '@towelbooks/ui';

import { DateSlotsField, type DateSlotDraft } from './DateSlotsField';
import {
  ReadingOptionsField,
  type ReadingOptionDraft,
} from './ReadingOptionsField';
import { TextOptionsField } from './TextOptionsField';

import type { DateSlotFieldErrors } from './DateSlotsField';
import type { PollKind } from '@towelbooks/schemas';
import type { IconName } from '@towelbooks/ui';

const OPTION_SECTION_ICONS: Record<PollKind, IconName> = {
  general: 'list',
  reading: 'library',
  scheduling: 'calendar-clock',
};

type PollOptionsSectionProps = {
  allowMultiple: boolean;
  dateSlotErrors: DateSlotFieldErrors[];
  dateSlots: DateSlotDraft[];
  kind: PollKind;
  onAllowMultipleChange: (value: boolean) => void;
  onDateSlotsChange: (slots: DateSlotDraft[]) => void;
  onReadingOptionsChange: (options: ReadingOptionDraft[]) => void;
  onTextOptionsChange: (options: string[]) => void;
  readingOptions: ReadingOptionDraft[];
  textOptions: string[];
};

export function PollOptionsSection({
  allowMultiple,
  dateSlotErrors,
  dateSlots,
  kind,
  onAllowMultipleChange,
  onDateSlotsChange,
  onReadingOptionsChange,
  onTextOptionsChange,
  readingOptions,
  textOptions,
}: PollOptionsSectionProps) {
  const { t } = useI18n();

  return (
    <FormSection
      icon={OPTION_SECTION_ICONS[kind]}
      title={t('rooms.detail.polls.createDialog.sections.options')}
      withDivider
    >
      {kind === 'reading' ? (
        <ReadingOptionsField
          options={readingOptions}
          onChange={onReadingOptionsChange}
        />
      ) : kind === 'scheduling' ? (
        <DateSlotsField
          errors={dateSlotErrors}
          slots={dateSlots}
          onChange={onDateSlotsChange}
        />
      ) : (
        <>
          <TextOptionsField
            options={textOptions}
            onChange={onTextOptionsChange}
          />
          <div className="flex flex-row items-center justify-between gap-3 py-2 text-sm text-ink-2 sm:gap-6">
            <span className="min-w-0 flex-1">
              {t(
                'rooms.detail.polls.createDialog.settings.multipleChoiceLabel',
              )}
            </span>
            <Switch
              aria-label={t(
                'rooms.detail.polls.createDialog.settings.multipleChoiceLabel',
              )}
              checked={allowMultiple}
              onCheckedChange={onAllowMultipleChange}
            />
          </div>
        </>
      )}
    </FormSection>
  );
}
