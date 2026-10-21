import { BUTTON_ICON_SIZE } from '@towelbooks/ui';

import { Icon } from './Icon';

export const MODAL_CHROME_ICON_SIZE = BUTTON_ICON_SIZE;

export const modalCloseButtonClassName =
  'inline-flex shrink-0 items-center justify-center text-ink-3 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rule disabled:opacity-50';

export type ModalCloseButtonProps = {
  'aria-label': string;
  disabled?: boolean;
  onClick: () => void;
};

export function ModalCloseButton({
  'aria-label': ariaLabel,
  disabled = false,
  onClick,
}: ModalCloseButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={modalCloseButtonClassName}
    >
      <Icon name="x" size={MODAL_CHROME_ICON_SIZE} />
    </button>
  );
}
