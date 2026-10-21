import {
  POLL_OPTION_LABEL_MAX_LENGTH,
  POLL_OPTIONS_MAX_COUNT,
} from '@towelbooks/schemas';

import { Button, FormTextField } from '../../../../../components/primitives';
import { useI18n } from '../../../../../i18n';

type TextOptionsFieldProps = {
  options: string[];
  onChange: (options: string[]) => void;
};

export function TextOptionsField({ options, onChange }: TextOptionsFieldProps) {
  const { t } = useI18n();
  const canAddOption = options.length < POLL_OPTIONS_MAX_COUNT;

  const updateOption = (index: number, value: string) => {
    onChange(
      options.map((option, optionIndex) =>
        optionIndex === index ? value : option,
      ),
    );
  };

  const removeOption = (index: number) => {
    onChange(options.filter((_, optionIndex) => optionIndex !== index));
  };

  return (
    <div className="space-y-2">
      <ul className="space-y-2">
        {options.map((option, index) => (
          <li key={index} className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <FormTextField
                id={`create-poll-option-${index}`}
                label={t('rooms.detail.polls.createDialog.optionPlaceholder', {
                  values: { number: index + 1 },
                })}
                maxLength={POLL_OPTION_LABEL_MAX_LENGTH}
                value={option}
                onChange={(event) => updateOption(index, event.target.value)}
              />
            </div>
            {options.length > 2 ? (
              <Button
                aria-label={t('rooms.detail.polls.createDialog.removeOption')}
                icon="x"
                iconSize={16}
                size="sm"
                type="button"
                variant="ghost"
                onClick={() => removeOption(index)}
              />
            ) : null}
          </li>
        ))}
      </ul>

      <Button
        disabled={!canAddOption}
        prependIcon="plus"
        size="md"
        type="button"
        variant="ghost"
        onClick={() => {
          if (canAddOption) {
            onChange([...options, '']);
          }
        }}
      >
        {t('rooms.detail.polls.createDialog.addOption')}
      </Button>
    </div>
  );
}
