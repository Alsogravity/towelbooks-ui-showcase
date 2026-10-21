import { Icon } from '../primitives';

export type FilterSelectableOptionProps = {
  appearance?: 'default' | 'removable-chip';
  disabled?: boolean;
  id?: string;
  isSelected: boolean;
  label: string;
  onToggle: () => void;
};

export function FilterSelectableOption({
  appearance = 'default',
  disabled = false,
  id,
  isSelected,
  label,
  onToggle,
}: FilterSelectableOptionProps) {
  const isRemovableChip = appearance === 'removable-chip';

  return (
    <button
      disabled={disabled}
      id={id}
      type="button"
      aria-pressed={isSelected}
      onClick={onToggle}
      className={[
        'inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-pill border py-1.5 app-text-body-sm tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        isSelected
          ? isRemovableChip
            ? 'border-brick-light bg-brick-light px-3 pl-2 font-medium text-paper shadow-sm dark:text-night-fg'
            : 'border-brick bg-brick px-3 pl-2 font-bold text-paper shadow-sm'
          : 'border-rule bg-vellum/50 px-4 font-normal text-ink-2 hover:border-ink-3 hover:bg-vellum dark:border-night-fg/30 dark:hover:border-night-fg/50',
      ].join(' ')}
    >
      {isSelected ? (
        <span
          aria-hidden
          className={[
            'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
            isRemovableChip ? 'bg-night/60' : 'bg-paper/25',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <Icon name="x" size={12} strokeWidth={2.5} />
        </span>
      ) : null}
      <span>{label}</span>
    </button>
  );
}
