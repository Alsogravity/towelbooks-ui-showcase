import { Button } from '../primitives';

export interface AppearanceEditIconButtonProps {
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
  onClick: () => void;
}

export function AppearanceEditIconButton({
  ariaLabel,
  className,
  disabled,
  onClick,
}: AppearanceEditIconButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      icon="image-pen"
      iconSize={16}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={[
        '!size-6 !min-h-6 !min-w-6 shrink-0 !border !border-ink/20 !bg-paper-2 !p-0 !text-ink-3 shadow-md',
        '[&_.vui-button__icon]:!text-ink-3 hover:!bg-paper-3 hover:!text-ink active:!scale-95',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  );
}
