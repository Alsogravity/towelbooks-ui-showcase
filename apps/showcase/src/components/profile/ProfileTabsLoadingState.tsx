import { Icon, type IconName } from '../primitives';

export interface ProfileTabsLoadingStateProps {
  icon: IconName;
  label: string;
}

export function ProfileTabsLoadingState({
  icon,
  label,
}: ProfileTabsLoadingStateProps) {
  const accessibleLabel = label.replace(/\s*(?:\.{1,3}|…)\s*$/, '');

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="profile-tabs-loading-state flex h-full min-h-[280px] cursor-default select-none flex-col items-center justify-center gap-4 py-6 text-center text-ink-4"
    >
      <div className="profile-tabs-loading-state__icon-shell">
        <Icon
          name={icon}
          size={52}
          strokeWidth={1.6}
          className="profile-tabs-loading-state__icon"
        />
      </div>
      <p className="app-text-supporting-copy max-w-[28rem] text-ink-3">
        <span>{accessibleLabel}</span>
        <span aria-hidden="true" className="profile-tabs-loading-state__dots">
          <span className="profile-tabs-loading-state__dots-track">...</span>
        </span>
      </p>
    </div>
  );
}
