import type { ReactNode } from 'react';

const filterChipBaseClassName =
  'inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-md px-4 text-sm leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus-visible:ring-offset-2';

const filterChipActiveClassName =
  'border-2 border-brick bg-brick-soft font-semibold text-ink-2';

const filterChipInactiveClassName =
  'border-2 border-rule bg-transparent font-medium text-ink-2 hover:text-ink';

const filterChipGroupScrollClassName =
  '-mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:-mx-[var(--app-desktop-content-inset)] lg:px-[var(--app-desktop-content-inset)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

export interface FilterChipOption {
  ariaLabel?: string;
  isActive?: boolean;
  key: string;
  label: ReactNode;
  onSelect: () => void;
}

export interface FilterChipProps {
  ariaLabel?: string;
  children: ReactNode;
  isActive?: boolean;
  onClick: () => void;
}

export function FilterChip({
  ariaLabel,
  children,
  isActive = false,
  onClick,
}: FilterChipProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={isActive}
      onClick={onClick}
      className={[
        filterChipBaseClassName,
        isActive ? filterChipActiveClassName : filterChipInactiveClassName,
      ].join(' ')}
    >
      {children}
    </button>
  );
}

export interface FilterChipGroupProps {
  className?: string;
  label?: string;
  options: FilterChipOption[];
}

export function FilterChipGroup({
  className = '',
  label,
  options,
}: FilterChipGroupProps) {
  return (
    <div className={filterChipGroupScrollClassName}>
      <div
        role="group"
        aria-label={label}
        className={['flex flex-nowrap gap-2.5', className]
          .filter(Boolean)
          .join(' ')}
      >
        {options.map((option) => (
          <FilterChip
            key={option.key}
            ariaLabel={option.ariaLabel}
            isActive={option.isActive}
            onClick={option.onSelect}
          >
            {option.label}
          </FilterChip>
        ))}
      </div>
    </div>
  );
}
