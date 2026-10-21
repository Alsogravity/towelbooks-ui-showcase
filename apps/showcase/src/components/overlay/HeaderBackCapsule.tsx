import { HeaderActionCapsule } from './HeaderActionCapsule';

export type HeaderBackCapsuleProps = {
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
  onClick: () => void;
  tabIndex?: number;
};

/**
 * Single-slot capsule back control for panel/dialog/app header titles.
 * Matches the visual language of a close-only HeaderActionCapsule.
 */
export function HeaderBackCapsule({
  ariaLabel,
  className = 'app-mobile-header__actions app-mobile-header__back-capsule',
  disabled = false,
  onClick,
  tabIndex,
}: HeaderBackCapsuleProps) {
  return (
    <HeaderActionCapsule
      className={className}
      primary={{
        ariaLabel,
        disabled,
        iconName: 'chevron-left',
        onClick,
        tabIndex,
      }}
    />
  );
}
