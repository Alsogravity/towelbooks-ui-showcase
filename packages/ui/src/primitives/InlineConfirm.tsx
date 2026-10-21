'use client';

import { useState, type ReactNode } from 'react';

import { Button } from './Button';
import { type IconName } from './Icon';

export interface InlineConfirmProps {
  /** Optional message shown during the confirmation step. */
  message?: ReactNode;
  /** Label for the confirmation button. */
  confirmLabel: ReactNode;
  /** Label for the cancel button. Defaults to "Cancel". */
  cancelLabel?: ReactNode;
  /** Label for the initial trigger button. */
  triggerLabel?: ReactNode;
  /** Icon for the initial trigger button. */
  triggerIcon?: IconName;
  /** Whether the action is in progress. */
  isLoading?: boolean;
  /** Callback for when the action is confirmed. */
  onConfirm: () => void;
  /** Custom trigger element (replaces the default trigger button). */
  trigger?: ReactNode;
  /** Custom class for the confirmation container. */
  className?: string;
  /** Variant for the confirm button. Defaults to "secondary". */
  confirmVariant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  /** Callback when the confirmation state changes. */
  onConfirmingChange?: (isConfirming: boolean) => void;
}

/**
 * A generic component for inline two-step action confirmation.
 * Replaces a trigger button with a confirmation state (Cancel/Confirm).
 */
export function InlineConfirm({
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  triggerLabel,
  triggerIcon,
  isLoading = false,
  onConfirm,
  trigger,
  className = 'flex items-center gap-3',
  confirmVariant = 'secondary',
  onConfirmingChange,
}: InlineConfirmProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleSetConfirming = (value: boolean) => {
    setIsConfirming(value);
    onConfirmingChange?.(value);
  };

  return (
    <div className="flex items-center">
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          !isConfirming ? 'grid-cols-[1fr]' : 'grid-cols-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div
            className={`flex w-max items-center transition-opacity duration-300 ease-in-out ${
              !isConfirming
                ? 'pointer-events-auto opacity-100'
                : 'pointer-events-none opacity-0'
            }`}
          >
            {!isConfirming &&
              (trigger ? (
                <div onClick={() => handleSetConfirming(true)}>{trigger}</div>
              ) : triggerIcon ? (
                <Button
                  size="sm"
                  variant="ghost"
                  prependIcon={triggerIcon}
                  className="!text-brick hover:!bg-brick/5"
                  onClick={() => handleSetConfirming(true)}
                >
                  {triggerLabel}
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="!text-brick hover:!bg-brick/5"
                  onClick={() => handleSetConfirming(true)}
                >
                  {triggerLabel}
                </Button>
              ))}
          </div>
        </div>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isConfirming ? 'grid-cols-[1fr]' : 'grid-cols-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div
            className={`flex w-max items-center transition-opacity duration-300 ease-in-out ${
              isConfirming
                ? 'pointer-events-auto opacity-100'
                : 'pointer-events-none opacity-0'
            }`}
          >
            {isConfirming && (
              <div className={className}>
                {message && (
                  <span className="text-[13px] text-ink-2">{message}</span>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleSetConfirming(false)}
                  disabled={isLoading}
                >
                  {cancelLabel}
                </Button>
                <Button
                  size="sm"
                  variant={confirmVariant}
                  isLoading={isLoading}
                  onClick={onConfirm}
                >
                  {confirmLabel}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
