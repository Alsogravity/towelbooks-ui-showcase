import type { ReactNode } from 'react';

type SettingsOptionGroupProps = {
  legend: ReactNode;
  children: ReactNode;
  className?: string;
};

export function SettingsOptionGroup({
  legend,
  children,
  className = '',
}: SettingsOptionGroupProps) {
  return (
    <fieldset className={className}>
      <legend className="sr-only">{legend}</legend>
      <div className="grid gap-3 lg:grid-cols-3">{children}</div>
    </fieldset>
  );
}

type SettingsOptionCardProps = {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  label: ReactNode;
  description?: ReactNode;
  titlePrefix?: ReactNode;
  detail?: ReactNode;
};

export function SettingsOptionCard({
  name,
  value,
  checked,
  onChange,
  label,
  description,
  titlePrefix,
  detail,
}: SettingsOptionCardProps) {
  return (
    <label className="block h-full cursor-pointer">
      <input
        checked={checked}
        className="peer sr-only"
        name={name}
        onChange={onChange}
        type="radio"
        value={value}
      />
      <div
        className={[
          'flex h-full flex-col items-start justify-center rounded-xl border border-rule bg-paper-2/60 p-4 transition-colors',
          'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brick',
          'peer-checked:border-brick peer-checked:bg-brick-soft/25 peer-checked:shadow-2',
        ].join(' ')}
      >
        <div className="label inline-flex items-center gap-2 text-ink">
          {titlePrefix}
          {label}
        </div>
        {description ? (
          <p className="supporting-copy mt-1 text-ink-2">{description}</p>
        ) : null}
        {detail}
      </div>
    </label>
  );
}
