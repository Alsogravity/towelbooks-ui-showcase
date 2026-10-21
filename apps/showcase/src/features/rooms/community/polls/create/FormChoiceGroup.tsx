import {
  FieldLegend,
  FieldSet,
  Icon,
} from '../../../../../components/primitives';

import type { IconName } from '@towelbooks/ui';

type FormChoiceGroupProps = {
  label: string;
  onChange: (value: string) => void;
  options: { icon?: IconName; label: string; value: string }[];
  value: string;
};

export function FormChoiceGroup({
  label,
  onChange,
  options,
  value,
}: FormChoiceGroupProps) {
  return (
    <FieldSet className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <FieldLegend>{label}</FieldLegend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                selected
                  ? 'border-brick/50 bg-brick/5 text-ink'
                  : 'border-rule/80 text-ink-2 hover:bg-rule/10'
              }`}
              onClick={() => onChange(option.value)}
            >
              {option.icon ? <Icon name={option.icon} size={16} /> : null}
              {option.label}
            </button>
          );
        })}
      </div>
    </FieldSet>
  );
}
