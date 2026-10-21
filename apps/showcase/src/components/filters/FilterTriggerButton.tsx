import { ToolbarIconButton } from '../primitives';

export type FilterTriggerButtonProps = {
  activeCount: number;
  ariaLabel: string;
  controlsId: string;
  isOpen: boolean;
  onToggle: () => void;
};

export function FilterTriggerButton({
  activeCount,
  ariaLabel,
  controlsId,
  isOpen,
  onToggle,
}: FilterTriggerButtonProps) {
  return (
    <ToolbarIconButton
      type="button"
      icon="list-filter"
      badgeCount={activeCount}
      isActive={isOpen}
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls={controlsId}
      aria-label={ariaLabel}
    />
  );
}
